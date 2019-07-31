# 定製項目構建流程
定製項目構建流程Demo，示範如何依不同的Scene限制打包resources下對應的Scene資源。


需求: 客製要保留部份建置後的資料。這裡用的是依預設的scene，保留resources裡對應的資料夾。
提醒: 因Cocos Creator打包時，放在resource下的所有資料都會一併被打包，所以若沒有特殊需求盡量不要放在此。

做法: 利用 "定製項目構建流程" 來處理建置後的檔案。

建置後資料是散的。
定製項目構建流程是在建置時才會執行，在運行預覽時不會執行。

初步想到的三個方式: 
1. Temp -> Resources，設定在建置的時候COPY。
    Result: COPY完就會固定在Resources了，但這是建置時的流程，所以在運行預覽時遊戲會無法正常顯示。(除非有辦法預覽時也能搬檔)
2. 一開始就放Resources-> Build之前先搬開額外的，建置完再搬回來。
    Result: OK
3. 一開始就放Resources-> Build之後砍掉不需要的建置資料。
    Result: OK，缺點: 很多檔案的時候會跑很慢

實作Steps.
	1. 
用VsCode打開後，在packages下新增folder: custom-process (你的擴充包)
	2. 
在自建的folder下新增main.js, package.json 格式請參考。
	3. 
安裝fs extra來做搬檔Copy檔的操作:  npm install --save fs-extra 
	4. 
在main.js 細寫你的構建流程，目前Builder可監聽的事件根據官方文件有以下幾種：

		* 
'build-start'：構建開始時觸發。
		* 
'before-change-files'：在構建結束 之前 觸發，此時除了計算文件 MD5、生成 settings.js、原生平台的加密腳本以外，大部分構建操作都已執行完畢。我們通常會在這個事件中對已經構建好的文件做進一步處理。
		* 
'build-finished'：構建完全結束時觸發。
	5. 
在main.js中的 build-start, build-change-files時做搬檔複製檔、刪檔的動作就能完成需求。

