import { DialType } from "@/store/SpinnerSelection";
import { PatientType } from "@/types/PatientTypes";
export class ControlsMode {
  public GetBasicTabControls(mode: string): { dialType: string; miscData: boolean }[][] {
    let controls: { dialType: string; miscData: boolean }[][] = [[{ dialType: "", miscData: false }]];
    if (mode === "PCV+") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: DialType.Rate, miscData: false },
          { dialType: DialType.Pcontrol, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: DialType.Ie, miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "(S)CMV+") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: DialType.Rate, miscData: false },
          { dialType: DialType.Vt, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: DialType.Ie, miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "SIMV+") {
      controls = [
        [
          { dialType: DialType.Psupport, miscData: false },
          { dialType: DialType.Rate, miscData: false },
          { dialType: DialType.Vt, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: DialType.Ti, miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "PSIMV+") {
      controls = [
        [
          { dialType: DialType.Psupport, miscData: false },
          { dialType: DialType.Rate, miscData: false },
          { dialType: DialType.Pcontrol, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: DialType.Ti, miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "SPONT" || mode === "NIV") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.Psupport, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "ASV") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.MinVol, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "NIV-ST") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: DialType.Rate, miscData: false },
          { dialType: DialType.Pinsp, miscData: false },
        ],
        [
          { dialType: DialType.Plimit, miscData: false },
          { dialType: DialType.Ti, miscData: false },
          { dialType: DialType.Peep, miscData: false },
        ],
        [
          { dialType: "", miscData: true },
          { dialType: DialType.FlowTrigger, miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    if (mode === "HiFlowO2") {
      controls = [
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.HiFlowO2, miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: DialType.Oxygen, miscData: false },
        ],
      ];
    }

    return controls;
  }

  public GetMoreTabControls(mode: string, getPatientType: PatientType): { dialType: string; miscData: boolean }[][] {
    let controls: { dialType: string; miscData: boolean }[][] = [[{ dialType: "", miscData: false }]];
    if (mode === "PCV+" || mode == "(S)CMV+") {
      controls = [
        [
          { dialType: DialType.Pramp, miscData: false },
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: "", miscData: true },
        ],
      ];
    }

    if (mode === "SIMV+" || mode === "PSIMV+" || mode === "SPONT" || mode === "ASV") {
      controls = [
        [
          { dialType: DialType.Pramp, miscData: false },
          {
            dialType: getPatientType === PatientType.Female || getPatientType == PatientType.Male ? "" : DialType.TiMax,
            miscData: false,
          },
          { dialType: DialType.Ets, miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: "", miscData: true },
        ],
      ];
    }

    if (mode === "NIV" || mode === "NIV-ST") {
      controls = [
        [
          { dialType: DialType.Pramp, miscData: false },
          { dialType: DialType.TiMax, miscData: false },
          { dialType: DialType.Ets, miscData: false },
        ],
        [
          { dialType: "", miscData: false },
          { dialType: "", miscData: false },
          { dialType: "", miscData: true },
        ],
      ];
    }

    return controls;
  }

  public GetApneaTabControls(mode: string): { dialType: string; miscData: boolean; type: string }[][] {
    let controls: { dialType: string; miscData: boolean; type: string }[][] = [
      [{ dialType: "", miscData: false, type: "" }],
    ];
    if (mode === "SIMV+" || mode === "SPONT") {
      controls = [
        [
          { dialType: "", miscData: true, type: "backup" },
          { dialType: "", miscData: true, type: "label" },
          { dialType: "", miscData: false, type: "" },
        ],
        [
          { dialType: "", miscData: true, type: "auto" },
          { dialType: "", miscData: false, type: "" },
          { dialType: "", miscData: false, type: "" },
        ],
        [
          { dialType: DialType.Rate, miscData: false, type: "" },
          { dialType: DialType.Vt, miscData: false, type: "" },
          { dialType: DialType.Ti, miscData: false, type: "" },
        ],
      ];
    }

    if (mode === "NIV") {
      controls = [
        [
          { dialType: "", miscData: true, type: "backup" },
          { dialType: "", miscData: true, type: "label" },
          { dialType: "", miscData: false, type: "" },
        ],
        [
          { dialType: "", miscData: true, type: "auto" },
          { dialType: "", miscData: false, type: "" },
          { dialType: "", miscData: false, type: "" },
        ],
        [
          { dialType: DialType.Rate, miscData: false, type: "" },
          { dialType: DialType.Pcontrol, miscData: false, type: "" },
          { dialType: DialType.Ie, miscData: false, type: "" },
        ],
      ];
    }

    return controls;
  }
}
