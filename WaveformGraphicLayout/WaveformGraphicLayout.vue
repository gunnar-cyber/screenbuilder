<template>
  <div class="flex flex-col waveformGraphicsContainer">
    <!--    Paw inside the waveform panel-->
    <WaveformPanel :waveform-details="waveform1" class="panelContainer" :yAxis="waveform1.yAxis" :pLimit="pLimit">
      <Waveform
        class="waveform"
        ref="waveformComponent1"
        :width="370"
        :height="waveform1.height"
        :type="waveform1.type"
        :range="waveform1.range"
        :pixelsPerSecond="pixelsPerSecond"
        :lineColour="waveform1.lineColour"
        :lineWidth="2"
        :engine="graphicWave.waveformEngine"
        :createSpontaneousBreathMarker="createSpontaneousBreathMarker"
        :endOfWaveformReachedCallback="endOfPawWaveformReachedCallback"
      >
      </Waveform>
    </WaveformPanel>

    <template v-if="isGraphicShowing">
      <DynamicLungPanel class="panelContainerLarge" v-if="graphicType === 'dynamicLung'" @click="openLayoutPicker(3)" />

      <div v-if="graphicType !== 'dynamicLung'" class="panelContainerLarge" @click="openLayoutPicker(1)">
        <WaveformLoopPanel
          v-if="loopWaveformX && loopWaveformY"
          :waveformX-details="loopWaveformX"
          :waveformY-details="loopWaveformY"
          @save-reference="saveReference($event)"
        >
          <WaveformLoop
            ref="loop"
            class="waveform"
            :width="285"
            :height="87"
            :pixelsPerSecond="pixelsPerSecond"
            :lineColour="0xffea00"
            :lineWidth="2"
            :engine="graphicWave.waveformEngine"
            :typeX="loopWaveformX.type"
            :rangeX="loopWaveformX.range"
            :typeY="loopWaveformY.type"
            :rangeY="loopWaveformY.range"
          >
          </WaveformLoop>
        </WaveformLoopPanel>
      </div>
    </template>
    <template v-else>
      <div class="panelContainer" @click="openLayoutPicker(1)">
        <WaveformPanel v-if="waveform2" :waveform-details="waveform2" :yAxis="waveform2.yAxis">
          <Waveform
            class="waveform"
            ref="waveformComponent2"
            :width="370"
            :height="waveform2.height"
            :type="waveform2.type"
            :range="waveform2.range"
            :pixelsPerSecond="pixelsPerSecond"
            :lineColour="waveform2.lineColour"
            :lineWidth="2"
            :engine="graphicWave.waveformEngine"
            :endOfWaveformReachedCallback="endOfFlowWaveformReachedCallback"
          >
          </Waveform>
        </WaveformPanel>
      </div>

      <div class="panelContainer" @click="openLayoutPicker(2)">
        <WaveformPanel v-if="waveform3" :waveform-details="waveform3" :yAxis="waveform3.yAxis">
          <Waveform
            class="waveform"
            ref="waveformComponent3"
            :width="370"
            :height="waveform3.height"
            :type="waveform3.type"
            :range="waveform3.range"
            :pixelsPerSecond="pixelsPerSecond"
            :lineColour="waveform3.lineColour"
            :lineWidth="2"
            :engine="graphicWave.waveformEngine"
            :endOfWaveformReachedCallback="endOfVolumeWaveformReachedCallback"
          >
          </Waveform>
        </WaveformPanel>
      </div>
    </template>

    <WaveformGraphicPicker
      v-if="showingLayoutPicker"
      :selected-area="selectedPickerArea"
      @close="closeLayoutPicker"
      :isHiFlowGraph="false"
    />
  </div>
</template>

