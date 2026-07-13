# jung.github.io

这个 homepage 现在是数据驱动的静态页面，整体风格参考简洁学术主页，只保留少量冒险岛风格小元素作为点缀。

日常更新只需要改 `homepage-data.js`：

- `profile`：姓名、邮箱、头像、链接
- `mapleQuote`：绿水灵和花蘑菇之间的短句
- `about`：个人简介段落
- `publications`：论文；页面会按年份分组并自动编号
- `honors`：获奖
- `projects`：已申报项目；支持 `title`、`role`、`agency`、`period`、`status`、`description`
- `service`：审稿和程序委员会经历

页面结构在 `index.html`，视觉样式在 `styles.css`，自动渲染逻辑在 `script.js`。一般更新内容时不需要改这三个文件。

冒险岛点缀图在 `images/mob-slime.webp` 和 `images/mob-orange-mushroom.webp`，页面里只作为很小的侧栏装饰使用。
