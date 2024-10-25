const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
const path = require("path");
const appRoot = require("app-root-path");
const args = [
  "--webrtc-ip-handling-policy=disable_non_proxied_udp",
  "--fingerprinting-canvas-image-data-noise",
  "--fingerprinting-canvas-measuretext-noise",
  "--fingerprinting-client-rects-nois",
  "--hide-crashed-bubble",
  "--no-zygote",
  "--disable-infobars",
  "--disable-logging",
  "--disable-session-crashed-bubble",
  "--disable-appcontainer",
  "--allow-running-insecure-content",
  "--disable-default-apps",
  "--disable-machine-id",
  "--window-size=1920,1080",
  "--disable-gpu",
  "--disable-accelerated-video-encode",
  "--disable-accelerated-2d-canvas",
  "--disable-crash-reporter",
  "--disable-breakpad",
  "--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion,InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,AutofillServerCommunication,PrivacySandboxSettings4,AutomationControlled",
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  // Disable all chrome extensions
  "--disable-extensions",
  // Disable some extensions that aren't affected by --disable-extensions
  "--disable-component-extensions-with-background-pages",
  // Disable various background network services, including extension updating,
  //   safe browsing service, upgrade detector, translate, UMA
  "--disable-background-networking",
  // Don't update the browser 'components' listed at chrome://components/
  "--disable-component-update",
  // Disables client-side phishing detection.
  "--disable-client-side-phishing-detection",
  // Disable syncing to a Google account
  "--disable-sync",
  // Disable reporting to UMA, but allows for collection
  "--metrics-recording-only",
  // Disable installation of default apps on first run
  "--disable-default-apps",
  // Mute any audio
  "--mute-audio",
  // Disable the default browser check, do not prompt to set it as such
  "--no-default-browser-check",
  // Skip first run wizards
  "--no-first-run",
  // Disable backgrounding renders for occluded windows
  "--disable-backgrounding-occluded-windows",
  // Disable renderer process backgrounding
  "--disable-renderer-backgrounding",
  // Disable task throttling of timer tasks from background pages.
  "--disable-background-timer-throttling",
  // Disable the default throttling of IPC between renderer & browser processes.
  "--disable-ipc-flooding-protection",
  // Avoid potential instability of using Gnome Keyring or KDE wallet. crbug.com/571003 crbug.com/991424
  "--password-store=basic",
  // Use mock keychain on Mac to prevent blocking permissions dialogs
  "--use-mock-keychain",
  // Disable background tracing (aka slow reports & deep reports) to avoid 'Tracing already started'
  "--force-fieldtrials=*BackgroundTracing/default/",
  // Suppresses hang monitor dialogs in renderer processes. This flag may allow slow unload handlers on a page to prevent the tab from closing.
  "--disable-hang-monitor",
  // Reloading a page that came from a POST normally prompts the user.
  "--disable-prompt-on-repost",
  // Disables Domain Reliability Monitoring, which tracks whether the browser has difficulty contacting Google-owned sites and uploads reports to Google.
  "--disable-domain-reliability",
  // Disable the in-product Help (IPH) system.
  "--propagate-iph-for-testing",
  "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "--password_manager_enabled=false",
];

async function createBrowser() {
  try {
    if (global.finished == true) return;

    global.browser = null;
    // set userDataDir to project directory
    const userDataDir = path.join(appRoot.toString(), "userProfile");
    if (fs.existsSync(userDataDir)) {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(userDataDir);
    // console.log('Launching the browser...');

    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args,
    //   userDataDir,
    //   ignoreDefaultFlags: true,
    //   defaultViewPort: null,
    //   // executablePath: "/usr/bin/google-chrome-stable",
    // });
    const chromePath = findChromeExecutable(
      path.join(appRoot.toString(), ".cache", "puppeteer", "chrome")
    );
    const { browser } = await connect({
      headless: false,
      args: args.concat(["--headless=new"]),
      ignoreAllFlags: true,
      turnstile: true,
      connectOption: { defaultViewport: null },
      disableXvfb: true,
      customConfig: {
        userDataDir,
        // chromePath: "/usr/bin/google-chrome",
        chromePath,
      },
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
      //   console.log("Target destroyed");
    });
    browser.on("targetcreated", async (target) => {
      if (target.type() === "page") {
        const page = await target.page();
        if (page !== null) {
          await page.setUserAgent(
            (await page.browser().userAgent()).replace("Headless", "")
          );
        }
      }
    });
    const page = (await browser.pages())[0];
    const client = await page._client();
    client.send("Emulation.setUserAgentOverride", {
      userAgent: (await page.browser().userAgent()).replace("Headless", ""),
    });
  } catch (e) {
    console.log(e.message);
    if (global.finished == true) return;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await createBrowser();
  }
}
function findChromeExecutable(startPath) {
  const isWindows = process.platform === "win32";
  const searchPattern = isWindows ? "chrome.exe" : "chrome";
  let result = null;

  function searchRecursively(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        searchRecursively(filePath);
      } else if (file.toLowerCase() === searchPattern.toLowerCase()) {
        result = filePath;
        return;
      }
    }
  }

  searchRecursively(startPath);
  return result;
}
createBrowser();
