import { expect, test } from "@playwright/test";

test("homepage exposes the design shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading")).toHaveCount(0);
  await expect(page).toHaveTitle(/Jacob Moya/i);
});
