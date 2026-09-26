const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFileSync } = require('child_process');

const playwrightModule = process.env.CODEX_PLAYWRIGHT_MODULE;
if (!playwrightModule) {
  throw new Error('缺少 CODEX_PLAYWRIGHT_MODULE；请通过配套 PowerShell 脚本运行。');
}
const { chromium } = require(playwrightModule);

function parseArgs(argv) {
  const options = { inputs: [], pageCheck: true, expectedPages: 0 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--input') options.inputs.push(argv[++index]);
    else if (token === '--scan-root') options.scanRoot = argv[++index];
    else if (token === '--output') options.output = argv[++index];
    else if (token === '--expected-pages') options.expectedPages = Number(argv[++index]);
    else if (token === '--no-page-check') options.pageCheck = false;
    else throw new Error(`未知参数：${token}`);
  }
  return options;
}

function findResumeHtml(root) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile() && entry.name.toLowerCase() === 'index.html') found.push(fullPath);
    }
  };
  visit(root);
  return found.sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function normalizeInput(input) {
  const resolved = path.resolve(input);
  const stat = fs.statSync(resolved);
  const html = stat.isDirectory() ? path.join(resolved, 'index.html') : resolved;
  if (!fs.existsSync(html) || path.extname(html).toLowerCase() !== '.html') {
    throw new Error(`输入不是可读取的 HTML 文件：${html}`);
  }
  return html;
}

function chooseOutput(html, explicitOutput) {
  if (explicitOutput) return path.resolve(explicitOutput);
  const directory = path.dirname(html);
  const existingPdfs = fs.readdirSync(directory)
    .filter((name) => path.extname(name).toLowerCase() === '.pdf');
  if (existingPdfs.length === 1) return path.join(directory, existingPdfs[0]);
  return path.join(directory, `${path.basename(directory)}.pdf`);
}

function countPdfPages(pdfPath) {
  const pdfInfo = process.env.PDFINFO_PATH;
  if (!pdfInfo || !fs.existsSync(pdfInfo)) return null;
  const details = execFileSync(pdfInfo, [pdfPath], { encoding: 'utf8' });
  const match = details.match(/^Pages:\s+(\d+)\s*$/m);
  return match ? Number(match[1]) : null;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let inputs = options.inputs.map(normalizeInput);
  if (options.scanRoot) inputs.push(...findResumeHtml(path.resolve(options.scanRoot)));
  inputs = [...new Set(inputs)];

  if (inputs.length === 0) throw new Error('没有找到待导出的 index.html。');
  if (options.output && inputs.length !== 1) {
    throw new Error('--output 只能与一个输入文件同时使用。');
  }

  const browserPath = process.env.RESUME_BROWSER_PATH;
  const browser = await chromium.launch({ executablePath: browserPath, headless: true });
  let failures = 0;

  try {
    for (const html of inputs) {
      const output = chooseOutput(html, options.output);
      fs.mkdirSync(path.dirname(output), { recursive: true });

      const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
      try {
        await page.emulateMedia({ media: 'print' });
        const url = pathToFileURL(html);
        url.searchParams.set('view', 'print');
        await page.goto(url.href, { waitUntil: 'networkidle' });

        const metadata = await page.evaluate(async () => {
          document.documentElement.dataset.view = 'print';
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          return {
            title: document.title || '未命名简历',
            pagination: document.documentElement.dataset.pagination || '',
          };
        });

        await page.pdf({
          path: output,
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
        });

        const pages = countPdfPages(output);
        const expected = options.expectedPages > 0
          ? options.expectedPages
          : metadata.pagination === 'single' ? 1 : 0;
        const pageSummary = pages === null ? '页数未知（未找到 pdfinfo）' : `${pages} 页`;

        if (options.pageCheck && expected > 0 && pages !== null && pages !== expected) {
          failures += 1;
          console.error(`[FAIL] ${metadata.title}：${pageSummary}，期望 ${expected} 页`);
          console.error(`       ${output}`);
        }
        else {
          console.log(`[OK] ${metadata.title}：${pageSummary}`);
          console.log(`     ${output}`);
        }
      }
      finally {
        await page.close();
      }
    }
  }
  finally {
    await browser.close();
  }

  if (failures > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
});

