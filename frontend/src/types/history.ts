import type { Prediction, DiagnosticMode } from "../types";

export type HistoryRecord = {
  id: string;
  timestamp: string;
  mode: DiagnosticMode;
  imageName: string;
  prediction: Prediction;
};
