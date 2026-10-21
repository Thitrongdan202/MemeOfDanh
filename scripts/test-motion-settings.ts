import puppeteer from "puppeteer-core";
import * as path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  console.log("Starting full automated browser test...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0" });

  // 1. Capture initial Light Mode Desktop
  console.log("1. Capturing Light Mode Desktop...");
  await page.screenshot({
    path: path.join(process.cwd(), "test-light-mode.png"),
  });

  // 2. Open Settings Drawer
  console.log("2. Opening Settings Drawer...");
  await page.evaluate(() => {
    const btn = document.querySelector("button[data-cursor='CÀI ĐẶT']") as HTMLElement;
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(process.cwd(), "test-settings-drawer-open.png"),
  });

  // 3. Switch to Dark Mode in Settings
  console.log("3. Switching to Dark Theme in Settings...");
  await page.evaluate(() => {
    const darkBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Tối")
    );
    if (darkBtn) (darkBtn as HTMLElement).click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 4. Change Accent Color to Coral in Settings
  console.log("4. Changing Accent Color to Coral...");
  await page.evaluate(() => {
    const coralBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Coral")
    );
    if (coralBtn) (coralBtn as HTMLElement).click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(process.cwd(), "test-settings-dark-coral.png"),
  });

  // 5. Close Settings Drawer
  console.log("5. Closing Settings Drawer...");
  await page.evaluate(() => {
    const applyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Áp dụng")
    );
    if (applyBtn) (applyBtn as HTMLElement).click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 6. Capture Dark Mode Desktop with Coral Accent
  console.log("6. Capturing Dark Mode Desktop with Coral Accent...");
  await page.screenshot({
    path: path.join(process.cwd(), "test-dark-mode-desktop.png"),
  });

  // 7. Scroll to Gallery in Dark Mode
  console.log("7. Capturing Dark Mode Gallery...");
  await page.evaluate(() => {
    const gal = document.getElementById("gallery-section");
    if (gal) gal.scrollIntoView();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(process.cwd(), "test-dark-mode-gallery.png"),
  });

  // 8. Open Lightbox in Dark Mode
  console.log("8. Opening Lightbox in Dark Mode...");
  await page.evaluate(() => {
    const firstCard = document.querySelector("#gallery-section .cursor-pointer") as HTMLElement;
    if (firstCard) firstCard.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(process.cwd(), "test-dark-mode-lightbox.png"),
  });

  // 9. Close Lightbox and capture Mobile Viewport
  console.log("9. Testing Mobile 390px Viewport in Dark Mode...");
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));

  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(process.cwd(), "test-dark-mode-mobile.png"),
  });

  // 10. Check LocalStorage persistence
  const savedSettings = await page.evaluate(() => {
    return localStorage.getItem("memeofdanh_settings_v2");
  });
  console.log("Saved Settings in LocalStorage:", savedSettings);

  await browser.close();
  console.log("All automated tests completed successfully!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
