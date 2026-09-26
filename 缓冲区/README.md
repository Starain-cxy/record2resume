# 缓冲区

缓冲区保存生成简历所需的模板和提示词，不保存个人事实副本。

## HTML

`HTML/templates` 存放响应式 HTML 简历模板。同一份语义化 HTML 可以支持连续网页和打印分页，优先使用 Microsoft Edge 或兼容的 Chromium 渲染器预览及导出 PDF。

模板由三个文件组成：

- `template.html`：不含真实个人信息的中性骨架；
- `styles.css`：颜色主题、字体、响应式布局和打印分页规则；
- `resume.js`：网页视图／打印预览切换与轻量布局诊断；禁用 JavaScript 时正文仍完整可见。

具体简历从模板复制生成，写入 `output/HTMLOutput/<简历名称>/`，不得把个人内容写回模板。

## Prompts

`Prompts` 存放索引维护和 HTML 简历编写提示词，由 agent 在工作区里直接执行，使用方式见 [`Prompts/README.md`](Prompts/README.md)。索引位于 `内容区/索引.md`，只帮助定位原始材料；简历事实必须回到内容区核验。

本项目统一以 HTML／CSS 作为排版层，不引入 LaTeX；打印质量由 `@page`、`@media print` 和 Edge／Chromium 的导出能力保证。
