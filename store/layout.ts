import { defineStore } from "pinia";

export interface ModalPosition {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export const useLayoutStore = defineStore("layout", {
  state: () => ({
    modalPosition: {
      top: 107,
      left: 0,
      right: 0,
      bottom: 0,
    } as ModalPosition,
    layoutType: undefined as string | undefined,
    isNightMode: false,
  }),
});
