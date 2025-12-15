import { createI18n } from "vue-i18n";
import messages from "@/locale/en.json";

export const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: { en: messages }
});

export function loadLanguageAsync(lang: string) {
  if (i18n.global.locale !== lang) {
    import(`@/locale/${lang}.json`).then(msgs => {
      i18n.global.locale = lang as any;
      i18n.global.setLocaleMessage(lang, msgs);
    });
  }
}
