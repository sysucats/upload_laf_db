const fs = require("node:fs");
const path = require("path");
const {checkFileExists, waitLine, runCmd} = require("./utils");
const { exit } = require("node:process");
const { json } = require("stream/consumers");


// 输入conf
const ConfPath = './config.json';
const DefaultLafServer = "https://console.lafyun.com";
const DefaultUpParrallelNum = 10;
const DefaultUpStep = 10;
async function inputConf() {
    conf = {
        "comment": [
            "// 注释：",
            "// 用laf console上获取信息，注意信息安全",
            "// 注意只修改双引号里的字符！源码地址："
        ],
    };
    console.log(conf.comment.slice(0, -1).join("\n"));

    // 获取输入
    conf.username = await waitLine("Laf用户名 username:");
    conf.password = await waitLine("Laf密码 password:");
    conf.appid = await waitLine("Laf APPID appid:");
    conf.server = await waitLine(`Laf服务器地址，server [回车默认 default "${DefaultLafServer}"]:`);
    conf.server = conf.server || DefaultLafServer;
    
    conf.collections = (await waitLine("Laf数据表名 collections [用英文逗号分隔 split by comma ',']:")).split(',');
    
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

async function initLaf() {
    login_cmd = `laf login -u ${conf.username} -p ${conf.password} -r ${conf.server}`
    list_cmd = "laf list"
    init_cmd = `laf init -s ${conf.appid}`
    await runCmd(login_cmd);
    await runCmd(list_cmd);
    await runCmd(login_cmd);
}


async function uploadLines(lines, coll, threadID) {
    const steps = lines.length / conf.step + 1;
    var count = 0;
    for (let i = 0; i < steps; i++) {
        const batch = lines.slice(i * conf.step, (i + 1) * conf.step);
        if (!batch.length) {
            continue;
        }

        count += batch.length;

        const pack = JSON.stringify({
            collection: coll,
            data: batch
        }).replaceAll("\"", "\\\"")
        const cmd = `laf fn invoke addRecords "${pack}"`;
        await runCmd(cmd, true);
        console.log(`[thread-${threadID}][coll-${coll}] ${count}/${lines.length} done.`)
    }
}

async function uploadColl(coll) {
    // 读取多行json文件
    console.log(`Uploading collection: ${coll}`);
    const lines = fs.readFileSync(`./data/${coll}.json`, 'utf-8').split("\n");

    var pool_lines = [];
    for (let i = 0; i < lines.length; i++) {
        const pi = i % conf.parallelNum;
        if (pool_lines.length < conf.parallelNum) {
            pool_lines.push([]);
        }
        pool_lines[pi].push(JSON.parse(lines[i]));
    }

    // 并发上传
    var pool = [];
    for (let i = 0; i < pool_lines.length; i++) {
        pool.push(uploadLines(pool_lines[i], coll, i));
    }
    await Promise.all(pool);
}

async function main() {
    const readSuccess = await readConfig();
    if (!readSuccess) {
        await waitLine(`\n======== [ERROR] read config error! Press "Enter" to exit. ========`);
        exit();
    }

    // 初始化laf环境
    await initLaf();

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
    exit();
}