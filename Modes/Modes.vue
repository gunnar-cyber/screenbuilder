<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./Modes.css" scoped></style>
<template src="./Modes.html"></template>
<script lang="ts">
import { defineComponent } from "vue";
import Dial from "../../components/Dial/Dial.vue";
import Controls from "@/components/Controls/Controls.vue";
import { FeatureFlagsStoreState, MainModeState, NavigationState, SpinnerResultState } from "@/store";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { FeatureId } from "@screenbuilder/components";

export default defineComponent({
  name: "Modes",
  components: { Dial, Controls },
  data() {
    return {
      modeType: HamiltonModeType,
      activeConfirm: 1,
      activeSetMode: 1,
      activeModeType: "" as HamiltonModeType,
      selectedModeType: "" as HamiltonModeType,
      showModesSelection: true,
      activetab: 1,
      modeLabel: "(S)CMV+",
      mDialScreenType: "modes",
      isActive: true, //TODO this is actually for button disabled
      disableConfirm: false,
    };
  },
  created() {
    this.modesType(this.whatModeAreWeIn);
  },
  computed: {
    isInStandby(): boolean {
      return !MainModeState.isStartVentButtonClicked;
    },
    whatModeAreWeIn(): HamiltonModeType {
      return MainModeState.whatModeAreWe;
    },
    hasHamiltonFlag(): boolean {
      return FeatureFlagsStoreState.isEnabled(FeatureId.HAMILTON);
    },
  },
  mounted() {},
  methods: {
    cancel() {
      this.activeConfirm = 1;
      this.showModesSelection = true;
      NavigationState.resetMainNavigationButtons();
      MainModeState.isControlsModeOpen = false;
    },
    confirmModeSelection() {
      this.activeConfirm = 2;
      this.showModesSelection = false;
      this.selectedModeType = this.modeLabel as HamiltonModeType;
      SpinnerResultState.setNewModeDefaults(this.selectedModeType);
      MainModeState.isControlsModeOpen = true;
    },
    findAndSetModesButton() {
      MainModeState.setModeButton({
        buttonType: this.activeModeType,
      });
    },
    modesType(modeType: HamiltonModeType) {
      this.activeModeType = modeType;

      if (modeType !== this.whatModeAreWeIn) {
        this.disableConfirm = true;
      } else {
        this.disableConfirm = false;
      }
      switch (modeType) {
        case HamiltonModeType.SCMV_PLUS: {
          this.modeLabel = "(S)CMV+";
          break;
        }
        case HamiltonModeType.SIMV_PLUS: {
          this.modeLabel = "SIMV+";
          break;
        }
        case HamiltonModeType.VS: {
          this.modeLabel = "VS";
          break;
        }
        case HamiltonModeType.PCV_PLUS: {
          this.modeLabel = "PCV+";
          break;
        }
        case HamiltonModeType.PSIMV_PLUS: {
          this.modeLabel = "PSIMV+";
          break;
        }
        case HamiltonModeType.SPONT: {
          this.modeLabel = "SPONT";
          break;
        }
        case HamiltonModeType.DuoPAP: {
          this.modeLabel = "DuoPAP";
          break;
        }
        case HamiltonModeType.APRV: {
          this.modeLabel = "APRV";
          break;
        }
        case HamiltonModeType.ASV: {
          this.modeLabel = "ASV";
          break;
        }
        case HamiltonModeType.INTELLIVENT_ASV: {
          this.modeLabel = "Intellivent-ASV";
          break;
        }
        case HamiltonModeType.NIV: {
          this.modeLabel = "NIV";
          break;
        }
        case HamiltonModeType.NIV_ST: {
          this.modeLabel = "NIV-ST";
          break;
        }
        case HamiltonModeType.HiFlowO2: {
          this.modeLabel = "HiFlowO2";
          break;
        }
        case HamiltonModeType.CPR: {
          this.modeLabel = "CPR";
        }
      }

      MainModeState.setCurrentSelectedMode({ modeType: this.activeModeType });
    },
    setMode() {
      this.findAndSetModesButton();
      this.activeSetMode = 1;
      this.showModesSelection = true;
      NavigationState.resetMainNavigationButtons();

      SpinnerResultState.confirmNewMode(this.activeModeType);
    },
  },
});
</script>
