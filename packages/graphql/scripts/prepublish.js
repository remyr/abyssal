const path = require("path");
const execSync = require("child_process").execSync;

const package = require("../package.json");
const absPath = path.join(__dirname, "..");

console.log("==============================");
console.log(`Building: ${package.name}`);
console.log("==============================");

execSync(`cd ${absPath} && npm run compile`);
