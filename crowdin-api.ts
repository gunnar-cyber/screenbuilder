import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import fetch from 'cross-fetch';
import extract from 'extract-zip';
import dotenv from "dotenv";
import JsonHandler from './utils/jsonHandler';
import { CROWDIN, BUILD_CONFIG } from './constants';
import { TranslationReporter } from './utils/translationReporter';
import { CrowdinConfig, TranslationStats, UploadResult } from './types';

class CrowdinAPI {
  private API_URL: string;
  private BASE_FILENAME: string;
  private FILENAME: string;
  private API_TOKEN: string;
  private projectId: string;
  private BRANCH_NAME: string;
  private paths: CrowdinConfig['paths'];  
  private jsonHandler: JsonHandler;
  private logsStatus: CrowdinConfig['logsStatus'];
  private supportedLanguages: string[];
  private jsonFileName: string;
  private dataFromTypeScript: boolean;

  constructor(config: CrowdinConfig) {
    // Load environment variables
    dotenv.config();
    this.API_URL = CROWDIN.API_URL;
    this.BASE_FILENAME = config.FILE_NAME;
    this.FILENAME = `${this.BASE_FILENAME}.json`;
    this.API_TOKEN = process.env.CROWDIN_API_TOKEN || '';
    this.projectId = process.env.CROWDIN_PROJECT_ID || '';
    this.supportedLanguages = config.SUPPORTED_LANGUAGES,
    this.BRANCH_NAME = CROWDIN.BRANCH_NAME;
    this.paths = config.paths;
    this.logsStatus = config.logsStatus;
    this.jsonFileName = `${this.BASE_FILENAME}.json`;
    this.dataFromTypeScript = config.dataFromTypeScript || false;

    // Validate required environment variables
    if (!this.API_TOKEN || !this.projectId) {
      console.error('Missing required environment variables: CROWDIN_API_TOKEN and/or CROWDIN_PROJECT_ID');
      process.exit(1);
    }

    this.jsonHandler = new JsonHandler(process.cwd(), 'en');
  }

  private async readSourceFile(): Promise<Record<string, string>> {
    console.log('Reading source file...');
    console.log('Updating en.json from en.ts...');
    const enTsPath = this.paths.enTsPath;
    const enJsonPath = this.paths.enJsonPath;
    
    try {
      const enTsContent = await fs.readFile(enTsPath, 'utf8');
      
      // Extract the object literal from the TypeScript file
      const match = enTsContent.match(/export\s+default\s+({[\s\S]*?});?\s*$/);
      if (!match) {
        throw new Error('Could not find export default statement in en.ts');
      }

      // Get the object literal and parse it
      const objectLiteral = match[1];
      
      // Safely evaluate the object literal
      const enJson = Function(`return ${objectLiteral}`)() as Record<string, string>;
      // Use JsonHandler to write the file
      await this.jsonHandler.writeJson(enJsonPath, enJson);
      console.log(`✓ en.json updated successfully`);
  
      return enJson;
    } catch (error) {
      console.error('Error reading source file:', error);
      throw error;
    }
  }

  private async checkBuildStatus(projectId: string, buildId: number): Promise<string> {
    const statusResponse = await fetch(
      `${this.API_URL}/projects/${projectId}/translations/builds/${buildId}`,
      {
        headers: { Authorization: `Bearer ${this.API_TOKEN}` }
      }
    );

    if (!statusResponse.ok) {
      throw new Error(`Failed to get build status: ${await statusResponse.text()}`);
    }

    const { data: build } = await statusResponse.json() as { data: { status: string } };
    return build.status;
  }

