import { SpinnerResultState, store } from "./index";
import { defineStore } from "pinia";
import { SpinnerActions } from "@/classes/SpinnerActions";

export enum DialType {
  Oxygen = "oxygen",
  Peep = "peep",
  Min = "min",
  Psupport = "pSupport",
  Pcontrol = "pControl",
  Rate = "rate",
  Ti = "ti",
  Vt = "vt",
  FlowTrigger = "flowTrigger",
  HiFlowO2 = "hiFlowO2",
  Pramp = "pramp",
  Plimit = "pLimit",
  PressureCMH2OHigh = "pressureCMH2OHigh",
  PressureCMH2OLow = "pressureCMH2OLow",
  Height = "height",
  Weight = "weight",
  DayBright = "daybright",
  NightBright = "nightbright",
  YearSystem = "yearsystem",
  MonthSystem = "monthsystem",
  DaySystem = "daysystem",
  MinuteSystem = "minutesystem",
  TiMax = "timax",
  Ets = "ets",
  Ie = "ie",
  MinVol = "minvol",
  Pinsp = "pinsp",
}

export type DialID =
  // controls
  | DialType.Oxygen
  | DialType.Peep
  | DialType.Min
  | DialType.Psupport
  | DialType.Pcontrol
  | DialType.Rate
  | DialType.Ti
  | DialType.Vt
  | DialType.FlowTrigger
  | DialType.HiFlowO2
  | DialType.Pramp
  | DialType.Plimit
  // alarms pressureCMH2OHigh
  | DialType.PressureCMH2OHigh
  | DialType.PressureCMH2OLow
  // patient
  | DialType.Height
  | DialType.Weight
  // system settings
  | DialType.DayBright
  | DialType.NightBright
  | DialType.YearSystem
  | DialType.MonthSystem
  | DialType.DaySystem
  | DialType.MinuteSystem
  | DialType.TiMax
  | DialType.Ets
  | DialType.Pinsp;

export type ControlID = DialID;

export const useSpinnerSelectionStore = defineStore("spinnerSelection", {
  state: () => ({
    // once a control becomes active it is no longer selected
    // once a control value is confirmed it goes back to selected
    // only one can be selected or active at a time
    active: null as ControlID | null,
    activeSpinnerActions: null as SpinnerActions | null,
    selected: null as ControlID | null,
    _alarmOrDial: "",
  }),
  getters: {
    isControlActive() {
      return (control: ControlID) => this.active === control;
    },

    isControlSelected() {
      return (control: ControlID) => this.selected === control;
    },

    anySelected(): boolean {
      return this.selected !== null;
    },

    anyActive(): boolean {
      return this.active !== null;
    },
  },
  actions: {
    setActive(control: ControlID, spinnerActions: SpinnerActions) {
      this.active = control;
      this.selected = null;
      this.activeSpinnerActions = spinnerActions;
    },
    setInactive() {
      this.selected = this.active;
      this.active = null;
      this.activeSpinnerActions = null;
    },
    setSelected(control: ControlID) {
      if (this.anyActive) {
        return;
      }

      this.selected = control;
    },
    setDialType({
      dialType,
      alarmOrDial,
      spinnerActions,
    }: {
      dialType: ControlID;
      alarmOrDial: string; // TODO change so don't need this
      spinnerActions: SpinnerActions | null;
    }) {
      if (this.anyActive) {
        return; // must confirm before making any other active
      }
      this.setActive(dialType, spinnerActions!);
      this._alarmOrDial = alarmOrDial;
    },
    activateSelected(): void {
      if (this.selected) {
        // TODO fix this, it didn't work before spinnerActions was passed in either,
        // perhaps the dialtype passed in is loaded here to create the spinnerActions instead of in the dial
        //this.setActive(this.selected);
      }
    },
    deactivateAndSelect(): void {
      // confirm dial
      if (this.active) {
        if (!this.activeSpinnerActions?.isModesScreen && this._alarmOrDial != "alarm") {
          SpinnerResultState.updateSetting(this.active, SpinnerResultState.currentCount(this.active));
        } else {
          SpinnerResultState.updateDialNewModeWhenPSyncEnabled(this.active);
        }
      }

      this.setInactive();
    },
  },
});
