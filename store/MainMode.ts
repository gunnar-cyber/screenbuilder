import { defineStore } from "pinia";
import { HamiltonModeType } from "@/classes/HamiltonModeType";
import { PatientType } from "@/types/PatientTypes";
import dialTypesAdult from "@/config/dialType.json";
import dialTypesNeo from "@/config/dialTypeNeonatal.json";
import { PatientAgeCategory } from "@screenbuilder/components";
import { PatientState, SpinnerResultState } from ".";
import { Dial } from "./SpinnerResults";
import { DialType } from "./SpinnerSelection";
export enum standByCounterStatus {
  stopped,
  started,
}
export const useMainModeStore = defineStore("mainMode", {
  state: () => ({
    mainModeButton: false,
    currentPatientType: PatientType.Male,
    allowMonitoringButton: false,
    isStartVentButtonClicked: false,
    modeButton: HamiltonModeType.SCMV_PLUS,
    modeCurrent: HamiltonModeType.SCMV_PLUS,
    psyncDialtType: "pinsp",
    currentIBW: 70,
    minVolValue: "0",
    IELabel: "1:1",
    TELabel: "0",
    TILabel: "0",
    dialType: dialTypesAdult,
    lastPatientType: { patType: PatientType.Male, heightOrWeight: 174, IBW: 70 },
    standbyCounter: standByCounterStatus.stopped,
    isControlsModeOpen: false,
  }),
  getters: {
    whatModeAreWe(): HamiltonModeType {
      return this.modeButton;
    },
    selectedModeInModesScreen(): HamiltonModeType {
      return this.modeCurrent;
    },
    psyncEnabled(): boolean {
      return this.psyncDialtType === "pinsp";
    },
    psyncDialType(): string {
      return this.psyncDialtType;
    },
    getIBW(): number {
      return this.currentIBW;
    },
    getMinVolValue(): string {
      return this.minVolValue;
    },
  },
  actions: {
    createPatientType(patientType: PatientType, screenType: string, whichScreen: string) {
      SpinnerResultState.resetAlarmDial();

      if (screenType === "lastpatient") {
        this.createPatientTypeForLastPatientTab();
      } else {
        if (patientType === PatientType.Male) {
          this.dialType = dialTypesAdult;
          this.currentPatientType = PatientType.Male;
          PatientState.ageType = PatientAgeCategory.Adult;
          this.currentIBW = 70;
        }

        if (patientType === PatientType.Female) {
          this.dialType = dialTypesAdult;
          this.currentPatientType = PatientType.Female;
          PatientState.ageType = PatientAgeCategory.Adult;
          this.currentIBW = 65;
        }

        if (patientType === PatientType.Neonatal) {
          this.dialType = dialTypesNeo;
          this.currentPatientType = PatientType.Neonatal;
          PatientState.ageType = PatientAgeCategory.Neonate;
          this.modeCurrent = HamiltonModeType.PSIMV_PLUS;
          this.setModeButton({
            buttonType: HamiltonModeType.PSIMV_PLUS,
          });
        }
        if (whichScreen === "main" && patientType === PatientType.Male) {
          this.modeCurrent = HamiltonModeType.SCMV_PLUS;
          this.setModeButton({
            buttonType: HamiltonModeType.SCMV_PLUS,
          });
        }

        SpinnerResultState.whichDialToUse();
      }
    },
    createPatientTypeForLastPatientTab() {
      this.currentPatientType = SpinnerResultState.lastPatientData.lastPatType;
      this.modeCurrent = SpinnerResultState.lastPatientData.lastPatientMode;
      this.setModeButton({
        buttonType: SpinnerResultState.lastPatientData.lastPatientMode,
      });

      SpinnerResultState.dialToUse = SpinnerResultState.lastPatientData.lastPatientDial.map((ele) => {
        return { dialTitle: ele.dialTitle, count: ele.count };
      });

      if (this.currentPatientType === PatientType.Male || this.currentPatientType === PatientType.Female) {
        this.dialType = dialTypesAdult;
        PatientState.ageType = PatientAgeCategory.Adult;
      } else {
        this.dialType = dialTypesNeo;
        PatientState.ageType = PatientAgeCategory.Neonate;
      }
    },
    setLastPatientType() {
      SpinnerResultState.lastPatientData.LastPatIBW = this.currentIBW;
      SpinnerResultState.lastPatientData.lastPatType = this.currentPatientType;
      SpinnerResultState.lastPatientData.lastPatientMode = this.modeButton;

      SpinnerResultState.lastPatientData.lastPatientDial = SpinnerResultState.dialToUse.map((ele) => {
        return { dialTitle: ele.dialTitle, count: ele.count };
      });

      if (this.currentPatientType === PatientType.Male || this.currentPatientType === PatientType.Female) {
        this.dialType = dialTypesAdult;
        PatientState.ageType = PatientAgeCategory.Adult;
      } else {
        this.dialType = dialTypesNeo;
        PatientState.ageType = PatientAgeCategory.Neonate;
      }
    },
    setModeButton({ buttonType }: { buttonType: HamiltonModeType }) {
      this.modeButton = buttonType;
    },
    setCurrentSelectedMode({ modeType }: { modeType: HamiltonModeType }) {
      this.modeCurrent = modeType;
    },
    setDialFromPsync({ value }: { value: boolean }) {
      this.psyncDialtType = value ? "pinsp" : "pControl";
    },
    setIBW({ height }: { height: number }) {
      //TO DO CURRENTLY SET TO 70 CALCUATION let ibwValue =
      let result = 0;

      if (height >= 129) {
        if (this.currentPatientType === PatientType.Male) {
          result = Math.round(50 + 0.91 * (height - 152.4));
        }
        if (this.currentPatientType === PatientType.Female) {
          result = Math.round(45.5 + 0.91 * (height - 152.4));
        }
        if (this.currentPatientType === PatientType.Neonatal) {
          result = 100; //TO DO NOT FINISHED
        }
      }
      //below if height meets if statments then we use the below for men or women
      if (height >= 71 && height <= 128) {
        result = Number(Number(0.0037 * Math.pow(height, 2) - 0.4018 * height + 18.62).toFixed(1));
      }
      if (height <= 70) {
        result = Number(Number((0.125 * height - 0.75).toString()).toFixed(1));
      }

      this.currentIBW = result;
    },
    setMinVolLabel({ currentMinVolValue }: { currentMinVolValue: number }) {
      const ibw = this.getIBW;
      this.minVolValue =
        Number(ibw) >= 30
          ? ((((0.1 * Number(ibw) * currentMinVolValue) / 100) * 100) / 100).toFixed(1)
          : ((((0.2 * Number(ibw) * currentMinVolValue) / 100) * 100) / 100).toFixed(2);
    },
  },
});
