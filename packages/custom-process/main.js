let fse = require('fs-extra');

let tempAssetPath = 'db://assets/Temp/';
let resourcesAssetPath = 'db://assets/resources/';

function onBeforeBuildFinish(options, callback) {

    Editor.log('onBeforeBuildFinish');

    // plan2_2(options);
    plan3(options); //一開始就放Resources-> Build之後砍掉不需要的建置資料。(缺點: 很多檔案的時候會跑很慢)
    callback();
}


//Temp -> Resources，設定在建置的時候COPY，COPY完就會固定在Resources了，但這是建置時的流程，所以在運行預覽時遊戲會無法正常顯示。
function plan1(options) {
    var sceneName = getSceneName(options.startScene);
    var targetPhysicalPath = `${options.project}\\assets\\Temp\\${sceneName}\\`;
    var destPhysiclePath = `${options.project}\\assets\\resources\\${sceneName}\\`;
    var refreshAsset = Editor.assetdb.fspathToUrl(destPhysiclePath);
    Editor.log(`targetPath:${targetPhysicalPath}`);
    Editor.log(`destPath:${destPhysiclePath}`);
    Editor.log(`refreshAsset:${refreshAsset}`);
    // if (Editor.assetdb.exists(targetPath)) {
    fse.copy(targetPhysicalPath, destPhysiclePath, function (err) { //複製
        if (err) return Editor.error(err)
        Editor.log('Success!!!!!!!!!!');
        Editor.assetdb.refresh(refreshAsset, function (err, results) { }); //更新資源管理器列表
        callback();
    });
    // }
}

//一開始就放Resources-> Build之前先搬開額外的，建置完再搬回來。
function plan2_1(options) {
    // fse.move(path, err => {
    //     if (err) return Editor.error(err)
    // })
    var sceneName = getSceneName(options.startScene);
    //只撈第一層的folder就好
    Editor.assetdb.queryAssets(`${resourcesAssetPath}/*`, ['folder'], (err, assetInfos) => {
        Editor.log('搬到Temp');
        // Editor.log(assetInfos);

        assetInfos.forEach(element => { //開始搬檔
            let folderName = getFolderName(element.url);
            if (folderName == sceneName) //
                return;
            Editor.log(folderName);
            Editor.assetdb.move(element.url, `${tempAssetPath}${folderName}`, function (err, results) {
                Editor.log(results);
                Editor.log(err);
                // results.forEach(function (result) {
                //     // result.uuid
                //     // result.parentUuid
                //     // result.url
                //     // result.path
                //     // result.type
                // });
            });
        });
        Editor.assetdb.refresh(resourcesAssetPath, function (err, results) { }); //更新資源管理器列表
    });
}

function plan2_2(options) {
    //只撈第一層的folder就好
    Editor.assetdb.queryAssets(`${tempAssetPath}/*`, ['folder'], (err, assetInfos) => {
        Editor.log('搬回來');
        Editor.log(assetInfos);

        assetInfos.forEach(element => {
            let folderName = getFolderName(element.url);
            // Editor.log(folderName);
            Editor.assetdb.move(element.url, `${resourcesAssetPath}${folderName}`, function (err, results) { //搬檔
                Editor.log(results);
                Editor.log(err);
                // results.forEach(function (result) {
                //     // result.uuid
                //     // result.parentUuid
                //     // result.url
                //     // result.path
                //     // result.type
                // });
            });
        });
        Editor.assetdb.refresh(resourcesAssetPath, function (err, results) { }); //更新資源管理器列表
        Editor.assetdb.refresh(tempAssetPath, function (err, results) { });
    });
}

//一開始就放Resources-> Build之後砍掉不需要的建置後的資料。(缺點: 很多檔案的時候會跑很慢)
function plan3(options) {
    let buildResults = options.buildResults;
    var sceneName = getSceneName(options.startScene);
    var keepItems = [];
    Editor.assetdb.queryAssets(`${resourcesAssetPath}${sceneName}/*`, [], (err, assetInfos) => {
        Editor.log('assetInfos');
        Editor.log(assetInfos);
        for (let i = 0; i < assetInfos.length; ++i) {
            keepItems.push(assetInfos[i].uuid);
            // let tex = assetInfos[i].uuid;
            // if (buildResults.containsAsset(tex)) {
            //     let path = buildResults.getNativeAssetPath(tex);
            //     Editor.log(`Assets of "${assetInfos[i].url}": ${path}`);
            // }
        }
        Editor.log(keepItems);
    });

    Editor.assetdb.queryAssets(`${resourcesAssetPath}/**/*`, [], (err, assetInfos) => { //撈所有的資料並比對刪掉不保留的建置後資料。
        Editor.log('findAssetInfos');
        Editor.log(assetInfos);
        for (let i = 0; i < assetInfos.length; ++i) {
            let tex = assetInfos[i].uuid;
            if (keepItems.indexOf(assetInfos[i].uuid) < 0 && buildResults.containsAsset(tex)) {
                var path = buildResults.getNativeAssetPath(tex); //取得建置後的實體檔案路徑
                Editor.log(path);
                if (path.length > 0) { //刪檔
                    fse.remove(path, err => {
                        if (err) return Editor.error(err)
                    })
                }
            }
        }
    });

}

function getSceneName(uuid) {
    return Editor.assetdb.uuidToUrl(uuid).split("/").pop().replace('.fire', '');
}

function getFolderName(path) {
    return path.split("/").pop();
}

function onBeforeBuildStart(options, callback) {
    let buildResults = options.buildResults;
    Editor.log('onBeforeBuildStart');
    Editor.log(options);
    Editor.log(getSceneName(options.startScene));
    Editor.log('Building ' + options.platform + ' to ' + options.dest);
    // 建置後資料是散的。定製項目構建流程是在建置時才會執行，在運行預覽時不會執行。
    // plan1(options); //Temp -> Resources，設定在建置的時候COPY，COPY完就會固定在Resources了，但這是建置時的流程，所以在運行預覽時遊戲會無法正常顯示。(除非有辦法預覽時也搬檔)
    // plan2_1(options); //plan2_2()也要打開 //一開始就放Resources-> Build之前先搬開額外的，建置完再搬回來。

    //在CocosCreator按shift+ctrl+b建置 or 執行命令行
    //C:\CocosCreator_2.1.1>CocosCreator.exe --path "d:\XXXX\CocosProcessBuildDemo" --build "startScene=2d2f792f-a40c-49bb-a189-ed176a246e49;buildPath=./build;platform=web-mobile;debug=true"
    // http://docs.cocos.com/creator/manual/zh/publish/publish-in-command-line.html
    callback();

}

module.exports = {
    load() {
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
        Editor.Builder.on('build-start', onBeforeBuildStart);
    },

    unload() {
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
        Editor.Builder.removeListener('build-start', onBeforeBuildStart);
    },

    messages: {
        'say-hello'(event, ...args) {
            if (args.length > 0)
                Editor.log(args);
            else
                Editor.log('Hello World!');
        }
    },
};