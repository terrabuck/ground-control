/*eslint-disable no-unused-vars*/
const fs = require("fs");
const got = require("got");
const path = require("path");
const chokidar = require("chokidar");
const configFile = path.normalize(__dirname.replace(/[\\|\/]?resources.*/, "").replace(/app.*/, "").replace(/[\/|\\]src.*$/, "") + "/config.json"); 
const { shell, remote } = require("electron");
var pack;
if (fs.existsSync('./package.json')) {
    pack = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} else if (fs.existsSync('./resources/app/package.json')) {
    pack = JSON.parse(fs.readFileSync('./resources/app/package.json', 'utf8'));
} else if (fs.existsSync('./resources/app.asar')) {
    pack = JSON.parse(fs.readFileSync('./resources/app.asar/package.json', 'utf8'));
} else if (fs.existsSync(__filename.replace(/src.*/, "") + "package.json")) {
    pack = JSON.parse(fs.readFileSync(__filename.replace(/src.*/, "") + "package.json", 'utf8'));
}