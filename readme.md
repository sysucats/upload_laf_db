# 依赖 Dependence
* nodejs 16.x+
* 云函数 (laf cloud function)：`addRecords.ts`

# 使用方式 Usage
## 使用流程 Procedure
在laf上创建云函数`addRecords`，代码在`addRecords.ts`。

把导出json文件放置到`./data/`文件中，命名为`<collection_name>.json`。

使用可执行文件或源码启动脚本。

1. 输入laf用户名
2. 输入laf密码
3. 输入appid
4. 【可选】输入server地址
5. 输入collections名称，用英文逗号分隔
6. 【可选】输入并发度，建议10~20
7. 【可选】输入单次上传条数，建议为1

> Create cloud function `addRecords` on laf console with the code in `addRecords.ts`.
> Place exported json files into `./data/`, and rename them as `<collection_name>.json`.
>
> Run this script with executable or source code.
> 1. input laf username
> 2. input laf password
> 3. input laf appid
> 4. [optional] input laf server address
> 5. input collection names, split with comma
> 6. [optional] input parallel number, 10~20 is recommended
> 7. [optional] input upload lines per time, 1 is recommended
## 可执行文件 Executable
从Releases页面下载运行，https://github.com/sysucats/upload_laf_db/releases

>download executable from releases page

## 源码运行 Source
安装nodejs 16.x后，启动：

>with nodejs 16.x installed, run the command:

```
npm install
node main.js
```

# 开发 Dev
## 打包 Pack
```
npm run pkgd
```

## 已知问题 Known Problems
* 过长的数据会超出命令行长度限制，导致运行失败
* > because of the length limit of command line, it will fail and skip on too long data string