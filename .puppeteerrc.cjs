const { join } = require("path");
const appRoot = require("app-root-path");
/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Download Chrome (default `skipDownload: false`).
  chrome: {
    skipDownload: true,
  },
  // Download Firefox (default `skipDownload: true`).
  firefox: {
    skipDownload: true,
  },
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(appRoot.toString(), ".cache", "puppeteer"),
};
