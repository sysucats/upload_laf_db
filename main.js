const fs = require("node:fs");
const {checkFileExists, waitLine} = require("./utils");
const { exit } = require("node:process");
const axios = require('axios').default


// 输入conf
const ConfPath = './config.json';
const DefaultUpParrallelNum = 10;
const DefaultUpStep = 1;
async function inputConf() {
    conf = {
        "comment": [
            "// 注释：",
            "// Laf console上获取信息，注意信息安全。终端黑框中右键可以粘贴。",
            "// 注意只修改双引号里的字符！源码地址：https://github.com/sysucats/upload_laf_db"
        ],
    };
    console.log(conf.comment.slice(0, -1).join("\n"));

    // 获取输入
    conf.url = await waitLine("Laf addRecords 函数地址:");
    
    conf.collections = (await waitLine("Laf数据表名，用英文逗号分隔 collections, split by comma ',':")).split(',');
    
    conf.parallelNum = await waitLine(`并发数，parallel uploading number [回车默认 default "${DefaultUpParrallelNum}"]:`);
    conf.parallelNum = conf.parallelNum ? parseInt(conf.parallelNum) : DefaultUpParrallelNum;

    conf.step = await waitLine(`单次上传条数，single upload count [回车默认 default "${DefaultUpStep}"]:`);
    conf.step = conf.step ? parseInt(conf.step) : DefaultUpStep;

    await fs.promises.writeFile(ConfPath, JSON.stringify(conf, null, 4));
}

var conf = null;
async function readConfig() {
    var dirExists = await checkFileExists(ConfPath);
    if (!dirExists) {
        await inputConf();
    }
    conf = JSON.parse(fs.readFileSync(ConfPath, 'utf-8'));
    return true;
}

async function uploadLines(lines, coll, threadID) {
    const steps = lines.length / conf.step + 1;
    var count = 0;
    var retry_times = 5;
    for (let i = 0; i < steps; i++) {
        const batch = lines.slice(i * conf.step, (i + 1) * conf.step);
        if (!batch.length) {
            continue;
        }

        count += batch.length;

        var batchStr = JSON.stringify(batch);
        batchStr = Buffer.from(batchStr, "utf-8").toString('base64');

        var pack = {
            collection: coll,
            data: batchStr
        }
        while (retry_times) {
            try {
                await axios.post(conf.url, pack);
                break;
            } catch {
                console.log(`[thread-${threadID}][coll-${coll}] ${count}/${lines.length} retry...`)
                retry_times --;
            }
        }
        console.log(`[thread-${threadID}][coll-${coll}] ${count}/${lines.length} done.`)
    }
}

async function uploadColl(coll) {
    // 读取多行json文件
    console.log(`Uploading collection: ${coll}`);
    const collFilePath = `./data/${coll}.json`;
    if (!await checkFileExists(collFilePath)) {
        console.log(`[ERROR] Data file not exist! file path: "${collFilePath}"`);
        return false;
    }
    const lines = fs.readFileSync(collFilePath, 'utf-8').trim().split("\n");

    var poolLines = [];
    for (let i = 0; i < lines.length; i++) {
        const pi = i % conf.parallelNum;
        if (poolLines.length < conf.parallelNum) {
            poolLines.push([]);
        }
        try {
            poolLines[pi].push(JSON.parse(lines[i]));
        } catch (e) {
            console.error(`[ERROR] line ${i}: "${lines[i]}"`);
            throw e;
        }
    }

    // 并发上传
    var pool = [];
    for (let i = 0; i < poolLines.length; i++) {
        pool.push(uploadLines(poolLines[i], coll, i));
    }
    await Promise.all(pool);
}

async function main() {
    const readSuccess = await readConfig();
    if (!readSuccess) {
        await waitLine(`\n======== [ERROR] read config error! Press "Enter" to exit. ========`);
        exit();
    }

    // 处理多个collection
    for (var coll of conf.collections) {
        coll = coll.trim();
        await uploadColl(coll);
    }

    await waitLine(`\n======== Press "Enter" to exit. ========`);
    exit();
}


try {
    main();
} catch (error) {
    console.log(error);
    waitLine(`\n======== Press "Enter" to exit. ========`);
}
