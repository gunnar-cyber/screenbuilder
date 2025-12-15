import { defineStore } from "pinia";
import waveTypes from "../config/waveform.json";
import { WaveformEngine } from "isimulate-screen-builder";
import trendTypes from "../config/trendTypes.json";

export enum PickerAreas {
  Top,
  Middle,
  Bottom,
  Graphic,
  HiFlow,
}
export type trendsXAxisType = {
  margin: number;
  value: string;
};

export const useGraphicWaveformStore = defineStore("graphicWaveform", {
  state: () => ({
    topWaveform: waveTypes.pressure,
    middleWaveform: waveTypes.flow,
    bottomWaveform: waveTypes.volume,
    isGraphicMode: false,
    graphicType: "dynamiclung",
    waveformEngine: undefined as WaveformEngine | undefined,
    trendType: "6Hour",
    trendsXAxisNumbers1Hour: [
      { margin: 22, value: "-60" },
      { margin: 42, value: "-0.50" },
      { margin: 32, value: "-0.40" },
      { margin: 33, value: "-0.30" },
      { margin: 32, value: "-0.20" },
      { margin: 32, value: "-0.10" },
    ] as trendsXAxisType[],
    trendsXAxisNumbers6Hour: [
      { margin: 25, value: "-6" },
      { margin: 52, value: "-5" },
      { margin: 48, value: "-4" },
      { margin: 49, value: "-3" },
      { margin: 48, value: "-2" },
      { margin: 48, value: "-1" },
    ] as trendsXAxisType[],
    trendsXAxisNumbers12Hour: [
      { margin: 22, value: "-12" },
      { margin: 45, value: "-10" },
      { margin: 46, value: "-8" },
      { margin: 48, value: "-6" },
      { margin: 47, value: "-4" },
      { margin: 49, value: "-2" },
    ] as trendsXAxisType[],
    trendsXAxisNumbers24Hour: [
      { margin: 22, value: "-24" },
      { margin: 45, value: "-20" },
      { margin: 43, value: "-16" },
      { margin: 41, value: "-12" },
      { margin: 45, value: "-8" },
      { margin: 47, value: "-4" },
    ] as trendsXAxisType[],
    trendsXAxisNumbers72Hour: [
      { margin: 22, value: "-72" },
      { margin: 45, value: "-60" },
      { margin: 42, value: "-48" },
      { margin: 42, value: "-36" },
      { margin: 41, value: "-24" },
      { margin: 42, value: "-12" },
    ] as trendsXAxisType[],
    showHideHiFlowGraph: true,
  }),
  getters: {
    getTrendXAxisNumbers(): trendsXAxisType[] {
      if (this.trendType === trendTypes["1Hour"]) {
        return this.trendsXAxisNumbers1Hour;
      }
      if (this.trendType === trendTypes["6Hour"]) {
        return this.trendsXAxisNumbers6Hour;
      }
      if (this.trendType === trendTypes["12Hour"]) {
        return this.trendsXAxisNumbers12Hour;
      }
      if (this.trendType === trendTypes["24Hour"]) {
        return this.trendsXAxisNumbers24Hour;
      }
      if (this.trendType === trendTypes["72Hour"]) {
        return this.trendsXAxisNumbers72Hour;
      }
      return [{ margin: 0, value: "0" }];
    },
  },
  actions: {
    resetWaveforms() {
      this.isGraphicMode = false;
      this.topWaveform = waveTypes.pressure;
      this.middleWaveform = waveTypes.flow;
      this.bottomWaveform = waveTypes.volume;
    },
    setTrendsAxixNumbers(trendType: string) {
      this.trendType = trendType;
    },
  },
});
