import { createApp, Directive } from "vue";
import App from "./App.vue";
import "./assets/styles/tailwind.css";
import { store } from "@/store";
import { i18n } from '@/classes/Language';
import { LongPress, MultiPress } from '@screenbuilder/components';

createApp(App)
  .use(store)
  .use(i18n)
  .directive('long-press', LongPress.default as Directive<any,any>)
  .directive('multi-press', MultiPress.default as Directive<any,any>)
  .mount("#app");
