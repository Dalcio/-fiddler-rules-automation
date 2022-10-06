const { statSync, readdirSync, writeFile } = require("fs");

const FILES_DIR = "";
const CLOUD_PATH = "";

const filesPattern = /.(js|css)(.map){0,1}$/;

/**
 * return the templated rules
 * @param {string[]} rules
 * @returns
 */
const rulesBuilder = (rules = []) => `
<?xml version="1.0" encoding="utf-8"?>
<AutoResponder LastSave="2022-10-06T09:11:35.5287626+01:00" FiddlerVersion="5.0.20211.51073">
  <State Enabled="true" AcceptAllConnects="false" Fallthrough="true" UseLatency="false">
    ${rules.map((rule) => rule)}
  </State>
</AutoResponder>`;

/**
 * return the rule template
 * @param {string} fileName
 */
const ruleTemplate = (fileName, filePath) =>
  `<ResponseRule
    Match="${CLOUD_PATH}${fileName}"
    Action="${filePath}"
    Enabled="true"
  />`;

/**
 * get all files that match the given pattern from the given path and his subdirectories
 * @param {string} dirName
 * @param {{name:string, path: string}[]} files
 */
const getDirFiles = (dirName, files = []) => {
  const dirFiles = readdirSync(dirName);

  dirFiles.forEach((file) => {
    if (!statSync(`${dirName}\\${file}`).isDirectory()) {
      if (filesPattern.test(file)) {
        files.push({ name: file, path: `${dirName}\\${file}` });
      }
    } else {
      getDirFiles(`${dirName}\\${file}`, files);
    }
  });

  return files;
};

/**
 *
 * @param {string} content
 */

const createFiddlerRulesFarxFile = (content) => {
  writeFile("fiddler-rules.farx", content, function (err) {
    if (err) throw err;
    console.log("done");
  });
};

const main = () => {
  const dirFiles = getDirFiles(FILES_DIR, []);
  const filesRule = dirFiles.map((file) => ruleTemplate(file.name, file.path));
  const rules = rulesBuilder(filesRule);

  createFiddlerRulesFarxFile(rules);
};

main();
