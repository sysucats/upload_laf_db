const fs = require("node:fs");
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const { resolve } = require("node:path");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

async function waitLine(prompt) {
    return new Promise((resolve, _) => {
        readline.question(prompt, line => {
            resolve(line);
        });
    });
}



async function checkFileExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

async function runCmd(cmd, quite) {
    var {stdout, stderr} = await exec(cmd);
    if (quite) {
        return;
    }
    console.log(stdout);
    console.error(stderr);
}

module.exports = {
    waitLine,
    checkFileExists,
    runCmd
}