import { CrowdinConfig } from "./types";
export declare const CROWDIN: {
    API_URL: string;
    BRANCH_NAME: string;
    DEFAULT_SOURCE_LANG: string;
};
export declare const LANGUAGE_CODES: {
    japanese: string;
    spanish: string;
    chineseSimplified: string;
    french: string;
    german: string;
    portuguese: string;
    italian: string;
    dutch: string;
    polish: string;
    romanian: string;
    korean: string;
};
export declare const FILE_PATHS: {
    getLanguagePaths: (lang: string) => {
        tsPath: string;
        jsonPath: string;
    };
};
export declare const BUILD_CONFIG: {
    skipUntranslatedStrings: boolean;
    skipUntranslatedFiles: boolean;
    exportApprovedOnly: boolean;
};
export declare const generateLanguagePaths: (langs: string[], filePath: string, supportDevice: CrowdinConfig[]) => any[];
export declare const handleDevicesPath: (langs: string[], filePath: string) => Record<string, string>;
