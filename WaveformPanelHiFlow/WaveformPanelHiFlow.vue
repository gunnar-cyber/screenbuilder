<template>
  <div>
    <img class="hiflow-warning-img" src="../../img/Standby/warning-white.png" /><img
      class="hiflow-freeze-image"
      src="../../assets/trend-icon.png"
    />
    <div class="hiflow-warning-msg">HI Flow O2 therapy<br />No apnea detection!<br />No disconnection detection!</div>
  </div>

  <div class="waveform-panel graph-font-size" @click="openLayoutPickerForHiFlow()">
    <div v-if="hideShowHiFlowGraph">
      <div class="vertical-axis text-right">
        <div class="oxygen-color">{{ middleHiFlowValue }}</div>
        <div class="flow-color">{{ middleOxygenValue }}</div>
        <div class="y-axis-number">0</div>
      </div>
      <div class="min-hour">{{ hideShowMinHour }}</div>
      <div class="header-txt">
        <div class="oxygen-color">Flow: {{ currentHiFlowValue }} l/min</div>
        <div class="flow-color">Oxygen: {{ currentOxygenValue }}%</div>
      </div>
      <div style="padding-top: 18px">
        <canvas id="myCanvas" style="position: absolute; top: 205px; left: 37px; width: 358px; height: 217px"></canvas>
        <br />
        <svg
          width="100%"
          height="100%"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xml:space="preserve"
          xmlns:serif="http://www.serif.com/"
          style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          viewBox="0 0 50 50"
          id="mySvg"
        >
          <rect class="hiflow-outgraph-lines" width=".372" x="4" y="15" height="34"></rect>
          <rect class="hiflow-outgraph-lines" width="55" x="4" y="21" height=".372"></rect>
          <rect class="hiflow-outgraph-lines" width="55" x="4" y="34" height=".372"></rect>
          <rect class="hiflow-outgraph-lines" width="55" x="4" y="48" height=".372"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="8.2" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="11.9" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="15.6" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="19.3" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="23" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="26.7" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="30.4" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="34.1" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="37.8" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="41.5" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="45.2" y="48" height="1"></rect>
          <rect class="hiflow-outgraph-lines" width=".372" x="48.8" y="48" height="1"></rect>
        </svg>
      </div>

      <div class="horizontal-axis">
        <div :style="{ marginLeft: val.margin + 'px' }" v-for="val in getTrendXAxisNumbers" :key="val.value">
          {{ val.value }}
        </div>
        <div style="padding-left: 35px">{{ currentTime }}</div>
      </div>
    </div>
  </div>
  <WaveformGraphicPicker
    v-if="showingLayoutPicker"
    :selected-area="selectedPickerArea"
    :isHiFlowGraph="true"
    @close="closeLayoutPicker"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WaveformGraphicPicker from "@/components/WaveformGraphicLayout/WaveformGraphicPicker.vue";
import { PickerAreas, trendsXAxisType } from "@/store/graphicsAndWaveForms";
import { GraphicWaveformState, HamiltonT1State, MainModeState, PatientState, SpinnerResultState } from "@/store";
import trendTypes from "../../config/trendTypes.json";
import { DialType } from "@/store/SpinnerSelection";
import { PatientAgeCategory } from "@screenbuilder/components";

