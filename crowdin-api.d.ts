import { CrowdinConfig } from './types';
declare class CrowdinAPI {
    private API_URL;
    private BASE_FILENAME;
    private FILENAME;
    private API_TOKEN;
    private projectId;
    private BRANCH_NAME;
    private paths;
    private jsonHandler;
    private logsStatus;
    private supportedLanguages;
    private jsonFileName;
    private dataFromTypeScript;
    constructor(config: CrowdinConfig);
    private readSourceFile;
    private checkBuildStatus;
    private waitForBuild;
    private createBuild;
    private uploadSourceStrings;
    private updateTypeScriptFile;
    private downloadAndExtractBuild;
    private getTranslationDetailsBasedOnSource;
    main(): Promise<void>;
}
export default CrowdinAPI;
