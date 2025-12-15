interface TranslationIssue {
    key: string;
    type: 'missing' | 'placeholder_mismatch';
    message: string;
}
interface ValidationResult {
    formatted: Record<string, string>;
    issues: TranslationIssue[];
}
/**
 * JSON Translation Handler
 */
export default class JsonHandler {
    private basePath;
    private sourceLanguage;
    /**
     * @param basePath - Base path for locale files
     * @param sourceLanguage - Source language code
     */
    constructor(basePath: string, sourceLanguage?: string);
    /**
     * Read JSON file
     * @param filePath - Path to JSON file
     * @returns Promise with parsed JSON content
     */
    readJson(filePath: string): Promise<Record<string, string>>;
    /**
     * Write JSON file
     * @param filePath - Path to save JSON file
     * @param data - Data to save
     */
    writeJson(filePath: string, data: Record<string, string>): Promise<void>;
    /**
     * Merge translations with source language
     * @param source - Source language translations
     * @param target - Target language translations
     * @returns Merged translations
     */
    mergeWithSource(source: Record<string, string>, target: Record<string, string>): Record<string, string>;
    /**
     * Validate translations
     * @param translations - Translations to validate
     * @param language - Language code
     * @returns Validation result with formatted translations and issues
     */
    validateTranslations(translations: Record<string, string>, language: string): ValidationResult;
    /**
     * Process translations
     * @param extractPath - Path to extracted translations
     * @param targetLanguage - Target language code
     * @returns Promise with processed translations
     */
    processTranslations(extractPath: string, targetLanguage: string): Promise<Record<string, string>>;
}
export {};
