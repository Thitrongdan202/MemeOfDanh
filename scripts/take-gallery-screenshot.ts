import puppeteer from "puppeteer-core";
import * as path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 15000 });

  // Scroll to gallery
  await page.evaluate(() => {
    const el = document.getElementById("gallery-section");
    if (el) el.scrollIntoView();
  });

  // Wait a moment for images to load
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-gallery-1440.png"),
    fullPage: false,
  });

  // Click on the first artwork to open lightbox
  console.log("Testing Lightbox modal open...");
  await page.evaluate(() => {
    const firstCard = document.querySelector("#gallery-section .cursor-pointer") as HTMLElement;
    if (firstCard) firstCard.click();
  });

  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(process.cwd(), "screenshot-lightbox.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("Gallery & Lightbox screenshots captured!");
}

run().catch((err) => {
  console.error("Gallery screenshot error:", err);
  process.exit(1);
});
