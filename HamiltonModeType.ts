import { VentMode } from "@screenbuilder/components";

export enum HamiltonModeType {
  PSIMV_PLUS = "PSIMV+",
  SIMV_PLUS = "SIMV+",
  SCMV_PLUS = "(S)CMV+",
  PCV_PLUS = "PCV+",
  NIV_ST = "NIV-ST",
  VS = "VS",
  SPONT = "SPONT",
  DuoPAP = "DuoPAP",
  APRV = "APRV",
  ASV = "ASV",
  INTELLIVENT_ASV = "INTELLIVENT-ASV",
  NIV = "NIV",
  HiFlowO2 = "HiFlowO2",
  CPR = "CPR",
}

/*export const HamiltonModeTypeDisplay = {
  [HamiltonModeType.PSIMV_PLUS]: "PSIMV+"
}*/

export function hamiltonModeTypeToVentType(mode: HamiltonModeType): VentMode | undefined {
  const mapping = {
    [HamiltonModeType.PSIMV_PLUS]: VentMode.SIMV_P,
    [HamiltonModeType.SIMV_PLUS]: VentMode.SIMV_PRVC,
    [HamiltonModeType.SCMV_PLUS]: VentMode.AC_PRVC,
    [HamiltonModeType.PCV_PLUS]: VentMode.AC_P,
    [HamiltonModeType.SPONT]: VentMode.CPAP_P,
    [HamiltonModeType.VS]: VentMode.CPAP_PRVC,
    [HamiltonModeType.DuoPAP]: VentMode.BiLevel_P,
    [HamiltonModeType.HiFlowO2]: VentMode.HIFLOW,
    [HamiltonModeType.NIV]: VentMode.NIV_P,
    [HamiltonModeType.NIV_ST]: VentMode.NIVST_P,

    // TODO not sure what to do with these ones
    [HamiltonModeType.APRV]: VentMode.SIMV_P,
    [HamiltonModeType.ASV]: VentMode.SIMV_P,
    [HamiltonModeType.INTELLIVENT_ASV]: VentMode.SIMV_P,
    [HamiltonModeType.CPR]: VentMode.SIMV_P,
  };

  return mapping[mode];
}

export function ventTypeToHamiltonModeType(mode: VentMode): HamiltonModeType | undefined {
  const mapping = {
    [VentMode.SIMV_V]: undefined,
    [VentMode.SIMV_P]: HamiltonModeType.PSIMV_PLUS,
    [VentMode.SIMV_PRVC]: HamiltonModeType.SIMV_PLUS,
    [VentMode.AC_PRVC]: HamiltonModeType.SCMV_PLUS,
    [VentMode.AC_P]: HamiltonModeType.PCV_PLUS,
    [VentMode.AC_V]: undefined,
    [VentMode.CPAP_V]: undefined,
    [VentMode.CPAP_P]: HamiltonModeType.SPONT,
    [VentMode.CPAP_PRVC]: undefined,
    [VentMode.BiLevel_V]: undefined,
    [VentMode.BiLevel_P]: HamiltonModeType.DuoPAP,
    [VentMode.BiLevel_PRVC]: undefined,
    [VentMode.NIV_P]: HamiltonModeType.NIV,
    [VentMode.NIVST_P]: HamiltonModeType.NIV_ST,
    [VentMode.HIFLOW]: HamiltonModeType.HiFlowO2,

    // TODO not sure what to do with these ones, if control changes it then they won't map properly
    /*
    [HamiltonModeType.APRV]: VentMode.SIMV_P,
    [HamiltonModeType.ASV]: VentMode.SIMV_P,
    [HamiltonModeType.INTELLIVENT_ASV]: VentMode.SIMV_P,
    [HamiltonModeType.CPR]: VentMode.SIMV_P*/
  };

  return mapping[mode];
}
