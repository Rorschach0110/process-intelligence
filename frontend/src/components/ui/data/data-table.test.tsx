import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./data-table";

describe("DataTable", () => {
  it("renders rows and column headers", () => {
    render(
      <DataTable
        columns={[{ key: "name", header: "名称", render: (row: { name: string }) => row.name }]}
        rowKey={(row) => row.name}
        rows={[{ name: "Assembly" }]}
      />,
    );
    expect(screen.getByText("名称")).toBeTruthy();
    expect(screen.getByText("Assembly")).toBeTruthy();
  });
});
