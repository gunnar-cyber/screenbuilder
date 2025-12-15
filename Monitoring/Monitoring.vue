<style src="./Monitoring.css" scoped></style>
<template src="./Monitoring.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import MonitoringParameter from "../MonitoringParameter/MonitoringParameter.vue";
import { AlarmState, MainModeState, NavigationState, PatientState, SpinnerResultState, VentilatorState } from "@/store";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { HamiltonIERatio, HamiltonIERatioOptions, HamiltonIERatioOptionStrings } from "@/classes/HamiltonIERatio";

export default defineComponent({
  name: "Monitoring",
  components: {
    MonitoringParameter,
  },
  computed: {
    isVentilatorStateConnected(): boolean {
      return VentilatorState.status.isConnected;
    },
    ie(): string {
      return MainModeState.IELabel;
    },
    inHiFlowMode(): boolean {
      return MainModeState.whatModeAreWe === HamiltonModeType.HiFlowO2;
    },
    isNivMode(): boolean {
      return this.whatModeAreWeIn === HamiltonModeType.NIV_ST || this.whatModeAreWeIn === HamiltonModeType.NIV;
    },
    ppeak(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode ? VentilatorState.monitored.pip.toFixed(0) : "---";
    },
    pmean(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.meanAirwayPressure.toFixed(0)
        : "---";
    },
    peep(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode ? VentilatorState.settings.peep.toFixed(1) : "---";
    },
    oxygen(): string {
      return VentilatorState.hadFirstBreath() ? VentilatorState.settings.fio2.toString() : "---";
    },

    vte(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode ? VentilatorState.monitored.vt.toFixed(0) : "---";
    },
    ftotal(): string {
      let rateMovingAverage = VentilatorState.rateMovingAverage();
      return rateMovingAverage !== null && !this.inHiFlowMode ? Math.round(rateMovingAverage).toString() : "---";
    },
    expMinVol(): string {
      let expMinVol = VentilatorState.expMinVol();
      if (expMinVol === null || this.inHiFlowMode) {
        return "---";
      }

      if (expMinVol < 3) {
        return expMinVol.toFixed(2);
      } else {
        return expMinVol.toFixed(1);
      }
    },

    ti(): string {
      // could change with spontaneous breathing
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? SpinnerResultState.currentCount("ti").toString()
        : "---";
    },
    te(): string {
      // could change with spontaneous breathing
      if (VentilatorState.hadFirstBreath() && !this.inHiFlowMode) {
        const tiVal: number = SpinnerResultState.currentCount("ti");
        const rateVal: number = SpinnerResultState.currentCount("rate");

        return Math.max(0, rateVal - tiVal).toString();
      } else {
        return "---";
      }
    },
    mvspont(): string {
      return "---"; // spontaneous expiratory minute volume (same as expMinVol but sopontaneous)
      // TODO add when spontaneous breathing is supported
    },
    fspont(): string {
      return "---"; // spontaneous breath frequency
      // TODO add when spontaneous breathing is supported
    },

    inspFlow(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.inspiratoryFlow.toFixed(1)
        : "---";
    },
    expFlow(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.expiratoryFlow.toFixed(1)
        : "---";
    },
    vti(): string {
      // tidal volume from flow sensor
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.inspiratoryVolume.toFixed(1)
        : "---";
    },
    vleak(): string {
      const value = VentilatorState.spontSettings?.vLeak.toString() ?? "---";
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode && this.isNivMode ? value : "---";
    },
    mvleak(): string {
      const vLeak = VentilatorState.spontSettings?.vLeak;
      const frequency = VentilatorState.monitored.breathsPerMinute;

      if (vLeak === undefined || vLeak === null || frequency === 0) {
        return "---";
      }

      // MVLeak = VLeak / pct × Frequency
      const mvLeak = (vLeak / 100) * frequency;
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode && this.isNivMode ? mvLeak.toFixed(1) : "---";
    },

    // 3
    rinsp(): string {
      return "---"; // resistance to inspiratory flow in the endotracheal tube and patient airways
    },
    autoPEEP(): string {
      // ideal is 0, might need "lung emptying" setting on control, or calculate from tidal volume,
      // expiratory time, rate, obstruction, peak expiratory flow
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode ? "0" : "---";
    },
    ptp(): string {
      return "---"; // measured pressure drop required to trigger the breath multiplied by the time
      // interval until the PEEP/CPAP level is reached at the beginning of inspiration
    },

    cstat(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.compliance.toFixed(1)
        : "---";
    },
    rcexp(): string {
      let value = VentilatorState.monitored.expiratoryTimeConstant;
      return VentilatorState.hadFirstBreath() && value != 0 && !this.inHiFlowMode
        ? VentilatorState.monitored.expiratoryTimeConstant.toFixed(2)
        : "---";
    },
    pplateau(): string {
      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? VentilatorState.monitored.plateauPressure.toFixed(1)
        : "---";
    },
    changeP(): string {
      // reflects the difference between Pplateau and PEEP

      if (VentilatorState.monitored.compliance == 0) {
        return "---";
      }

      return VentilatorState.hadFirstBreath() && !this.inHiFlowMode
        ? (VentilatorState.settings.vt / VentilatorState.monitored.compliance).toFixed(0)
        : "---";
    },
    vteSpont(): string {
      return "---"; // TODO add when spontaneous breathing is supported
    },

    // co2 tab
    vdaw(): string {
      return "---";
    },
    slopeCO2(): string {
      return "---";
    },
    vtalv(): string {
      return "---";
    },
    valv(): string {
      return "---";
    },
    vdawvteRatio(): string {
      return "---";
    },

    PetCO2(): string {
      return VentilatorState.hadFirstBreath() ? PatientState.parameters.etco2.toFixed(1) : "---";
    },
    FetCO2(): string {
      return "---";
    },
    VeCO2(): string {
      return "---";
    },
    ViCO2(): string {
      return "---";
    },
    VCO2(): string {
      return "---";
    },

    // spo2 tab
    spo2(): string {
      return PatientState.parameters.spo2 === 0 ? "---" : PatientState.parameters.spo2.toFixed(0);
    },
    spo2Fio2Ratio(): string {
      // accuracy reduced above this value so not shown. Spo2 instruction manual page 37
      if (PatientState.parameters.spo2 > 97) {
        return "---";
      }
      return VentilatorState.settings.fio2 === 0
        ? "---"
        : (PatientState.parameters.spo2 / VentilatorState.settings.fio2).toFixed(1);
    },
    pulse(): string {
      return PatientState.parameters.hr === 0 ? "---" : PatientState.parameters.hr.toString();
    },
    currentFTotalColor(): string {
      return AlarmState.currentFTotalColor;
    },
    currentExpMinVolColor(): string {
      return AlarmState.currentExpMinVolColor;
    },
    currentPressureColor(): string {
      return AlarmState.currentPressureColor;
    },
    currentVteColor(): string {
      return AlarmState.currentVteColor;
    },
    whatModeAreWeIn(): HamiltonModeType {
      return MainModeState.whatModeAreWe;
    },
    ieRatioCheck(): string {
      return VentilatorState.settings.ratioIE;
    },
  },
  data() {
    return {
      //TODO remove any not used
      activetab: 1,
      activetabDateAndTime: 1,
      dayAndNightDialActive: 1,
      activeButtonDayOrNight: 1,
      whichDayOrNightActive: 1,
      whichInnerMenu: 1,
      timeImageActive: 8,
      timeImageActiveYear: 8,
      timeImageActiveMonth: 8,
      timeImageActiveDay: 8,
      timeImageActiveHour: 8,
      timeImageActiveMinute: 8,
      activesubtab: 1,
      monitorDefaultColor: "",
      ieData: "",
      ieOptions: [] as Array<HamiltonIERatio>,
    };
  },
  props: {},
  mounted() {
    this.getIEData();
  },
  methods: {
    getIEData() {
      let decimalFoundFromVent = VentilatorState.settings.ratioIE.indexOf(".");
      let decimalFoundFromLabel = MainModeState.IELabel.indexOf(".");
      this.ieData = VentilatorState.settings.ratioIE;
      if (this.whatModeAreWeIn === HamiltonModeType.SCMV_PLUS || this.whatModeAreWeIn === HamiltonModeType.PCV_PLUS) {
        //use dial values if not connected
        if (decimalFoundFromVent !== -1 && this.isVentilatorStateConnected) {
          this.ieData =
            VentilatorState.settings.ratioIE.substring(0, 3) + VentilatorState.settings.ratioIE.substring(5, 3);
        }

        if (decimalFoundFromVent === -1 && this.isVentilatorStateConnected) {
          this.ieData = VentilatorState.settings.ratioIE;
        }
        if (!this.isVentilatorStateConnected) {
          let a = SpinnerResultState.dialToUse.find((ele) => ele.dialTitle === "ie")!;
          this.ieOptions = HamiltonIERatioOptions;
          let ratioString = HamiltonIERatioOptionStrings[a.count];
          this.ieData = ratioString;
        }
      }

      if (
        this.whatModeAreWeIn === HamiltonModeType.SIMV_PLUS ||
        this.whatModeAreWeIn === HamiltonModeType.PSIMV_PLUS ||
        this.whatModeAreWeIn === HamiltonModeType.NIV_ST
      ) {
        //these modes do not have dial but label
        if (decimalFoundFromVent !== -1 && this.isVentilatorStateConnected) {
          this.ieData =
            VentilatorState.settings.ratioIE.substring(0, 3) + VentilatorState.settings.ratioIE.substring(5, 3);
        }

        if (decimalFoundFromVent === -1 && this.isVentilatorStateConnected) {
          this.ieData = VentilatorState.settings.ratioIE;
        }
        if (decimalFoundFromLabel !== -1 && !this.isVentilatorStateConnected) {
          this.ieData = MainModeState.IELabel.substring(0, 3) + MainModeState.IELabel.substring(5, 3);
        }

        if (decimalFoundFromLabel === -1 && !this.isVentilatorStateConnected) {
          this.ieData = MainModeState.IELabel;
        }
      }

      if (this.whatModeAreWeIn === HamiltonModeType.SPONT) {
        //does not have a label or dial
        if (decimalFoundFromVent !== -1 && this.isVentilatorStateConnected) {
          this.ieData =
            VentilatorState.settings.ratioIE.substring(0, 3) + VentilatorState.settings.ratioIE.substring(5, 3);
        }

        if (decimalFoundFromVent === -1 && this.isVentilatorStateConnected) {
          this.ieData = VentilatorState.settings.ratioIE;
        }
      }

      this.ieData = !this.inHiFlowMode ? this.ieData : "-:-";

      return this.ieData;
    },
    changeTab(index: number) {
      this.activetab = index;
      this.activesubtab = 1;
    },
    close() {
      NavigationState.resetMainNavigationButtons();
    },
  },
  watch: {
    isVentilatorStateConnected(value: boolean) {
      return this.getIEData();
    },
    ieRatioCheck() {
      return this.getIEData();
    },
  },
});
</script>
