import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach('Testing Body Change', async ({ page }) => {
  await page.route("*/**/api/tags", async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    });
  })

  await page.goto("https://conduit.bondaracademy.com/");
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
  await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      article: {
        title: "This is a test",
        description: "Testing API",
        body: "Test Description",
        tagList: [],
      },
    }
  });

  // await page.getByText("Global Feed").click();
  // await page.getByText("This is a test").click();
  // await page.getByText("Delete Article").first().click();
  // await page.getByText("Global Feed").click();
  await page.reload();
})

test("Deleting Article using DELETE Request", async ({ page, request }) => {
  await page.getByText("New Article").click();
  await page.getByPlaceholder("Article Title").fill("Test Article");
  await page.getByPlaceholder("What's this article about?").fill("Testing Delete Request");
  await page.getByPlaceholder("Write your Article (in markdown)").fill("Test Article Deletion using DELETE Request");
  await page.getByRole("button", { name: "Publish Article" }).click();
  
  const articleResponse = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug;
  console.log(slugId);

  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();

  const deleteArticleRequest = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`);
  
  expect(deleteArticleRequest.status()).toEqual(204);

  await page.reload();

  await expect(page.locator("app-article-list .article-preview h1").first()).not.toContainText(
    "Test Article"
  );

});