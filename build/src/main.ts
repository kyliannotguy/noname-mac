/// <reference types="vite/client" />
import { app, BrowserWindow, crashReporter, dialog, Menu, shell } from "electron";
import fs from "fs";
import path from "path";
import remote from "@electron/remote/main/index.js";
import createApp from "../fs-src/index";
remote.initialize();
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) { app.quit(); process.exit(0); }
const dataRoot = path.join(app.getPath("appData"), "Noname");
const dirname = path.join(dataRoot, "game-v1.11.6");
const bundleRoot = app.isPackaged ? path.join(process.resourcesPath, "game") : path.resolve(import.meta.dirname, "../../game");
fs.mkdirSync(dataRoot, { recursive: true });
if (!fs.existsSync(path.join(dirname, ".installed-v1.11.6-mac2"))) {
    fs.cpSync(bundleRoot, dirname, { recursive: true });
    fs.writeFileSync(path.join(dirname, ".installed-v1.11.6-mac2"), "1.11.6");
}
process.env.NONAME_GAME_DIR = dirname;
const server = createApp({ port: 8089, dirname, server: true });
app.setAppUserModelId("com.libnoname.noname");

//防止32位无名杀的乱码
app.setName("无名杀");

function setPath(path1: any, path2: any) {
	app.getPath(path1);
	fs.mkdirSync(path2, { recursive: true });
	app.setPath(path1, path2);
}

setPath("userData", path.join(dataRoot, "UserData"));
setPath("crashDumps", path.join(dataRoot, "crashDumps"));
setPath("logs", path.join(dataRoot, "logs"));

//崩溃处理
crashReporter.start({
	productName: "无名杀",
	//崩溃报告将被收集并存储在崩溃目录中，不会上传
	uploadToServer: false,
	compress: false,
});

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on("second-instance", (event, argv) => {
	// Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
	if (process.platform === "win32") {
		createWindow();
	}
});

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on("open-url", (event, urlStr) => {
	createWindow();
});

app.setAboutPanelOptions({
	iconPath: "noname.ico",
	website: "https://github.com/libnoname/noname",
});

process.env["ELECTRON_DEFAULT_ERROR_MODE"] = "true";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
process.noDeprecation = true;

function createWindow() {
	createMainWindow();
}

function createMainWindow() {
	let win = new BrowserWindow({
		width: 1000,
		height: 800,
		title: "无名杀",
		icon: path.join(dirname, "noname.ico"),
		webPreferences: {
			webSecurity: false,
			preload: path.join(import.meta.dirname, "preload.cjs"),
			nodeIntegration: true, //主页面用node
			nodeIntegrationInSubFrames: true, //子页面用node
			nodeIntegrationInWorker: true, //worker用node
			contextIsolation: false, //必须为false
			plugins: true, //启用插件
			// @ts-ignore
			enableRemoteModule: true, //可以调用Remote
			experimentalFeatures: true, //启用Chromium的实验功能
		},
	});
	if (false) {
		win.loadURL(`http://localhost:8080`);
	} else {
		win.loadURL(`http://localhost:8089/index.html`);
	}
	remote.enable(win.webContents);
	const menuTemplate: Electron.MenuItemConstructorOptions[] = [
 { label: "无名杀", submenu: [{role: "about"}, {type: "separator"}, {role: "hide"}, {role: "hideOthers"}, {role: "unhide"}, {type: "separator"}, {role: "quit"}] },
 { label: "编辑", submenu: [{role:"undo"}, {role:"redo"}, {type:"separator"}, {role:"cut"}, {role:"copy"}, {role:"paste"}, {role:"selectAll"}] },
		{
			label: "操作",
			submenu: [
				{
					label: "打开无名杀目录",
					click: () => {
						shell.openPath(dirname);
					},
				},
			],
		},
		{
			label: "窗口",
			submenu: [
				{
					label: "重新加载当前窗口",
					role: "reload",
				},
				{
					label: "打开/关闭控制台",
					role: "toggleDevTools",
				},
				{
					type: "separator",
				},
				{
					label: "全屏模式",
					role: "togglefullscreen",
				},
				{
					label: "最小化",
					role: "minimize",
				},
				{
					type: "separator",
				},
			],
		},
		{
			label: "帮助",
			submenu: [
				{
					label: "bug反馈",
					click: () => {
						shell.openExternal("https://tieba.baidu.com/p/9117747182");
					},
				},
				{
					label: "版权声明",
					click: () => {
						dialog.showMessageBoxSync(win, {
							message:
								"【无名杀】属于个人（水乎）开发项目且【完全免费】。如非法倒卖用于牟利将承担法律责任 开发团队将追究到底",
							type: "info",
							title: "版权声明",
							icon: path.join(app.getAppPath(), "app", "noname.ico"),
						});
					},
				},
			],
		},
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
	return win;
}

app.whenReady().then(async () => {
 await server.ready();
	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("before-quit", () => { server.close(); });

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
