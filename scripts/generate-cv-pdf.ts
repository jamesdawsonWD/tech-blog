import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { EXPERIENCE, SKILL_CATEGORIES } from "../lib/cv-data";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MUTED_FOREGROUND = "hsl(25, 5.3%, 44.7%)";
const BACKGROUND = "hsl(72, 83%, 98%)";
const MUTED_BG = "hsla(60, 4.8%, 95.9%, 0.6)";

function buildHtml(): string {
  const experienceHtml = EXPERIENCE.map(
    (job) => `
      <div class="job">
        <div class="job-header">
          <span class="job-title-group">
            <span class="job-role">${escapeHtml(job.role)}</span>
            <span class="job-company">${escapeHtml(job.company)}</span>
          </span>
          <span class="job-period">${escapeHtml(job.period)}</span>
        </div>
        <p class="job-description">${escapeHtml(job.description)}</p>
      </div>
    `
  ).join("");

  const skillsHtml = SKILL_CATEGORIES.flatMap((cat) =>
    cat.items.map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`)
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>James Dawson - CV</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: ${BACKGROUND};
      min-height: 100%;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: #141414;
      padding: 2.5rem 4rem;
      max-width: 42rem;
      margin: 0 auto;
      font-size: 13px;
      line-height: 1.5;
    }
    .intro {
      margin-bottom: 3rem;
      font-weight: 400;
      letter-spacing: -0.0125em;
    }
    .intro strong { font-weight: 600; }
    .jobs { margin-bottom: 3rem; }
    .job { margin-bottom: 1.25rem; }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
    }
    .job-title-group {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.5rem;
    }
    .job-role { font-weight: 600; color: #141414; }
    .job-company { color: ${MUTED_FOREGROUND}; }
    .job-period {
      font-size: 12px;
      color: ${MUTED_FOREGROUND};
      flex-shrink: 0;
    }
    .job-description {
      margin-top: 0.5rem;
      color: #141414;
      letter-spacing: -0.0125em;
    }
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 3rem;
    }
    .skill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
      background: ${MUTED_BG};
      font-size: 12px;
      color: #141414;
    }
    .education p:first-child { font-weight: 600; color: #141414; }
    .education p { font-size: 12px; color: ${MUTED_FOREGROUND}; }
  </style>
</head>
<body>
  <p class="intro">
    Hi, I am James Dawson. <strong>Senior Design Engineer</strong> building beautiful experiences and crafting wonderful UIs for
    modern web products. Primarily in the Web3.
  </p>

  <div class="jobs">
    ${experienceHtml}
  </div>

  <div class="skills">
    ${skillsHtml}
  </div>

  <div class="education">
    <p>University of Stirling</p>
    <p>Software Engineering BEng</p>
    <p>2012–2017</p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  const html = buildHtml();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("print");

  const outputPath = join(__dirname, "..", "public", "cv.pdf");
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  await page.pdf({
    format: "A4",
    printBackground: true,
    path: outputPath,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`PDF written to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
