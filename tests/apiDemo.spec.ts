import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach('has title', async ({ page }) => {
  await page.route("*/**/api/tags", async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    });
  })

  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign In").click();
  await page.getByRole("textbox", {name: "Email"}).fill("Pourik@conduit.com");
  await page.getByRole("textbox", { name: "Password" }).fill("Pourik@conduit");
  await page.getByRole("button", {name: "Sign in"}).click();
})

test("Mocking API Calls", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBodyJson = await response.json();
    responseBodyJson.articles[0].title = "This is a test title";
    responseBodyJson.articles[0].description = "This is a test description";

    await route.fulfill({
      body: JSON.stringify(responseBodyJson),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");

  await page.waitForTimeout(2000);
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "This is a test title"
  );
})

test("Fetching Token from Header Demo", async ({ page, request }) => {
  const response = await request.post("https://conduit-api.bondaracademy.com/api/users/login", {
    data: {
      "user":{"email":"Pourik@conduit.com","password":"Pourik@conduit"}
    }
  })
  const responseBody = await response.json();
  const accessToken = responseBody.user.token;

  await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      article: {
        title: "This is a test",
        description: "Testing API",
        body: "Test Description",
        tagList: [],
      },
    },
    headers: {
      "Authorization": `Token ${accessToken}`,
    },
  });

  await page.getByText("Global Feed").click();
  await page.getByText("This is a test").click();
  await page.getByText("Delete Article").first().click();
  await page.getByText("Global Feed").click();
})
