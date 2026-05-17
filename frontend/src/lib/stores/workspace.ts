"use client";

import { create } from "zustand";

type WorkspaceState = {
  datasetId?: number;
  runId?: string;
  activity?: string;
  graphNodeId?: string;
  setDatasetId: (datasetId: number) => void;
  setRunId: (runId: string) => void;
  setActivity: (activity: string) => void;
  setGraphNodeId: (graphNodeId: string) => void;
  reset: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  setDatasetId: (datasetId) => set({ datasetId }),
  setRunId: (runId) => set({ runId }),
  setActivity: (activity) => set({ activity, graphNodeId: `activity:${activity}` }),
  setGraphNodeId: (graphNodeId) => set({ graphNodeId }),
  reset: () => set({ datasetId: undefined, runId: undefined, activity: undefined, graphNodeId: undefined }),
}));
