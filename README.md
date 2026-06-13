# pmbaobao

本项目是在本地运行的 `pmbaobao.com` 风格导航站。前端呈现原站导航首页形态，后端使用 Next.js API，数据来自公开首页 HTML 抓取后写入本地 SQLite。

## 启动

```bash
pnpm install
pnpm db:init
pnpm sync
pnpm dev
```

打开：

```text
http://localhost:3000
```

## 常用命令

```bash
pnpm sync       # 重新抓取公开首页并写入 SQLite
pnpm test       # 运行解析器测试
pnpm build      # 生产构建
pnpm smoke:api  # 需要 dev server 运行中
```

## 数据库

SQLite 文件位于：

```text
prisma/dev.db
```

重新初始化数据库：

```bash
pnpm db:reset
pnpm sync
```

## 数据边界

项目只抓取 `https://www.pmbaobao.com/` 首页公开 HTML 中可见的数据，包括分类、站点名称、描述、外链和图标地址。不会连接或模拟原站私有后端。
