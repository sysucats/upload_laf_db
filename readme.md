# 依赖 Dependence
* nodejs 16.x+
* 云函数 (laf cloud function)：`addRecords.ts`

# 使用方式 Usage
## 使用流程 Procedure
在laf上创建云函数`addRecords`，代码在`addRecords.ts`。

把导出json文件放置到`./data/`文件中，命名为`<collection_name>.json`。

使用可执行文件或源码启动脚本。

1. 输入laf云上`addRecords`函数的服务地址，形如：`https://appid.laf.run/addRecords`
2. 输入collections名称，用英文逗号分隔
3. 【可选】输入并发度，建议10~20
4. 【可选】输入单次上传条数，建议为1

## 可执行文件 Executable
从Releases页面下载运行，https://github.com/sysucats/upload_laf_db/releases

## 源码运行 Source
安装nodejs 16.x后，启动：

```
npm install
node main.js
```
# 后处理
上传完成后，在Laf后台删除`addRecords`函数

# 开发 Dev
## 打包 Pack
```
npm run pkgd
```
