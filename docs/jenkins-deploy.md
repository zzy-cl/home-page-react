# Jenkins 流水线部署

> **事实基线**：2026-10-19 按仓库当前配置与服务器实况整理；Jenkins 2.568.3（DinD 架构）。
> 服务器侧公共配置（compose 插件、dind 镜像加速、端口区间透传）为全项目共用，权威文档见「服务器部署 / Jenkins」（Notion），本文不重复。

## 前置条件

- 服务器 Jenkins 已完成公共配置：`docker compose` 插件、dind 镜像加速、端口区间 `5081-5099` 透传至宿主机回环；
- GitHub 仓库 `github.com/zzy-cl/home-page-react`，分支 `master`；
- Jenkins 任务 `home-page-react`：定义 = Pipeline script from SCM，Script Path = `Jenkinsfile`（仓库根目录）。

## 部署链路

```
git push（master）
  → Jenkins SCM checkout（/var/jenkins_home/workspace/home-page-react）
  → stage 构建镜像：dind 内 docker build
      ├─ node:24-alpine：npm config npmmirror → npm ci → tsc -b && vite build
      └─ nginx:alpine：COPY dist → /usr/share/nginx/html + nginx.conf
  → 镜像 home-page:latest
  → stage 部署：docker compose -f deploy/docker-compose.yml up -d
  → 容器 80 → dind 5081 → 透传 → 宿主机 127.0.0.1:5081 → 宿主 nginx 反代 → https://域名
```

## 配置文件与可调参数

| 文件 | 作用 | 可自定义项 |
|---|---|---|
| `Dockerfile` | 两阶段：node:24-alpine 构建、nginx:alpine 托管 | node 版本；npm 源；产物路径（默认 dist） |
| `nginx.conf` | SPA 路由 + gzip_static | root 路径（须与 Dockerfile 的 COPY 目标同步修改） |
| `deploy/docker-compose.yml` | 运行编排 | 宿主端口（区间 5081-5099 内挑；改后同步宿主 nginx 的 proxy_pass） |
| `Jenkinsfile` | 流水线定义 | 镜像名/备份 tag；部署命令 |
| `.dockerignore` | 构建上下文裁剪 | 新增无需进镜像的大目录时补充 |

两条同步规则（只改一半必出问题）：

- 改产物目录：Dockerfile 的 `COPY --from=build` 目标 与 nginx.conf 的 `root` 两处同步；
- 改端口：deploy compose 的宿主端口 与 宿主 nginx 的 `proxy_pass` 两处同步。

## Jenkins 任务配置

任务 `home-page-react`，三处关键配置：

- 定义：**Pipeline script from SCM**（停留在"Pipeline script"内联且留空，会出现秒完成的假成功，见常见问题）；
- SCM：Git，URL `https://github.com/zzy-cl/home-page-react.git`，私有仓库需配 GitHub PAT 凭据；
- Branch Specifier：`*/master`，Script Path：`Jenkinsfile`（仓库根，保持默认）。

触发方式：手动 Build Now；自动化在 GitHub 仓库 Settings → Webhooks 配置 push 事件（需 GitHub 插件，Jenkins 5080 需公网可达）。

## 验证

1. Jenkins 构建 #N 显示 `Finished: SUCCESS`，且 Console 含 `Obtained Jenkinsfile from git ...` 与两个 stage 的输出；
2. `docker exec jenkins-docker docker ps` 可见 `deploy-home-page-1`；
3. `curl -I http://127.0.0.1:5081` 返回 200（站点容器 80 经透传链）；
4. 宿主 nginx 配置域名与证书后：`curl -I https://<域名>` 返回 200。

## 日常更新与回滚

- 更新：本地提交推送 master → Build Now → 上线完成；
- 回滚：GitHub revert 后重新构建；高频发布可让流水线同时打 `home-page:previous` 备份 tag，回滚 = compose 改引用 + up -d；
- 资源：构建在 dind 内进行，峰值内存 1-2GB；定期 `docker builder prune` 清理 dind 构建缓存。

## 常见问题

- **构建秒完成、无任何 stage 输出**（仅 Start/End of Pipeline）→ 任务定义停留在内联空脚本 → 定义改为 Pipeline script from SCM；
- **Console 卡在 `git fetch ... # timeout=10`** → 国内服务器连 GitHub 不稳（10 分钟为 git 插件上限）→ 换 Gitee 镜像源，或为 Jenkins 容器配置代理；
- **容器已启动、宿主机 curl 5081 拒绝连接** → DinD 的端口映射只落在 dind 命名空间 → 站点端口必须 0.0.0.0 发布（`"5081:80"`），并由 dind 区间透传（公共配置已含；勿把前缀改回 127.0.0.1）；
- **基础镜像拉取慢或超时** → dind 镜像加速未生效 → 检查服务器 `dind-daemon.json` 的挂载与内容；
- **npm ci 失败** → 确认 `package-lock.json` 已提交且与 `package.json` 同步；
- **页面内联脚本被拦截 / HTML 报告异常** → 服务器已启用 CSP（`hudson.model.DirectoryBrowserSupport.CSP`）→ 按需放宽策略，处置见服务器文档。
