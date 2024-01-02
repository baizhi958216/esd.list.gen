const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const roleOptionIndex = args.indexOf("--role");
const dirInputIndex = args.indexOf("--input");
const languageOptionIndex = args.indexOf("--language");

if (roleOptionIndex === -1 || languageOptionIndex === -1) {
  console.log('请提供正确的命令行参数：--role "角色名字" --language "语言"');
  process.exit(1);
}

const roleName = args[roleOptionIndex + 1];
const language = args[languageOptionIndex + 1];
let dirInput = ".";
if (dirInputIndex !== -1) {
  dirInput = args[dirInputIndex + 1];
} else {
  console.log("没有指定输入文件夹，应用当前目录...");
}

// 读取当前目录文件列表
fs.readdir(dirInput, (err, files) => {
  if (err) {
    console.error("发生未知错误：", err);
    return;
  }

  const fileTypes = {};
  const esdListFile = path.join(__dirname, "esd.list");

  files.forEach((file) => {
    // 获取文件的扩展名
    const _extname = path.extname(file).toLowerCase();
    if (fileTypes[_extname]) {
      fileTypes[_extname].push(file);
    } else {
      fileTypes[_extname] = [file];
    }
  });

  if (!fileTypes[".wav"]) {
    console.log("没有找到任何音频文件，程序退出...");
    process.exit(0);
  }

  if (!fileTypes[".lab"]) {
    console.log("没有找到任何标注文件，程序退出...");
    process.exit(0);
  }

  if (fileTypes[".wav"].length === fileTypes[".lab"].length) {
    fileTypes[".wav"].map((file) => {
      fs.writeFileSync(esdListFile, genContent(file), { flag: "a" });
    });
    process.exit(0);
  }
});

const genContent = (file) => {
  const labsContent = fs.readFileSync(
    path.join(`${path.parse(file).name}.lab`),
    "utf-8"
  );
  return `${file}|${roleName}|${language}|${labsContent}\n`;
};
