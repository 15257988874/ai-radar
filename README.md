# AI Radar

面向中文读者的 AI 资讯、工具和开源项目发现站。网站由 GitHub Pages 提供公开访问，资讯与 GitHub 开源热度榜由 GitHub Actions 定时生成静态 JSON 数据。

## 本地运行

```bash
npm install
npm run dev
```

刷新公开数据并写入首份或最新快照：

```bash
npm run data:refresh
```

采集器使用 OpenAI RSS、GitHub AI 官方博客 RSS 和 GitHub 公开仓库搜索 API。资讯按小时更新；GitHub 榜单每天更新一次，周榜和月榜从已存储的日快照聚合。GitHub 没有官方 Trending API，因此页面中的 GitHub 榜单是基于公开仓库搜索生成的开源热度榜。

## 发布到 GitHub Pages

1. 在 GitHub 创建一个仓库，并将本目录内容推送到默认 `main` 分支。
2. 进入仓库 **Settings -> Pages**，将 **Source** 设为 **GitHub Actions**。
3. 在仓库 **Settings -> Actions -> General** 中将工作流权限设为 **Read and write permissions**，允许刷新工作流提交生成的数据快照。
4. 推送到 `main` 后，`Deploy GitHub Pages` 工作流会自动生成站点并发布。发布地址为 `https://<GitHub 用户名或组织>.github.io/<仓库名>/`。

`Refresh public data` 每小时运行一次。某个资讯源暂时不可用时，不会清空站点上的上一份有效数据；只有资讯和榜单都无法获得有效内容时，工作流才会报错。

## 数据文件

- `public/data/news.json`: 最新公开资讯清单与生成时间。
- `public/data/trending.json`: GitHub 日、周、月热度榜与生成时间。
- `data/snapshots/github-YYYY-MM-DD.json`: 用于生成滚动周榜和月榜的每日快照。
