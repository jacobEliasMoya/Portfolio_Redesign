import { expect, test } from "@playwright/test";

test("homepage presents the portfolio introduction", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Jacob Moya" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Jacob Moya/i);
});