<script lang="ts">
import * as PIXI from "pixi.js";
import { defineComponent } from "vue";
import {
  pixelsPerSecond,
  WaveformType,
  Waveform as WaveformChart,
  Range,
  isRangeEqual,
} from "isimulate-screen-builder";
import { PickerAreas } from "@/store/graphicsAndWaveForms";
import WaveformPanel from "@/components/WaveformPanel/WaveformPanel.vue";
import WaveformLoopPanel from "@/components/WaveformLoopPanel/WaveformLoopPanel.vue";
import { Waveform, WaveformLoop } from "@screenbuilder/components";
import DynamicLungPanel from "@/components/DynamicLung/DynamicLungPanel.vue";
import WaveformGraphicPicker from "@/components/WaveformGraphicLayout/WaveformGraphicPicker.vue";
import waveTypes from "../../config/waveform.json";
import loopTypes from "../../config/loopTypes.json";
import { WaveformRanges } from "@/classes/WaveformRanges";
import { DialType } from "@/store/SpinnerSelection";
import { GraphicWaveformState, SpinnerResultState, VentilatorState } from "@/store";

export type WaveformData = {
  title: string;
  type: WaveformType;
  range: { min: number; max: number };
  yAxis: Array<number>;
  lineColour: number;
  unitOfMeasurement: string;
  height: number;
};

const waveformRanges = new WaveformRanges();

