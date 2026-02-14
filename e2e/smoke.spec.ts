import { expect, test } from "@playwright/test";

test("loads the scheduler", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "AZQUERYSUCKS" }),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "加入課程" })).toBeVisible();
});
