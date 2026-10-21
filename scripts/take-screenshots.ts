import puppeteer from "puppeteer-core";
import * as path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  console.log("Launching Chrome at:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440px
  console.log("Capturing Desktop 1440px...");
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 15000 });

  // Check computed font
  const computedBodyFont = await page.evaluate(() => {
    return window.getComputedStyle(document.body).fontFamily;
  });
  const computedH1Font = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return h1 ? window.getComputedStyle(h1).fontFamily : "none";
  });

  console.log("Computed body font-family:", computedBodyFont);
  console.log("Computed h1 font-family:  ", computedH1Font);

  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-desktop-1440.png"),
    fullPage: false,
  });

  // 2. Laptop 1280px
  console.log("Capturing Laptop 1280px...");
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-laptop-1280.png"),
    fullPage: false,
  });

  // 3. Mobile 390px
  console.log("Capturing Mobile 390px...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-mobile-390.png"),
    fullPage: false,
  });

  // 4. Typography Test Page
  console.log("Capturing Typography Test Page...");
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000/typography-test", { waitUntil: "networkidle0", timeout: 15000 });
  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-typography-test.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
