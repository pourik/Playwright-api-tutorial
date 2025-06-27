import { test as setup } from "@playwright/test";

const authFile = ".auth/user.json"

setup("Authentication", async ({ page }) => {
    await page.goto("https://conduit.bondaracademy.com/");
    await page.getByText("Sign In").click();
    await page.getByRole("textbox", { name: "Email" }).fill("Pourik@conduit.com");
    await page.getByRole("textbox", { name: "Password" }).fill("Pourik@conduit");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForResponse("https://conduit-api.bondaracademy.com/api/tags");

    await page.context().storageState({path: authFile});
});