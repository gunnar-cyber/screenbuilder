<template>
  <div
    class="bottomWindowSize windowBottomOffset pickerContainer bg-blueGray-50 font-light text-gray-700 flex flex-col"
  >
    <div class="tabRow bg-blueGray-200">
      <div class="closeButtonContainer bg-blueGray-300" @click="close"><div class="bg-blueGray-400">X</div></div>
      <div class="flex justify-end w-full">
        <div
          v-for="(tab, idx) in tabs"
          :key="idx"
          :class="{
            'tab flex justify-center items-center w-1/4 border-l border-gray-400 ': true,
            'bg-blueGray-50': activeTab === idx,
          }"
          :style="{
            borderRightWidth: 1 + 'px',
          }"
          @click="changeTab(idx)"
        >
          <div>{{ tab }}</div>
        </div>
      </div>
    </div>
    <div class="mainArea p-3">
      <div v-if="activeTab === 0" class="border border-gray-300 h-full">
        <div>
          <label class="select-wrapper-hiflow">
            <select class="w-full mt-2 h-9 bg-blueGray-300 disabledButton">
              <option>Flow / Oxygen</option>
            </select>
          </label>
        </div>
        <div
          style="width: 100px"
          class="m-2 p-2 waveButton bg-blueGray-300"
          v-for="trend in trendsButtons"
          :key="trend.key"
          :style="[
            trend.name == '72 h'
              ? { position: 'absolute', left: 120 + 'px', top: 63 + 'px' }
              : { position: 'relative' },
            trend.name == '6 h'
              ? { backgroundColor: '#66bb6a', color: 'white' }
              : { backgroundColor: 'white', border: '2px solid #767776', opacity: 0.2 },
          ]"
          @click="setTrend(trend.key)"
        >
          {{ trend.name }}
        </div>

        <div class="m-2 p-2 waveButton bg-blueGray-300 trendsConfirmBtn disabledButton" @click="confirmTrend()">
          Confirm
        </div>
      </div>
      <div v-if="activeTab === 1" class="border border-gray-300 h-full">
        <div
          style="pointer-events: none"
          v-for="loop in loopButtons"
          :key="loop.key"
          :class="{
            'w-1/2 m-2 p-2 waveButton': true,
            disabledButton: loop.disabled,
            'bg-blueGray-300': activeButtonInTab !== loop.key,
            selected: activeButtonInTab === loop.key,
          }"
          @click="setLoop(loop.key)"
        >
          {{ loop.name }}
        </div>
      </div>
      <div v-if="activeTab === 2" class="border border-gray-300 h-full">
        <div
          v-for="graphic in graphicButtons"
          :key="graphic.key"
          :class="{
            'w-1/3 m-2 p-2 waveButton': true,
            disabledButton: graphic.disabled,
            'bg-blueGray-300': activeButtonInTab !== graphic.key,
            selected: activeButtonInTab === graphic.key,
          }"
          @click="setGraphic(graphic.key)"
        >
          {{ graphic.name }}
        </div>
      </div>
      <div v-else-if="activeTab === 3" class="border border-gray-300 flex h-full">
        <div class="w-1/3 text-left p-2">
          <p>Time scale</p>
          <label class="select-wrapper">
            <select class="w-full mt-2 h-9 bg-blueGray-300 disabledButton" disabled>
              <option>12 s</option>
            </select>
          </label>
        </div>
        <div class="w-2/3 border-l border-gray-300">
          <div
            v-for="waveform in waveformButtons"
            :key="waveform.key"
            :class="{
              'w-1/2 m-2 p-2 waveButton': true,
              disabledButton: waveform.disabled,
              'bg-blueGray-300': activeButtonInTab !== waveform.key,
              selected: activeButtonInTab === waveform.key,
            }"
            @click="setWaveform(waveform.key)"
          >
            {{ waveform.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PickerAreas } from "@/store/graphicsAndWaveForms";
import waveTypes from "../../config/waveform.json";
import graphicTypes from "../../config/graphicTypes.json";
import loopTypes from "../../config/loopTypes.json";
import trendTypes from "../../config/trendTypes.json";
import { GraphicWaveformState, NavigationState } from "@/store";
enum TabTypes {
  Trend,
  Loops,
  Graphics,
  Waveforms,
}
export default defineComponent({
  name: "WaveformGraphicPicker",
  props: ["selectedArea", "isHiFlowGraph"],
  data() {
    return {
      tabs: ["Trends", "Loops", "Graphics", "Waveforms"],
      waveformButtons: [
        { key: waveTypes.pressure, name: "Pressure", disabled: true },
        { key: waveTypes.flow, name: "Flow", disabled: false },
        { key: waveTypes.volume, name: "Volume", disabled: false },
        { key: waveTypes.none, name: "Off", disabled: false },
      ],
      graphicButtons: [
        { key: graphicTypes.dynamicLung, name: "Dynamic Lung", disabled: false },
        { key: graphicTypes.ventStatus, name: "Vent Status", disabled: true },
        { key: graphicTypes.asv, name: "ASV Graph", disabled: true },
      ],
      loopButtons: [
        { key: loopTypes.pressureVolume, name: "Pressure / Volume", disabled: true },
        { key: loopTypes.pressureFlow, name: "Pressure / Flow", disabled: true },
        { key: loopTypes.volumeFlow, name: "Volume / Flow", disabled: true },
      ],
      trendsButtons: [
        { key: trendTypes["1Hour"], name: "1 h", disabled: false },
        { key: trendTypes["6Hour"], name: "6 h", disabled: false },
        { key: trendTypes["12Hour"], name: "12 h", disabled: false },
        { key: trendTypes["24Hour"], name: "24 h", disabled: false },
        { key: trendTypes["72Hour"], name: "72 h", disabled: false },
      ],
      activeTab: 1,
      activeButtonInTab: "",
    };
  },
  mounted() {
    this.setActiveButtonInTab();
    this.activeTab = this.isGraphicMode ? 2 : 3;
    if (this.selectedArea === PickerAreas.Top && !this.isHiFlowGraph) {
      this.activeTab = 3;

      this.waveformButtons = [
        { key: waveTypes.pressure, name: "Pressure", disabled: false },
        { key: waveTypes.flow, name: "Flow", disabled: true },
        { key: waveTypes.volume, name: "Volume", disabled: true },
      ];
      return;
    }

    if (this.selectedArea === PickerAreas.HiFlow && this.isHiFlowGraph) {
      this.activeTab = 3;

      this.waveformButtons = [
        { key: waveTypes.pressure, name: "Pressure", disabled: true },
        { key: waveTypes.flow, name: "Flow", disabled: true },
        { key: waveTypes.volume, name: "Volume", disabled: true },
        { key: waveTypes.none, name: "Off", disabled: false },
      ];
      return;
    }
  },
  computed: {
    isGraphicMode() {
      return GraphicWaveformState.isGraphicMode;
    },
  },
  methods: {
    setActiveButtonInTab() {
      switch (this.selectedArea) {
        case PickerAreas.Top:
          return (this.activeButtonInTab = GraphicWaveformState.topWaveform);
        case PickerAreas.Middle:
          return (this.activeButtonInTab = GraphicWaveformState.middleWaveform);
        case PickerAreas.Bottom:
          return (this.activeButtonInTab = GraphicWaveformState.bottomWaveform);
        case PickerAreas.Graphic:
          return (this.activeButtonInTab = GraphicWaveformState.graphicType);
        case PickerAreas.HiFlow:
          return (this.activeButtonInTab = GraphicWaveformState.showHideHiFlowGraph ? "" : "none");
        default:
          return (this.activeButtonInTab = GraphicWaveformState.topWaveform);
      }
    },
    changeTab(newTab: TabTypes) {
      this.activeTab = newTab;
      //TO DO - Loops all disabled
      switch (newTab) {
        case TabTypes.Trend:
          return (this.activeButtonInTab = GraphicWaveformState.trendType);
        case TabTypes.Graphics:
          return (this.activeButtonInTab = GraphicWaveformState.graphicType);
        case TabTypes.Waveforms:
          return (this.activeButtonInTab = this.selectedArea);
      }
    },
    confirmTrend() {
      GraphicWaveformState.setTrendsAxixNumbers(this.activeButtonInTab);
      this.$emit("close");
    },
    close() {
      NavigationState.resetMainNavigationButtons();
      this.$emit("close");
    },
    setTrend(trendType: string) {
      this.activeButtonInTab = trendType;
    },
    setWaveform(waveType: string) {
      const disabled = this.waveformButtons.find((w) => w.key === waveType)?.disabled;
      if (disabled) return;

      if (this.selectedArea === PickerAreas.Top || waveType === waveTypes.pressure) {
        this.submit();
        return;
      }

      GraphicWaveformState.isGraphicMode = false;

      let secondary = waveType === waveTypes.flow ? waveTypes.volume : waveTypes.flow;
      switch (this.selectedArea) {
        case PickerAreas.Middle:
          GraphicWaveformState.middleWaveform = waveType;
          if (GraphicWaveformState.bottomWaveform === waveType && waveType !== waveTypes.none)
            GraphicWaveformState.bottomWaveform = secondary;
          break;
        case PickerAreas.Bottom:
          GraphicWaveformState.bottomWaveform = waveType;

          if (GraphicWaveformState.middleWaveform === waveType && waveType !== waveTypes.none)
            GraphicWaveformState.middleWaveform = secondary;
          break;
        case PickerAreas.Graphic:
          GraphicWaveformState.middleWaveform = waveType;
          GraphicWaveformState.bottomWaveform = secondary;
          break;
        case PickerAreas.HiFlow:
          GraphicWaveformState.showHideHiFlowGraph =
            waveType === "none" && !GraphicWaveformState.showHideHiFlowGraph ? true : false;

          break;
        default:
          break;
      }

      this.submit();
    },
    setGraphic(graphicType: string) {
      if (graphicType !== graphicTypes.dynamicLung) return;

      GraphicWaveformState.isGraphicMode = true;
      GraphicWaveformState.graphicType = graphicType;
      this.submit();
    },
    setLoop(loopType: string) {
      GraphicWaveformState.isGraphicMode = true;
      GraphicWaveformState.graphicType = loopType;
      this.submit();
    },
    submit() {
      NavigationState.resetMainNavigationButtons();
      this.$emit("close");
    },
  },
});
</script>

<style scoped>
.trendsConfirmBtn {
  position: absolute;
  left: 380px;
  top: 203px;
  width: 170px;
}
.positionTrendsTab {
  position: absolute;
  left: 60px;
  top: 0px;
  height: 50px;
}
.pickerContainer {
  position: absolute;
  left: 0;
}

.tabRow {
  height: 50px;
  display: flex;
}

.closeButtonContainer {
  width: 50px;
  height: 50px;
  color: white;
  padding: 10px;
}
.closeButtonContainer > div {
  width: 100%;
  height: 100%;
  border: 1px solid yellow;
  padding: 5px;
  font-size: 1.2em;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mainArea {
  flex: 1 1;
}

.waveButton.selected {
  background: #66bb6a;
  color: white;
}

.disabledButton {
  border: 2px solid #767776;
  background-color: white;
  opacity: 0.2;
  cursor: default;
}

.tab {
  flex: 0 0 auto;
}

.disabledTab {
  cursor: default;
  background-color: rgba(203, 213, 225, var(--tw-bg-opacity));
  border: none;
}

select,
option {
  -webkit-appearance: none;
}
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  content: "\0025BC";
}
.select-wrapper-hiflow {
  position: absolute;
  left: 340px;
  width: 220px;
}
.select-wrapper-hiflow:after {
  content: "\0025BC";
  right: 14px;
  top: 0;
  height: 26px;
  padding: 15px 0px 0px 8px;
  position: absolute;
  pointer-events: none;
}

.select-wrapper:after {
  content: "\0025BC";
  right: 14px;
  top: 0;
  height: 26px;
  padding: 15px 0px 0px 8px;
  position: absolute;
  pointer-events: none;
}
</style>
