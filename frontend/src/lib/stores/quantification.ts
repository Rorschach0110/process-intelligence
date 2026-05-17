"use client";

import { create } from "zustand";
import type { FieldMapping } from "@/types/api";

const defaultMapping: FieldMapping = {
  case_id: "case_id",
  activity: "activity",
  timestamp: "timestamp",
  resource: "resource",
  energy_kwh: "energy_kwh",
  material_kg: "material_kg",
  device: "device",
};

type QuantificationState = {
  step: number;
  file: string;
  mapping: FieldMapping;
  factors: { electricity_kg_per_kwh: number; material_kg_per_kg: number };
  setStep: (step: number) => void;
  setFile: (file: string) => void;
  setMapping: (mapping: FieldMapping) => void;
  setFactor: (key: "electricity_kg_per_kwh" | "material_kg_per_kg", value: number) => void;
  reset: () => void;
};

export const useQuantificationStore = create<QuantificationState>((set) => ({
  step: 0,
  file: "data/sample_event_log.csv",
  mapping: defaultMapping,
  factors: { electricity_kg_per_kwh: 0.581, material_kg_per_kg: 1.82 },
  setStep: (step) => set({ step }),
  setFile: (file) => set({ file }),
  setMapping: (mapping) => set({ mapping }),
  setFactor: (key, value) => set((state) => ({ factors: { ...state.factors, [key]: value } })),
  reset: () => set({ step: 0, file: "data/sample_event_log.csv", mapping: defaultMapping }),
}));

export { defaultMapping };
