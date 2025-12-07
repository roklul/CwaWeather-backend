安安天天氣象 API 服務 (An An Weather API)這是一個使用 Node.js + Express 開發的天氣預報 API 服務，專為「安安天天氣象」前端應用設計。本服務串接中央氣象署（CWA）開放資料平台，提供臺北市未來 36 小時的天氣預報資料。功能特色✅ 串接 CWA 氣象資料開放平台✅ 取得臺北市 36 小時天氣預報✅ 環境變數管理✅ RESTful API 設計✅ CORS 支援安裝步驟1. 安裝相依套件npm install
2. 設定環境變數在專案根目錄建立 .env 檔案：touch .env
編輯 .env 檔案，填入你的 CWA API Key：CWA_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
3. 取得 CWA API Key前往 氣象資料開放平臺註冊/登入帳號前往「會員專區」→「取得授權碼」複製 API 授權碼將授權碼填入 .env 檔案的 CWA_API_KEY啟動服務開發模式（自動重啟）npm run dev
正式模式npm start
伺服器會在 http://localhost:3000 啟動API 端點1. 首頁GET /
回應：{
  "message": "歡迎使用安安天天氣象 API",
  "endpoints": {
    "taipei": "/api/weather/taipei",
    "health": "/api/health"
  }
}
2. 健康檢查GET /api/health
回應：{
  "status": "OK",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
3. 取得臺北天氣預報GET /api/weather/taipei
回應範例：{
  "success": true,
  "data": {
    "city": "臺北市",
    "updateTime": "2025-09-30 18:00:00",
    "forecasts": [
      {
        "startTime": "2025-09-30 18:00:00",
        "endTime": "2025-10-01 06:00:00",
        "weather": "多雲時晴",
        "rain": "10%",
        "minTemp": "25",
        "maxTemp": "32",
        "comfort": "悶熱",
        "windSpeed": "" // 若無資料則為空字串
      }
    ]
  }
}
專案結構AnAnWeather-backend/
├── server.js              # Express 伺服器主檔案（包含路由與控制器邏輯）
├── .env                   # 環境變數（不納入版控）
├── .gitignore            # Git 忽略檔案
├── package.json          # 專案設定與相依套件
├── package-lock.json     # 套件版本鎖定檔案
└── README.md            # 說明文件
使用的套件express: Web 框架axios: HTTP 客戶端dotenv: 環境變數管理cors: 跨域資源共享nodemon: 開發時自動重啟（開發環境）注意事項請確保已申請 CWA API Key 並正確設定在 .env 檔案中API Key 有每日呼叫次數限制，請參考 CWA 平台說明不要將 .env 檔案上傳到 Git 版本控制（已包含在 .gitignore 中）所有路由與業務邏輯都在 server.js 檔案中，適合小型專案使用錯誤處理API 會回傳適當的 HTTP 狀態碼和錯誤訊息：200: 成功404: 找不到資料500: 伺服器錯誤錯誤回應格式：{
  "error": "錯誤類型",
  "message": "錯誤訊息"
}
授權MIT