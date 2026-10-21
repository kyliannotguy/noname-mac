const fs = require("node:fs"); const path = require("node:path");
module.exports = async context => { fs.cpSync(path.resolve(__dirname, "../game"), path.join(context.appOutDir, "无名杀.app/Contents/Resources/game"), { recursive: true }); };
