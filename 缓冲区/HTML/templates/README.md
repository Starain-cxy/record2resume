# HTML 简历模板

这套模板使用同一份语义化 HTML 同时提供两种视图：

- `screen`：连续、响应式的个人主页视图，不模拟分页。
- `print`：A4 打印预览和 PDF 导出视图。

## 文件

- `template.html`：不含真实个人信息的中性模板。
- `styles.css`：共享设计、响应式布局和打印规则。
- `resume.js`：视图切换与轻量布局诊断；禁用 JavaScript 时正文仍完整可见。

## 使用

1. 将三个文件复制到具体简历目录，不要把个人信息写回本模板。
2. 编辑 HTML 中的占位内容和 `<html lang>`。
3. 在 Microsoft Edge 中直接打开 `template.html`。
4. 页面右上角可切换网页视图和打印预览；URL 也支持 `?view=screen` 与 `?view=print`。
5. 导出 PDF 时选择“打印”：纸张 A4、缩放 100%、边距“无”、关闭“页眉和页脚”、开启“背景图形”。纸张边距已经由 CSS 的 `@page` 控制。

需要稳定、批量导出时，优先使用项目根目录的 [`scripts/export-html-resume-pdf.ps1`](../../../scripts/README.md)。它会调用 Codex 自带的 Playwright 和本机 Edge，自动应用打印媒体样式并检查单页简历页数。

模板不使用外部 CDN、框架或网络字体，便于离线预览和迁移到个人网站。默认字体栈优先使用系统字体；具体简历可以通过 `data-font="sans|serif|mixed"` 切换。

`data-density="comfortable|standard|compact"` 控制全局密度。调整时应先改这一参数或 CSS 变量，不应逐条添加局部负边距。

`data-pagination="single|multi"` 控制打印策略：`single` 使用紧凑的单页 A4 节奏，`multi` 保留舒适行距并允许项目在合理位置续页。它只改变打印视图，不压缩个人主页的连续网页视图。
