import json
import os

username = "123"
password = "456"
server = "https://console.lafyun.com"
appid = "789"

def initial(username, password, server, appid):
    # 登录
    login = 'laf login -u ' + username + ' -p ' + password + ' -r ' + server
    system(login)
    system("laf list")
    # 初始化
    init = "laf init -s " + appid
    system(init)

def system(str):
    print(str[:100])
    os.system(str)

if __name__ == "__main__":

    # 初始化
    initial(username, password, server, appid)

    collections = ["cat", "comment", "feedback", "inter", "news", "photo_rank", "photo", "reward", "science", "setting", "user"]

    for collection_name in collections:
        json_path = "./data/" + collection_name + ".json"

        # 上传数据库
        if not os.path.exists(json_path):
            print(json_path, "is not existed")
        else:
            with open(json_path, 'r', encoding='utf-8') as f:
                records = []
                i = 0

                # 批量上传，每次十条
                batch = 1
                for line in f.readlines():
                    i += 1
                    record = json.loads(line.strip())
                    records.append(record)
                    if i % batch == 0:
                        print("上传", i)
                        param = json.dumps({
                            "collection": collection_name,
                            "data": records
                        }).replace('\"', '\\\"')
                        addRecord = "laf fn invoke addRecords " + '"' + param + '"'
                        system(addRecord)
                        records = []

                if len(records) > 0:
                    print("Last")
                    param = json.dumps({
                        "collection": collection_name,
                        "data": records
                    }).replace('\"', '\\\"')
                    addRecord = "laf fn invoke addRecords " + '"' + param + '"'
                    system(addRecord)

