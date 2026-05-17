import { expect, test } from "@playwright/test";

const routes = [
  ["/data", "数据知识库"],
  ["/quantification", "选择数据"],
  ["/process-map", "流程地图"],
  ["/graph-workbench", "图谱追溯"],
  ["/reports", "报告中心"],
];

for (const [path, text] of routes) {
  test(`${path} renders product workbench`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText(text).first()).toBeVisible();
    const screenshot = await page.locator("main").screenshot({ animations: "disabled" });
    expect(screenshot.length).toBeGreaterThan(20_000);
  });
}
