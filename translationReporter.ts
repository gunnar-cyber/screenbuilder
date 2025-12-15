import type { TranslationStats, StatusSummary } from '../types';

export class TranslationReporter {
  static formatProgressBar(percentage: number): string {
    const barLength = 20;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    return `[${bar}] ${percentage}%`;
  }

  static logTranslationStatus(stats: TranslationStats): void {
    console.log(`\n📊 ${stats.languageId.toUpperCase()} Translation Status:`);
    console.log('============================');
    console.log(`Total Strings: ${stats.total}`);
    console.log(`✓ Approved: ${stats.approved}`);
    console.log(`📝 Translated (not approved): ${stats.translated}`);
    console.log(`❌ Untranslated: ${stats.untranslated}`);
    console.log(`🤖 Pre-translated: ${stats.preTranslateAppliedTo}`);
    console.log(`Progress: ${stats.translationProgress}% translated, ${stats.approvalProgress}% approved\n`);

    // Progress bars
    console.log(`Translation Progress: ${this.getProgressBar(stats.translationProgress)}`);
    console.log(`Approval Progress:   ${this.getProgressBar(stats.approvalProgress)}\n`);
  }

  static getProgressBar(percent: number): string {
    const filled = Math.round(percent / 5);
    return `[${'█'.repeat(filled)}${'░'.repeat(20-filled)}] ${percent}%`;
  }

  static getStatusSummary(stats: TranslationStats): { needsAction: boolean; actionMessage: string } {
    const needsAction = stats.untranslated > 0;
    const actionMessage = needsAction 
        ? `⚠️  Action needed for ${stats.languageId.toUpperCase()}: ${stats.untranslated} strings need translation`
        : '';
    return { needsAction, actionMessage };
  }
}