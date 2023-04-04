const fs = require("node:fs");
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
    // runCmd,
    escapeHtml
}