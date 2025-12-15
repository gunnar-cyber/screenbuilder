export declare function executeTranslationsConcurrently(generateConfigPaths: any[]): Promise<{
    successfulDevices: string[];
    failedDevices: {
        device: string;
        fileName: string;
        error: string;
    }[];
    duration: string;
}>;
