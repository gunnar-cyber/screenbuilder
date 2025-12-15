export interface TranslationStats {
  languageId: string;
  total: number;
  approved: number;
  translated: number;
  untranslated: number;
  preTranslateAppliedTo: number;
  translationProgress: number;
  approvalProgress: number;
}

export interface StatusSummary {
  needsAction: boolean;
  isComplete: boolean;
  actionMessage: string;
}

export interface BuildStatus {
  status: 'finished' | 'failed' | 'inProgress' | 'created';
}

export interface UploadResult {
  fileId: number;
  storageId: number;
  branchId: number;
}

export interface CrowdinConfig {
  id: string; // should be folder name of device
  FILE_NAME: string;
  SUPPORTED_LANGUAGES: string[];
  paths: any;
  dataFromTypeScript?: boolean; // if true, data is from TypeScript file
  logsStatus: {
    translationStatus: boolean;
  };
}