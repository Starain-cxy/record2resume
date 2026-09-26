# HTML 简历 PDF 导出

`export-html-resume-pdf.ps1` 使用 Codex 自带的 Node.js 和 Playwright，调用本机 Microsoft Edge 的 Chromium PDF 接口导出简历。它不经过 Edge 打印窗口，也不使用“Microsoft Print to PDF”，因此能够稳定应用项目中的 `@media print`、`@page`、字体和背景样式。

## 适用范围

- 适用于 `output/HTMLOutput` 中的中文、英文、单页、多页及以后新增的 HTML 简历。
- 默认查找该目录下所有名为 `index.html` 的文件；不依赖具体简历文件夹名称。
- 对使用本项目模板的 `data-pagination="single"` 简历自动检查是否恰好一页；多页简历报告实际页数但不预设必须为两页。
- 普通 HTML 也可以导出，但如果没有专门的 `@media print` 样式，成品质量取决于网页自身。

## 最简单的用法

直接双击：

```text
scripts/export-all-html-resumes.cmd
```

窗口会显示每份简历的输出位置和页数，完成后等待按键关闭。

也可以在项目根目录打开 PowerShell，运行：

```powershell
.\scripts\export-html-resume-pdf.ps1
```

它会扫描并导出所有 HTML 简历。每个简历目录中：

- 已有且仅有一个 PDF 时，覆盖该 PDF，保持现有文件名；
- 没有 PDF 或存在多个 PDF 时，输出为 `<简历文件夹名>.pdf`。

如果 PowerShell 阻止执行本地脚本，可仅对本次运行放行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\export-html-resume-pdf.ps1
```

## 导出指定简历

可传入 HTML 文件或包含 `index.html` 的目录：

```powershell
.\scripts\export-html-resume-pdf.ps1 `
  -InputPath ".\output\HTMLOutput\中文通用简历-单页"
```

一次导出多个指定文件：

```powershell
.\scripts\export-html-resume-pdf.ps1 -InputPath @(
  ".\output\HTMLOutput\中文通用简历-单页\index.html",
  ".\output\HTMLOutput\英文通用简历-多页有衬线\index.html"
)
```

## 指定输出文件或页数

`-OutputPath` 只能用于单个输入：

```powershell
.\scripts\export-html-resume-pdf.ps1 `
  -InputPath ".\output\HTMLOutput\中文通用简历-单页\index.html" `
  -OutputPath ".\output\自定义名称.pdf"
```

临时要求某份简历必须为指定页数：

```powershell
.\scripts\export-html-resume-pdf.ps1 `
  -InputPath ".\output\HTMLOutput\英文通用简历-多页有衬线" `
  -ExpectedPages 2
```

若只想导出、不检查页数：

```powershell
.\scripts\export-html-resume-pdf.ps1 -NoPageCheck
```

## 自定义 Edge 位置

脚本会依次寻找系统级和当前用户安装的 Edge。自动查找失败时可指定：

```powershell
.\scripts\export-html-resume-pdf.ps1 `
  -BrowserPath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

## 依赖与限制

- **要用本脚本，电脑上必须安装 Codex**。脚本不引入任何 npm 依赖，而是直接调用 Codex 自带的 Node.js、Playwright 和 `pdfinfo`；首次使用前至少用 Codex 打开本项目一次，让它完成本地运行环境初始化。
- 需要本机安装 Microsoft Edge，或通过 `-BrowserPath` 指定其他 Chromium 内核浏览器。
- Codex 被卸载、或其运行缓存 `%USERPROFILE%\.cache\codex-runtimes` 被清理后，重新用 Codex 打开本项目一次即可恢复。
- 导出结果会随浏览器渲染引擎和网页 CSS 的变化而变化。

## 不想安装 Codex 怎么办

不用脚本也能得到同样的成品：**直接用浏览器的打印功能导出**。

1. 在 Edge 中打开简历目录下的 `index.html`；
2. 按 `Ctrl+P`，纸张选 A4、缩放 100%、边距「无」、勾选「背景图形」、关闭「页眉和页脚」；
3. 选择「另存为 PDF」。

代价是需要手动操作、逐份导出，也没有脚本附带的页数检查。