  private async waitForBuild(projectId: string, buildId: number): Promise<void> {
    console.log('⏳ Waiting for build to complete...');
    
    while (true) {
      const buildStatus = await this.checkBuildStatus(projectId, buildId);
      console.log(`Build status: ${buildStatus}`);

      if (buildStatus === 'finished') {
        console.log('Build created successfully:', buildId);
        return;
      }

      if (buildStatus === 'failed') {
        throw new Error('Build failed');
      }

      // Wait for 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  private async createBuild(projectId: string, branchId: number): Promise<{ id: number }> {
    console.log('\n🔄 Creating build...');
    const buildResponse = await fetch(
      `${this.API_URL}/projects/${projectId}/translations/builds`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchId: branchId,
          targetLanguageIds: this.supportedLanguages,
          ...BUILD_CONFIG
        })
      }
    );

    if (!buildResponse.ok) {
      throw new Error(`Build creation failed: ${await buildResponse.text()}`);
    }

    const { data: build } = await buildResponse.json() as { data: { id: number } };
    console.log('🔄 Build initiated successfully:', build);
    console.log(`📦 Build ID: ${build.id}`);

    return build;
  }

  private async uploadSourceStrings(projectId: string, content: Record<string, string>): Promise<UploadResult> {
    let fileId: number;
    let branchId: number;
    
    try {
      // Step 1: Prepare content
      console.log('📝 Preparing content...');
      const contentString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      const contentBuffer = Buffer.from(contentString);
      console.log(`✓ Content prepared (${(contentBuffer.length / 1024).toFixed(2)} KB)`);

      // Step 2: Upload to storage
      console.log('⬆️  Uploading to Crowdin storage...');
      const storageResponse = await fetch(
        `${this.API_URL}/storages`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${this.API_TOKEN}`,
            'Crowdin-API-FileName': this.FILENAME
          },
          body: contentBuffer
        }
      );

      if (!storageResponse.ok) {
        throw new Error(`Storage creation failed: ${await storageResponse.text()}`);
      }

      const { data: storage } = await storageResponse.json() as { data: { id: number } };
      const storageId = storage.id;
      console.log('✓ Storage created successfully');

      // Step 3: Check for existing branch
      console.log('🌿 Checking for existing branch...');
      const branchesResponse = await fetch(
        `${this.API_URL}/projects/${projectId}/branches`,
        {
          headers: { Authorization: `Bearer ${this.API_TOKEN}` }
        }
      );
      const { data: branches } = await branchesResponse.json() as { data: { data: { name: string, id: number } }[] };
      const existingBranch = branches.find(branch => branch.data.name === this.BRANCH_NAME);  

      if (existingBranch) {
        branchId = existingBranch.data.id;
        console.log(`✓ Using existing branch (ID: ${branchId})`);
      } else {
        const createBranchResponse = await fetch(
          `${this.API_URL}/projects/${projectId}/branches`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: this.BRANCH_NAME })
          }
        );

        if (!createBranchResponse.ok) {
          throw new Error(`Branch creation failed: ${await createBranchResponse.text()}`);
        }

        const { data: newBranch } = await createBranchResponse.json() as { data: {  data: any; id: number } };
        branchId = newBranch.data.id;
        console.log(`✓ Created new branch (ID: ${branchId})`);
      }

      // Step 4: Check for existing files
      console.log('🔍 Checking for existing files...');
      const filesResponse = await fetch(
        `${this.API_URL}/projects/${projectId}/files?branchId=${branchId}`,
        {
          headers: { Authorization: `Bearer ${this.API_TOKEN}` }
        }
      );

      const { data: files } = await filesResponse.json() as { data: { data: { name: string, id: number, branchId: number } }[] };
      console.log('Files in branch:', files.map((f: { data: { name: string, id: number, branchId: number } }) => ({
        name: f.data.name,  
        id: f.data.id,
        branchId: f.data.branchId
      })));

      const existingFile = files.find((file: { data: { name: string } }) => file.data.name === this.FILENAME);

      if (existingFile) {
        // Update existing file
        console.log(`📝 Updating existing file (ID: ${existingFile.data.id})...`);
        const updateResponse = await fetch(
          `${this.API_URL}/projects/${projectId}/files/${existingFile.data.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${this.API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              storageId,
              updateOption: 'clear_translations_and_approvals'
            })
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.log('Update response:', errorText);
          throw new Error(`File update failed: ${errorText}`);
        }

        fileId = existingFile.data.id;
        console.log('✓ File updated successfully');
      } else {
        // Create new file
        console.log('📝 Creating new file in branch...');
        const createFileResponse = await fetch(
          `${this.API_URL}/projects/${projectId}/files`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              storageId,
              name: this.FILENAME,
              branchId: branchId
            })
          }
        );

        if (!createFileResponse.ok) {
          const errorText = await createFileResponse.text();
          console.log('Creation response:', errorText);
          throw new Error(`File creation failed: ${errorText}`);
        }

        const { data: newFile } = await createFileResponse.json() as { data: { id: number } };
        fileId = newFile.id;
        console.log('✓ File created successfully in branch');
      }

      return { fileId, storageId, branchId };

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async updateTypeScriptFile(jsonPath: string, tsPath: string): Promise<void> {
    console.log('Updating TypeScript file...');
    
    try {
      // Read the JSON content
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      
      if (this.dataFromTypeScript) {
        // Create TypeScript content with proper formatting
        const tsContent = `// This file is auto-generated. Do not edit manually.
        export default ${jsonContent} as const;
        `;

        // Write TypeScript file
        await fs.writeFile(tsPath, tsContent);
        console.log(`✓ TypeScript file updated: ${tsPath}`);
      }
    } catch (error) {
      throw new Error(`Failed to update TypeScript file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async downloadAndExtractBuild(projectId: string, buildId: number): Promise<boolean> {
    console.log('\nDownloading build...');
    
    const downloadResponse = await fetch(
      `${this.API_URL}/projects/${projectId}/translations/builds/${buildId}/download`,
      {
        headers: { Authorization: `Bearer ${this.API_TOKEN}` }
      }
    );

    if (!downloadResponse.ok) {
      throw new Error(`Failed to get download URL: ${await downloadResponse.text()}`);
    }

    const { data: downloadData } = await downloadResponse.json() as { data: { url: string } };
    console.log(`Build download URL: ${downloadData.url}`);

    // Download and extract
    console.log('Downloading and extracting build...');
    const response = await fetch(downloadData.url) as any;
    if (!response.ok) {
      throw new Error('Failed to download translations');
    }

    const TEMP_DIR = path.join(process.cwd(), 'tools', 'crowdin', 'temp');

    try {
      await fs.access(TEMP_DIR);
    } catch {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    }

    const tempZipPath = path.join(TEMP_DIR, 'crowdin-translations.zip');
    const writeStream = createWriteStream(tempZipPath);
    
    if (!response.body) {
      throw new Error('Response body is null');
    }

    await new Promise((resolve, reject) => {
      response.body.pipe(writeStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    // Extract files
    const extractDir = path.join(TEMP_DIR, 'crowdin-extract');
    await fs.rm(extractDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(extractDir, { recursive: true });
    
    try {
      await extract(tempZipPath, { dir: extractDir });
      console.log('✓ Extracted translation files');

      // List all files in extracted directory
      const listFiles = async (dir: string, indent = '') => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          console.log(`${indent}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}`);
          if (entry.isDirectory()) {
            await listFiles(fullPath, `${indent}  `);
          }
        }
      };

      console.log('\nExtracted files structure:');
      await listFiles(extractDir);

      // Find the Japanese translation file recursively
      const findTranslationFile = async (dir: string, lang: string): Promise<string | null> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const found = await findTranslationFile(fullPath, lang);
            if (found) return found;
          } else if (
            entry.name === `${lang}.json` || 
            entry.name === this.jsonFileName || 
            entry.name.toLowerCase().includes('japanese') ||
            entry.name.endsWith('.json')
          ) {
            return fullPath;
          }
        }
        return null;
      };

      // Process each supported language
      for (const lang of this.supportedLanguages) {
        const langDir = path.join(extractDir, lang);
        const translationFile = path.join(langDir, this.jsonFileName);
        
        console.log(`\nProcessing ${lang} translations from: ${translationFile}`);

        // Save JSON translations using JsonHandler
        const jsonPath = this.paths[`${lang}JsonPath`];
        const translations = await this.jsonHandler.readJson(translationFile);
        
        // Validate translations before saving
        const { formatted, issues } = this.jsonHandler.validateTranslations(translations, lang);
        
        if (issues.length > 0) {
          console.warn(`\n⚠️ Translation issues found for ${lang}:`);
          issues.forEach((issue: { message: string }) => console.warn(`- ${issue.message}`));
        }

        await this.jsonHandler.writeJson(jsonPath, formatted);
        console.log(`✓ JSON translations saved to: ${jsonPath}`);

        // Update TypeScript file
        const tsPath = this.paths[`${lang}TsPath`];
        await this.updateTypeScriptFile(jsonPath, tsPath);
      }

      // Cleanup
      await fs.unlink(tempZipPath).catch(() => {});
      await fs.rm(extractDir, { recursive: true, force: true }).catch(() => {});

      return true;
    } catch (error) {
      console.error('Error during extraction:', error);
      // Cleanup on error
      await fs.unlink(tempZipPath).catch(() => {});
      await fs.rm(extractDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }

  private async getTranslationDetailsBasedOnSource(projectId: string, fileId: number): Promise<TranslationStats[]> {
    console.log('\n🔍 Getting translation status for all languages...');
    
    const progressResponse = await fetch(
        `${this.API_URL}/projects/${projectId}/files/${fileId}/languages/progress`,
        {
            headers: { Authorization: `Bearer ${this.API_TOKEN}` }
        }
    );

    if (!progressResponse.ok) {
        throw new Error(`Failed to get progress: ${await progressResponse.text()}`);
    }

    const { data: progressData } = await progressResponse.json() as any;
    const stats: TranslationStats[] = [];

    for (const lang of this.supportedLanguages) {
        const langProgress = progressData.find((item: { data: { languageId: string } }) => {
          return  item.data.languageId === lang
        })?.data;
        
        if (!langProgress) {
            console.warn(`Warning: Progress data not found for ${lang}`);
            continue;
        }

        const langStats: TranslationStats = {
            languageId: lang,
            total: langProgress.phrases.total,
            approved: langProgress.phrases.approved,
            translated: langProgress.phrases.translated - langProgress.phrases.approved,
            untranslated: langProgress.phrases.total - langProgress.phrases.translated,
            preTranslateAppliedTo: langProgress.words.preTranslateAppliedTo,
            translationProgress: langProgress.translationProgress,
            approvalProgress: langProgress.approvalProgress,
        };

        stats.push(langStats);
        TranslationReporter.logTranslationStatus(langStats);
    }

    return stats;
  }

  public async main(): Promise<void> {
    try {
      const projectId = this.projectId;
      let content = await this.jsonHandler.readJson(this.paths[`${CROWDIN.DEFAULT_SOURCE_LANG}JsonPath`]) as any;
      if (this.dataFromTypeScript) {
         content = await this.readSourceFile();
      }

      const { fileId, branchId } = await this.uploadSourceStrings(projectId, content);

      if (this.logsStatus.translationStatus) {
        const translationStats = await this.getTranslationDetailsBasedOnSource(projectId, fileId);
        translationStats.forEach(stats => {
          const { needsAction, actionMessage } = TranslationReporter.getStatusSummary(stats);
          if (needsAction) {
            console.log(actionMessage);
          }
        });
      }
      
      const build = await this.createBuild(projectId, branchId);
      await this.waitForBuild(projectId, build.id);
      await this.downloadAndExtractBuild(projectId, build.id);

      console.log('\n✨ Translation process completed successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }
}

export default CrowdinAPI;