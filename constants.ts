import path from "path";
import fs from "fs";
import { CrowdinConfig } from "./types";

export const CROWDIN = {
  API_URL: 'https://api.crowdin.com/api/v2',
  BRANCH_NAME: 'screenbuilder',
  DEFAULT_SOURCE_LANG: 'en',
};

// https://support.crowdin.com/developer/language-codes/
export const LANGUAGE_CODES = {
  japanese: "ja",
  spanish: "es-ES",
  chineseSimplified: "zh-CN",
  french: "fr",
  german: "de",
  portuguese: "pt-PT",
  italian: "it",
  dutch: "nl",
  polish: "pl",
  romanian: "ro",
  korean: "ko",
}

export const FILE_PATHS = {
  getLanguagePaths: (lang: string) => ({
    tsPath: `src/translation/${lang}.ts`,
    jsonPath: `src/translation/${lang}.json`
  })
};

export const BUILD_CONFIG = {
  skipUntranslatedStrings: false,
  skipUntranslatedFiles: false,
  exportApprovedOnly: false
}; 

export const generateLanguagePaths = (langs: string[], filePath: string, supportDevice: CrowdinConfig[]) => {
  console.log('Generating language paths for:', langs, filePath, supportDevice);
  // Create base directory if it doesn't exist
  
  // Generate supported device path
  const supportedDevicePath = supportDevice.map((device: any) => ({
    devicePath: path.join(`${filePath}/device`, device.id),
    ...device,
  }));
  
  supportedDevicePath.forEach((device) => {
    device.paths = handleDevicesPath(langs, device.devicePath);
  });

  return supportedDevicePath;
}

export const handleDevicesPath = (langs: string[], filePath: string) => {
  const translationDir = path.join(filePath, 'src/translation');
  if (!fs.existsSync(translationDir)) {
    fs.mkdirSync(translationDir, { recursive: true });
  }

  // Start with source language paths
  const paths: Record<string, string> = {};
  const sourcePaths = FILE_PATHS.getLanguagePaths(CROWDIN.DEFAULT_SOURCE_LANG);
  paths[`${CROWDIN.DEFAULT_SOURCE_LANG}TsPath`] = path.join(filePath, sourcePaths.tsPath);
  paths[`${CROWDIN.DEFAULT_SOURCE_LANG}JsonPath`] = path.join(filePath, sourcePaths.jsonPath);

  // Add supported language paths
  langs.forEach((lang) => {
    const langPaths = FILE_PATHS.getLanguagePaths(lang);
    paths[`${lang}TsPath`] = path.join(filePath, langPaths.tsPath);
    paths[`${lang}JsonPath`] = path.join(filePath, langPaths.jsonPath);
  });

  return paths;
}