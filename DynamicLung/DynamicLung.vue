<template>
  <div style="position: relative">
    <div class="lung-container relative" :class="isInhaled ? 'lung-inhaled' : 'lung-exhaled'">
      <img style="width: 100%" src="@/img/Graphics/LungBg.svg" alt="lung" />
      <div class="compliance" :class="complianceDetails.className">
        <img :src="complianceDetails.imgSrc" alt="lung compliance" />
      </div>
    </div>
    <div class="resistance-container">
      <img :src="resistanceImgSrc" alt="lung resistance" />
    </div>
    <div class="heart-container">
      <img src="@/img/Graphics/Heart.png" alt="heart" />
      <img v-if="heartBeatOn" class="heartbeat" src="@/img/heart_outline.svg" alt="heartbeat" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import complianceVeryLowImg from "@/img/Graphics/Lung_Compliance_VeryLow.svg";
import complianceLowImg from "@/img/Graphics/Lung_Compliance_Low.svg";
import complianceNormalImg from "@/img/Graphics/Lung_Compliance_Normal.svg";
import complianceHighImg from "@/img/Graphics/Lung_Compliance_High.svg";
import resistanceUnavailableImg from "@/img/Graphics/Lung_Resistance_Unavailable.png";
import resistanceNormalImg from "@/img/Graphics/Lung_Resistance_Normal.png";
import resistanceModerateImg from "@/img/Graphics/Lung_Resistance_Moderate.png";
import resistanceHighImg from "@/img/Graphics/Lung_Resistance_High.png";
import complianceThresholds from "@/config/lungComplianceThresholds.json";
import resistanceThresholds from "@/config/lungResistanceThresholds.json";
import { PatientState, VentilatorState } from "@/store";

export default defineComponent({
  name: "DynamicLung",
  mounted() {
    this.inhale();
  },
  data() {
    return {
      isInhaled: false,
      restingTime: 300,
      heartBeatOn: true,
    };
  },
  methods: {
    inhale() {
      window.setTimeout(() => {
        if (this.respTimeout() !== 0) {
          this.isInhaled = true;
        }
        this.exhale();
      }, this.restingTime + this.respTimeout() / 2); // TODO use an inspiration value
    },
    exhale() {
      window.setTimeout(() => {
        if (this.respTimeout() !== 0) {
          this.isInhaled = false;
        }
        this.inhale();
      }, this.restingTime + this.respTimeout() / 2); // TODO use an expiration value
    },
    respTimeout(): number {
      // respRate is number of breaths in a minute
      return PatientState.parameters.respRate === 0 ? 0 : 60000 / PatientState.parameters.respRate;
    },
  },
  watch: {
    heartbeatOccurred(newValue: boolean) {
      if (newValue) {
        this.heartBeatOn = false;
        window.setTimeout(() => {
          this.heartBeatOn = true;
        }, 150);
      }
    },
  },
  computed: {
    heartbeatOccurred(): boolean {
      return PatientState.heartbeatOccurred;
    },
    compliance(): number {
      return VentilatorState.monitored.compliance || 0;
    },
    resistance(): number | null {
      return VentilatorState.monitored.resistance || null;
    },
    complianceDetails() {
      let imgSrc;
      let className;

      if (this.compliance <= complianceThresholds.veryLow.max) {
        imgSrc = complianceVeryLowImg;
        className = "verylow-compliance";
      } else if (this.compliance >= complianceThresholds.low.min && this.compliance <= complianceThresholds.low.max) {
        imgSrc = complianceLowImg;
        className = "low-compliance";
      } else if (
        this.compliance >= complianceThresholds.normal.min &&
        this.compliance <= complianceThresholds.normal.max
      ) {
        imgSrc = complianceNormalImg;
        className = "normal-compliance";
      } else {
        imgSrc = complianceHighImg;
        className = "high-compliance";
      }

      return {
        imgSrc,
        className,
      };
    },
    resistanceImgSrc() {
      if (this.resistance === null) {
        return resistanceUnavailableImg;
      } else if (this.resistance <= resistanceThresholds.normal.min) {
        return resistanceNormalImg;
      } else if (
        this.resistance >= resistanceThresholds.moderate.min &&
        this.resistance <= resistanceThresholds.moderate.max
      ) {
        return resistanceModerateImg;
      } else if (this.resistance >= resistanceThresholds.high.min) {
        return resistanceHighImg;
      } else {
        return resistanceUnavailableImg;
      }
    },
  },
});
</script>

<style scoped>
.lung-container {
  margin: 5px auto auto;
}

.resistance-container,
.compliance,
.heart-container {
  margin: 1px auto auto;
  position: absolute;
}
.resistance-container {
  width: 33%;
  top: 0;
  left: 33.5%;
}
.heart-container {
  width: 47%;
  top: 30%;
  left: 26%;
}

.low-compliance {
  width: 90%;
  top: 6%;
  left: 4.5%;
}
.verylow-compliance {
  width: 94%;
  top: 6%;
  left: 3%;
}
.normal-compliance {
  top: 0;
}
.high-compliance {
  top: 7%;
}

.heartbeat {
  position: absolute;
  top: 42%;
  left: 45%;
  width: 1em;
}

.lung-inhaled {
  width: 50%;
  transition: width 1.5s ease-in-out;
}

.lung-exhaled {
  width: 43%;
  transition: width 1.5s ease-in-out;
}
</style>
