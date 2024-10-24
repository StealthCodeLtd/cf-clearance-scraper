const { connect } = require("puppeteer-real-browser");
async function createBrowser() {
  try {
    if (global.finished == true) return;

    global.browser = null;

    // console.log('Launching the browser...');

    const { browser } = await connect({
      headless: false,
      turnstile: true,
      connectOption: { defaultViewport: null },
      disableXvfb: false,
    });

    // console.log('Browser launched');

    global.browser = browser;

    browser.on("disconnected", async () => {
      if (global.finished == true) return;
      console.log("Browser disconnected");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await createBrowser();
    });
    browser.on("targetdestroyed", async () => {
      if (global.finished == true) return;
      console.log("Target destroyed");
    });
    // browser.on("targetcreated", async (target) => {
    //   if (target.type() === "page") {
    //     const page = await target.page();
    //     if (page !== null) await runOnNewPage(page, proxy);
    //   }
    // });
    // const page = (await browser.pages())[0];
    // const client = await page._client();
    // client.send("Emulation.setUserAgentOverride", {
    //   userAgent: (await page.browser().userAgent()).replace("Headless", ""),
    // });
  } catch (e) {
    console.log(e.message);
    if (global.finished == true) return;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await createBrowser();
  }
}
createBrowser();
