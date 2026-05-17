import { describe, expect, it } from "vitest";
import { useWorkspaceStore } from "./workspace";

describe("workspace store", () => {
  it("links activity selection to graph node selection", () => {
    useWorkspaceStore.getState().reset();
    useWorkspaceStore.getState().setActivity("Assembly");
    expect(useWorkspaceStore.getState().activity).toBe("Assembly");
    expect(useWorkspaceStore.getState().graphNodeId).toBe("activity:Assembly");
  });
});
