import { promises as fs } from 'fs';
import path from 'path';
/**
 * JSON Translation Handler
 */
export default class JsonHandler {
    /**
     * @param basePath - Base path for locale files
     * @param sourceLanguage - Source language code
     */
    constructor(basePath, sourceLanguage = 'en') {
        this.basePath = basePath;
        this.sourceLanguage = sourceLanguage;
    }
    /**
     * Read JSON file
     * @param filePath - Path to JSON file
     * @returns Promise with parsed JSON content
     */
    async readJson(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error(`❌ Error reading ${filePath}:`, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    /**
     * Write JSON file
     * @param filePath - Path to save JSON file
     * @param data - Data to save
     */
    async writeJson(filePath, data) {
        try {
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error(`❌ Error writing ${filePath}:`, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    /**
     * Merge translations with source language
     * @param source - Source language translations
     * @param target - Target language translations
     * @returns Merged translations
     */
    mergeWithSource(source, target) {
        const merged = {};
        Object.keys(source).forEach(key => {
            merged[key] = target[key] || source[key];
        });
        return merged;
    }
    /**
     * Validate translations
     * @param translations - Translations to validate
     * @param language - Language code
     * @returns Validation result with formatted translations and issues
     */
    validateTranslations(translations, language) {
        const formatted = {};
        const issues = [];
        Object.entries(translations).forEach(([key, value]) => {
            if (!value) {
                issues.push({
                    key,
                    type: 'missing',
                    message: `Missing translation for key: ${key}`
                });
                formatted[key] = value;
                return;
            }
            // Clean up whitespace
            formatted[key] = value.trim();
            // Check placeholders
            const placeholderRegex = /{{\s*[\w.]+\s*}}/g;
            const sourcePlaceholders = translations[key].match(placeholderRegex) || [];
            const targetPlaceholders = value.match(placeholderRegex) || [];
            if (sourcePlaceholders.length !== targetPlaceholders.length) {
                issues.push({
                    key,
                    type: 'placeholder_mismatch',
                    message: `Placeholder mismatch in key: ${key}`
                });
            }
        });
        return { formatted, issues };
    }
    /**
     * Process translations
     * @param extractPath - Path to extracted translations
     * @param targetLanguage - Target language code
     * @returns Promise with processed translations
     */
    async processTranslations(extractPath, targetLanguage) {
        console.log(`\n📝 Processing ${targetLanguage} translations...`);
        try {
            // Read source language file
            const sourcePath = path.join(this.basePath, `${this.sourceLanguage}.json`);
            const sourceJson = await this.readJson(sourcePath);
            // Read target language file
            const targetPath = path.join(extractPath, targetLanguage, `${this.sourceLanguage}.json`);
            const targetJson = await this.readJson(targetPath);
            // Merge translations
            const merged = this.mergeWithSource(sourceJson, targetJson);
            // Validate translations
            const { formatted, issues } = this.validateTranslations(merged, targetLanguage);
            // Report issues
            if (issues.length > 0) {
                console.warn(`\n⚠️ Translation issues found for ${targetLanguage}:`);
                issues.forEach(issue => console.warn(`- ${issue.message}`));
            }
            console.log(`✓ ${targetLanguage} translations processed successfully`);
            return formatted;
        }
        catch (error) {
            console.error(`❌ Error processing ${targetLanguage} translations:`, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
}
