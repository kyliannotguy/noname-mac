# 无名杀 macOS（非官方封装）

基于 [libnoname/noname v1.11.6](https://github.com/libnoname/noname/releases/tag/v1.11.6) 的 macOS Apple 芯片（ARM64）桌面版。游戏由上游项目及其贡献者开发，本仓库提供 Mac 适配代码与安装包，不代表上游官方发布。

## 下载与安装

前往 [Releases](https://github.com/kyliannotguy/noname-mac/releases/latest) 下载 DMG，打开后将“无名杀”拖入“应用程序”。只适用于 Apple 芯片 Mac，不支持 Intel Mac。

此版本使用本机临时签名，未进行 Apple 开发者公证。下载后 macOS 可能提示无法验证开发者；确认来源后可通过“系统设置 → 隐私与安全性”使用系统提供的“仍要打开”。无需关闭系统安全保护。

`SHA256SUMS.txt` 提供安装包 SHA-256 校验值。

## 版本与验证范围

- 游戏：1.11.6；Electron：39.5.2 ARM64。
- 已在 Apple 芯片、macOS 27.0.1 上启动并验证选将界面和武将图片。
- 尚未完整验证所有模式、联机功能及较早 macOS 版本。
- 游戏资源和 Electron 均核对了上游 SHA-256。
- Release 安装包由 GitHub Actions 从本仓库源码构建，并执行应用签名与磁盘镜像校验；与本机测试版本使用同一套适配源码。

## 存档与游戏目录

- 存档、配置：`~/Library/Application Support/Noname/UserData`
- 可写游戏资源：`~/Library/Application Support/Noname/game-v1.11.6`

卸载应用不会自动删除这些目录。首次启动会复制完整资源，请预留约 4 GB 磁盘空间。

## 适配源码与构建

`build/src` 是修改后的桌面入口与 preload，`build/fs-src` 是上游文件服务源码（仅监听本机），`patches/node.js` 是修改后的游戏 Node 资源适配文件。改动包括 Mac 菜单、存档分离、首次启动复制资源、修正资源路径，以及避免打包时遗漏浏览器依赖。

在 Apple 芯片 Mac 上，准备 Node.js/npm、Python 3 与系统命令行工具后执行：

```sh
python3 prepare.py
cd build
npm ci --ignore-scripts
npx esbuild src/main.ts --bundle --platform=node --format=esm --packages=external --outfile=app/main.js
npx esbuild src/preload.ts --bundle --platform=node --format=cjs --packages=external --outfile=app/preload.cjs
npx electron-builder --mac --arm64 --dir
/usr/bin/codesign --force --deep --sign - '../output/mac-arm64/无名杀.app'
```

`prepare.py` 下载固定版本的官方完整资源和 Electron，验证哈希后解压并应用资源路径适配。生成的应用位于 `output/mac-arm64/无名杀.app`。本仓库不包含个人存档、账号或本机日志。

## 上游与许可

- [游戏源码 v1.11.6](https://github.com/libnoname/noname/tree/v1.11.6)
- [官方完整资源](https://github.com/libnoname/noname/releases/tag/v1.11.6)
- [Electron](https://github.com/electron/electron/tree/v39.5.2)

游戏及本仓库适配代码遵循 GPL-3.0-only，详见 LICENSE。Electron 与第三方依赖保留各自许可证。Release 同时提供上游对应源码下载链接和 Mac 适配源码存档；图片、音频等资源权利归各自权利人所有。