export default defineComponent({
  name: "WaveformPanelHiFlow",
  data() {
    return {
      selectedPickerArea: PickerAreas.HiFlow,
      showingLayoutPicker: false,
      xPostion: 8.2,
      graphBlueYPosData: 27,
      graphBlueHeightData: 22,
      graphGreenYPosData: 27,
      trendTypeMinHour: "h",
      currentHiFlowValue: 0,
      currentOxygenValue: 0,
      middleHiFlowValue: 0,
      middleOxygenValue: 0,
      intervalCounter: 0,
      hiflowArray: [] as Array<number>,
      oxygenArray: [] as Array<number>,
      currentTime: "",
      oxygenDotYPos: [{ lookup: 0, postion: 0 }],
      flowBarYPos: [{ lookup: 0, postion: 0 }],
      flowBarHeightPos: [{ lookup: 0, postion: 0 }],
      myCanvas: document.getElementById("myCanvas") as HTMLCanvasElement,
    };
  },
  computed: {
    getCurrentTime(): string {
      return HamiltonT1State.getCurrentDateAndTime.currentTime.substring(0, 5);
    },
    getTrendXAxisNumbers(): trendsXAxisType[] {
      return GraphicWaveformState.getTrendXAxisNumbers;
    },
    hiFlowValue(): number {
      return SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === DialType.HiFlowO2)?.count!;
    },
    OxygenValue(): number {
      return SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === DialType.Oxygen)?.count!;
    },
    hideShowHiFlowGraph(): boolean {
      return GraphicWaveformState.showHideHiFlowGraph;
    },
    hideShowMinHour(): string {
      return (this.trendTypeMinHour = GraphicWaveformState.trendType === trendTypes["1Hour"] ? "m" : "h");
    },
    currentPatientType(): PatientAgeCategory {
      return PatientState.ageType;
    },
  },
  components: {
    WaveformGraphicPicker,
  },
  unmounted() {
    clearInterval(this.intervalCounter);
  },
  mounted() {
    this.setupArraysAndCanvas();
    this.currentHiFlowValue = this.hiFlowValue;
    this.currentOxygenValue = this.OxygenValue;
    this.middleHiFlowValue = this.createMiddleFlowValue();
    this.middleOxygenValue = this.createMiddleOxygenValue();
    this.currentTime = this.getCurrentTime;
    this.createFlowBarChart(this.currentHiFlowValue, this.currentOxygenValue);
    this.intervalCounter = window.setInterval(() => {
      this.currentHiFlowValue = this.hiFlowValue;
      this.currentOxygenValue = this.OxygenValue;
      this.middleHiFlowValue = this.createMiddleFlowValue();
      this.middleOxygenValue = this.createMiddleOxygenValue();
      this.createFlowBarChart(this.currentHiFlowValue, this.currentOxygenValue);
      this.currentTime = this.getCurrentTime;
    }, 5000); //70000
  },
  methods: {
    setupArraysAndCanvas() {
      this.myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      this.oxygenDotYPos.splice(0, this.oxygenDotYPos.length);
      let lookUpCounter = 21;
      let yPos = 223;
      for (let i = 21; i <= 100; i++) {
        this.oxygenDotYPos.push({ lookup: lookUpCounter, postion: yPos });
        lookUpCounter++;
        yPos = yPos - 2.72;
      }
      this.flowBarYPos.splice(0, this.flowBarYPos.length);
      lookUpCounter = 2;
      yPos = 220;
      for (let i = 2; i <= 100; i++) {
        this.flowBarYPos.push({ lookup: lookUpCounter, postion: yPos });
        lookUpCounter++;
        yPos = yPos - 2.24;
      }
      this.flowBarHeightPos.splice(0, this.flowBarHeightPos.length);
      lookUpCounter = 2;
      yPos = 5;
      for (let i = 2; i <= 100; i++) {
        this.flowBarHeightPos.push({ lookup: lookUpCounter, postion: yPos });
        lookUpCounter++;
        yPos = yPos + 2.296;
      }
    },
    drawBar(
      ctx: CanvasRenderingContext2D,
      upperLeftCornerFlowX: number,
      upperLeftCornerFlowY: number,
      heightFlow: number,
      upperLeftCornerOxygenY: number
    ) {
      ctx.beginPath();
      ctx.save();
      ctx.fillStyle = "#88a8c6";
      ctx.fillRect(upperLeftCornerFlowX, upperLeftCornerFlowY, 1.5, heightFlow);
      ctx.fillStyle = "#93cf6e";
      ctx.fillRect(upperLeftCornerFlowX, upperLeftCornerOxygenY, 1.5, 3);
      ctx.closePath();
      ctx.restore();
    },
    getOxygenDotYPos(oxygenValue: number): number {
      let yPosition = this.oxygenDotYPos.find((ele) => {
        return ele.lookup === oxygenValue;
      })?.postion!;
      return yPosition;
    },
    getFlowBarYPos(flowValue: number): number {
      let yPosition = this.flowBarYPos.find((ele) => {
        return ele.lookup === flowValue;
      })?.postion!;
      return yPosition;
    },
    getFlowBarHeightPos(flowValue: number): number {
      let yPosition = this.flowBarHeightPos.find((ele) => {
        return ele.lookup === flowValue;
      })?.postion!;
      return yPosition;
    },
    createFlowBarChart(flowValue: number, oxygenValue: number) {
      this.hiflowArray.unshift(flowValue);
      this.oxygenArray.unshift(oxygenValue);
      this.myCanvas.width = 525;
      this.myCanvas.height = 225;
      let ctx = this.myCanvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 500, 225);
      let leftValue = 520;
      let counter = 0;
      for (let val of this.hiflowArray) {
        let flowValY = this.getFlowBarYPos(val);
        let flowValH = this.getFlowBarHeightPos(val);
        let yPosition = this.getOxygenDotYPos(this.oxygenArray[counter]);
        let barHeightOx = Math.round(yPosition - 5);
        this.drawBar(ctx, leftValue, flowValY, flowValH, barHeightOx);
        leftValue = leftValue - 1.5;
        counter++;
      }
    },
    createMiddleFlowValue() {
      let rangeArray = [7];
      const roundValue = 10;
      if (this.currentPatientType === PatientAgeCategory.Adult) {
        rangeArray[0] = 2;
        rangeArray[1] = 12;
        rangeArray[2] = 13;
        rangeArray[3] = 17;
        rangeArray[4] = 18;
        rangeArray[5] = 80;
        rangeArray[6] = 81;
        rangeArray[7] = 100;
      } else {
        rangeArray[0] = 2;
        rangeArray[1] = 7.5;
        rangeArray[2] = 8;
        rangeArray[3] = 11.5;
        rangeArray[4] = 12;
        rangeArray[5] = 22;
        rangeArray[6] = 23;
        rangeArray[7] = 30;
      }
      let result = 0;
      switch (true) {
        case this.currentHiFlowValue >= rangeArray[0] && this.currentHiFlowValue <= rangeArray[1]:
          result = this.currentHiFlowValue + 1;
          break;
        case this.currentHiFlowValue >= rangeArray[2] && this.currentHiFlowValue <= rangeArray[3]:
          result = this.currentHiFlowValue + 3;
          break;
        case this.currentHiFlowValue >= rangeArray[4] && this.currentHiFlowValue <= rangeArray[5]:
          result = Math.ceil(this.currentHiFlowValue / roundValue) * roundValue;
          break;
        case this.currentHiFlowValue >= rangeArray[6] && this.currentHiFlowValue <= rangeArray[7]:
          result = MainModeState.dialType.find((ele) => ele.dialType === DialType.HiFlowO2)?.max!;
          break;
      }
      return result;
    },
    createMiddleOxygenValue() {
      const roundValue = 10;
      let result = 0;
      result = Math.ceil(this.currentOxygenValue / roundValue) * roundValue;
      //et data = this.currentOxygenValue.toString();
      //data = data.substring(1);
      // let numberRes = Number(data) <= 5 ? 0 : 1;
      // switch (true) {
      //   case this.currentOxygenValue <= 21 && this.currentOxygenValue >= 30:
      //     result = this.currentOxygenValue + 1;
      //     break;
      //   case this.currentOxygenValue >= 31 && this.currentOxygenValue <= 36:
      //     result = this.currentOxygenValue + 3;
      //     break;
      //   case this.currentOxygenValue >= 37 && this.currentOxygenValue <= 80:
      //     result =
      //       numberRes == 0
      //         ? Math.floor(this.currentOxygenValue / roundValue) * roundValue
      //         : Math.ceil(this.currentOxygenValue / roundValue) * roundValue;
      //     break;
      //   case this.currentOxygenValue >= 81 && this.currentOxygenValue <= 100:
      //     result = 100;
      //     break;
      // }
      return result;
    },
    openLayoutPickerForHiFlow() {
      this.showingLayoutPicker = true;
    },
    closeLayoutPicker() {
      this.showingLayoutPicker = false;
    },
  },
});
</script>

