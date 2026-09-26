# output

本目录保存由模板生成的具体简历，是「成品层」，不是事实来源。

## 目录约定

```text
output/
└── HTMLOutput/
    └── <简历名称>/
        ├── index.html     # 本次简历正文
        ├── styles.css     # 本次简历的样式（通常来自模板）
        └── <简历名称>.pdf  # 由 Edge/Chromium 导出
```

- 每份简历一个独立目录，目录名说明语言、目标或岗位、用途，例如 `中文通用简历-单页`、`英文-数据科学实习-直接投递`。
- 目录中必须存在 `index.html`，[`scripts/export-html-resume-pdf.ps1`](../scripts/README.md) 默认按这个文件名扫描。
- 本目录由 agent 执行 `缓冲区/Prompts/HTML简历编写.md` 时写入；**不要把它当作唯一版本**，内容更新后应重新生成，而不是手工维护这里的历史文件。
- 公开版与直接投递版分开存放，不要互相覆盖。