export default defineComponent({
  name: "WaveformGraphicLayout",
  components: {
    WaveformGraphicPicker,
    WaveformPanel,
    Waveform,
    DynamicLungPanel,
    WaveformLoop,
    WaveformLoopPanel,
  },
  data() {
    return {
      pixelsPerSecond: pixelsPerSecond,
      showingLayoutPicker: false,
      selectedPickerArea: PickerAreas.Top,
      graphicWave: GraphicWaveformState,
      pressureWaveformDetails: {
        title: "Paw",
        type: WaveformType.VentPressure,
        range: { min: -10, max: 40 },
        lineColour: 0xffea00,
        unitOfMeasurement: "cmH20",
        yAxis: waveformRanges.pressureAirwayYAxis[1],
        height: 110,
      },
      flowWaveformDetails: {
        title: "Flow",
        type: WaveformType.VentFlow,
        range: { min: -75, max: 75 },
        lineColour: 0x82008a,
        unitOfMeasurement: "l/min",
        yAxis: waveformRanges.flow[6],
        height: 102,
      },
      volumeWaveformDetails: {
        title: "V",
        type: WaveformType.VentVolume,
        range: { min: 0, max: 800 },
        lineColour: 0x008a00,
        unitOfMeasurement: "ml",
        yAxis: waveformRanges.volume[6],
        height: 87,
      },
    };
  },
  computed: {
    isGraphicShowing(): boolean {
      return GraphicWaveformState.isGraphicMode;
    },
    graphicType(): string {
      return GraphicWaveformState.graphicType;
    },
    waveform1(): WaveformData {
      return this.pressureWaveformDetails;
    },
    waveform2(): WaveformData | null {
      switch (GraphicWaveformState.middleWaveform) {
        case waveTypes.flow:
          return this.flowWaveformDetails;
        case waveTypes.volume:
          return this.volumeWaveformDetails;
        case waveTypes.none:
        default:
          return null;
      }
    },
    waveform3(): WaveformData | null {
      switch (GraphicWaveformState.bottomWaveform) {
        case waveTypes.flow:
          return this.flowWaveformDetails;
        case waveTypes.volume:
          return this.volumeWaveformDetails;
        case waveTypes.none:
        default:
          return null;
      }
    },
    loopWaveformX(): WaveformData | null {
      switch (GraphicWaveformState.graphicType) {
        case loopTypes.pressureFlow:
          return this.pressureWaveformDetails;
        case loopTypes.pressureVolume:
          return this.pressureWaveformDetails;
        case loopTypes.volumeFlow:
          return this.volumeWaveformDetails;
        default:
          return null;
      }
    },
    loopWaveformY(): WaveformData | null {
      switch (GraphicWaveformState.graphicType) {
        case loopTypes.pressureFlow:
          return this.flowWaveformDetails;
        case loopTypes.pressureVolume:
          return this.volumeWaveformDetails;
        case loopTypes.volumeFlow:
          return this.flowWaveformDetails;
        default:
          return null;
      }
    },
    pLimit(): number {
      return SpinnerResultState.currentCount(DialType.Plimit);
    },
  },
  methods: {
    endOfPawWaveformReachedCallback(waveform: Waveform) {
      // call scale after reaching the end of the waveform
      if (this.waveform1 !== null && waveform != null) {
        this.checkAndUpdateRange(this.waveform1, waveform);
      }
    },
    endOfFlowWaveformReachedCallback(waveform: Waveform) {
      // call scale after reaching the end of the waveform
      if (this.waveform2 !== null && waveform != null) {
        this.checkAndUpdateRange(this.waveform2, waveform);
      }
    },
    endOfVolumeWaveformReachedCallback(waveform: Waveform) {
      // call scale after reaching the end of the waveform
      if (this.waveform3 !== null && waveform != null) {
        this.checkAndUpdateRange(this.waveform3, waveform);
      }
    },
    /** used to create the spontaneous breath marker on the pressure waveform */
    createSpontaneousBreathMarker(pointIndex: number): PIXI.Graphics {
      const size = 8;
      const x = pointIndex - size / 2;
      const y = 92;

      var triangle = new PIXI.Graphics();

      this.drawEqualateralTriangle(triangle, size);

      triangle.x = x;
      triangle.y = y;

      return triangle;
    },
    drawEqualateralTriangle(triangle: PIXI.Graphics, width: number) {
      const height = width;
      const halfway = width / 2;

      triangle.beginFill(0xbd2385, 1);
      triangle.lineStyle(0, 0xbd2385, 1);
      // point facing up
      triangle.drawPolygon(halfway, 0, 0, height, width, height);
      triangle.endFill();
    },
    openLayoutPicker(selectedArea: PickerAreas) {
      this.selectedPickerArea = selectedArea;
      this.showingLayoutPicker = true;
    },
    closeLayoutPicker() {
      this.showingLayoutPicker = false;
    },
    saveReference(event: MouseEvent | TouchEvent) {
      if (this.$refs.loop) {
        (this.$refs.loop as WaveformLoop).saveReference();
      }
      event.preventDefault();
      event.stopPropagation();
    },
    checkAndUpdateRange(waveformData: WaveformData, waveform: Waveform) {
      const range = waveform.fullDataYRange();

      if (waveformData.type === WaveformType.VentFlow) {
        const newRange = waveformRanges.rangeForCurrentDataRange(
          waveformData.type,
          this.flowWaveformDetails.range,
          range
        );
        if (!isRangeEqual(newRange, this.flowWaveformDetails.range)) {
          this.flowWaveformDetails.range = newRange;
          this.flowWaveformDetails.yAxis = waveformRanges.axisForType(waveformData.type, newRange);
        }
      } else if (waveformData.type === WaveformType.VentPressure) {
        const newRange = waveformRanges.rangeForCurrentDataRange(
          waveformData.type,
          this.pressureWaveformDetails.range,
          range
        );
        if (!isRangeEqual(newRange, this.pressureWaveformDetails.range)) {
          this.pressureWaveformDetails.range = newRange;
          this.pressureWaveformDetails.yAxis = waveformRanges.axisForType(waveformData.type, newRange);
        }
      } else if (waveformData.type === WaveformType.VentVolume) {
        // const newRange = waveformRanges.rangeForCurrentDataRange(
        //   waveformData.type,
        //   this.volumeWaveformDetails.range,
        //   range
        // );
        // if (!isRangeEqual(newRange, this.volumeWaveformDetails.range)) {
        //   // this.volumeWaveformDetails.range = newRange;
        //   // this.volumeWaveformDetails.yAxis = waveformRanges.axisForType(waveformData.type, newRange);
        // }
      }
    },
  },
});
</script>

<style scoped>
/*
Careful of this issue with table cell content sizing
https://stackoverflow.com/questions/3215553/make-a-div-fill-an-entire-table-cell#comment119339531_34781198
*/
.waveformGraphicsContainer {
  height: 100%;
  width: 100%;
}

.panelContainer {
  flex: 1;
}

.panelContainerLarge {
  flex: 2;
}

.waveform {
  padding-top: 12px;
}
</style>
