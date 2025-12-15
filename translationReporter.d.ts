import type { TranslationStats } from '../types';
export declare class TranslationReporter {
    static formatProgressBar(percentage: number): string;
    static logTranslationStatus(stats: TranslationStats): void;
    static getProgressBar(percent: number): string;
    static getStatusSummary(stats: TranslationStats): {
        needsAction: boolean;
        actionMessage: string;
    };
}
