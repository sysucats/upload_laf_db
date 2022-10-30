const fs = require("node:fs");
const spawn = require('await-spawn')
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

async function runCmd(cmd, args, quite) {
    try {
        const bl = await spawn(cmd, args, {shell: true})
        if (quite) {
            return;
        }
        console.log(bl.toString())
    } catch (e) {
        console.log(cmd, args);
        throw e.stderr.toString();
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/'/g, "'QUOT")
        .replace(/&/g, "'AND")
        .replace(/</g, "'LT")
        .replace(/>/g, "'GT")
 }

module.exports = {
    waitLine,
    checkFileExists,
    runCmd,
    escapeHtml
}