<style scoped>
.hiflow-warning-msg {
  position: absolute;
  left: 260px;
  top: 60px;
  color: white;
  text-align: left;
}
.hiflow-warning-img {
  position: absolute;
  left: 210px;
  top: 68px;
  height: 40px;
}
.hiflow-freeze-image {
  position: absolute;
  background-color: #232522;
  top: 45px;
  right: 138px;
  width: 36px;
  height: 26px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
}
.min-hour {
  color: white;
  position: absolute;
  top: 400px;
  left: 395px;
}
.hiflow-outgraph-lines {
  fill: white;
}
.hiflow-outgraph-lines-green {
  fill: green;
}
.oxygen-color {
  fill: #88a8c6;
  color: #88a8c6;
}
.flow-color {
  color: #93cf6e;
  fill: #93cf6e;
}
.y-axis-number {
  color: white;
  position: absolute;
  top: 230px;
  left: 17px;
}
.graph-font-size {
  font-size: 12px;
}
.vertical-axis {
  display: flow-root;
  position: absolute;
  height: 103px;
  margin-left: 2px;
  top: 187px;
  width: 22px;
}
.horizontal-axis {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 295px;
  left: 0px;
  top: 428px;
  color: #fff;
}
.gunnar-test {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 295px;
  left: 90px;
  top: 128px;
  background-color: red;
}
.header-txt {
  position: absolute;
  color: #fff;
  text-align: left;
  top: 153px;
  left: 46px;
}
.waveform-panel {
  height: 100%;
  position: relative;
}
</style>
