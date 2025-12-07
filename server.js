require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// CWA API 設定
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";
const CWA_API_KEY = process.env.CWA_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 取得臺北市天氣預報
 * CWA 氣象資料開放平臺 API
 * 使用「一般天氣預報-今明 36 小時天氣預報」資料集
 */
const getTaipeiWeather = async (req, res) => {
  try {
    // 檢查是否有設定 API Key
    if (!CWA_API_KEY) {
      console.error("錯誤：未設定 CWA_API_KEY");
      return res.status(500).json({
        error: "伺服器設定錯誤",
        message: "請在環境變數中設定 CWA_API_KEY",
      });
    }

    // 呼叫 CWA API - 一般天氣預報（36小時）
    // API 文件: https://opendata.cwa.gov.tw/dist/opendata-swagger.html
    const response = await axios.get(
      `${CWA_API_BASE_URL}/v1/rest/datastore/F-C0032-001`,
      {
        params: {
          Authorization: CWA_API_KEY,
          locationName: "臺北市", // 確保這裡請求的是臺北市
          sort: "time"
        },
      }
    );

    // 檢查 API 回傳結構
    if (!response.data || !response.data.records || !response.data.records.location) {
        throw new Error("CWA API 回傳格式不符預期");
    }

    // 取得臺北市的天氣資料
    const locationData = response.data.records.location[0];

    if (!locationData) {
      return res.status(404).json({
        error: "查無資料",
        message: "無法取得臺北市天氣資料",
      });
    }

    // 整理天氣資料
    const weatherData = {
      city: locationData.locationName,
      updateTime: response.data.records.datasetDescription,
      forecasts: [],
    };

    // 解析天氣要素
    const weatherElements = locationData.weatherElement;
    // 確保有資料才跑迴圈
    if(weatherElements && weatherElements.length > 0) {
        const timeCount = weatherElements[0].time.length;

        for (let i = 0; i < timeCount; i++) {
        const forecast = {
            startTime: weatherElements[0].time[i].startTime,
            endTime: weatherElements[0].time[i].endTime,
            weather: "",   // Wx
            rain: "",      // PoP
            minTemp: "",   // MinT
            maxTemp: "",   // MaxT
            comfort: "",   // CI
        };

        weatherElements.forEach((element) => {
            // 避免有些時段資料缺失導致錯誤
            const timeSlot = element.time[i];
            if(!timeSlot) return;

            const value = timeSlot.parameter;
            switch (element.elementName) {
            case "Wx":
                forecast.weather = value.parameterName;
                break;
            case "PoP":
                forecast.rain = value.parameterName + "%";
                break;
            case "MinT":
                forecast.minTemp = value.parameterName; // 前端會自己加 °C，後端傳純數字或字串皆可，這裡保留原樣
                break;
            case "MaxT":
                forecast.maxTemp = value.parameterName;
                break;
            case "CI":
                forecast.comfort = value.parameterName;
                break;
            }
        });

        weatherData.forecasts.push(forecast);
        }
    }

    res.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("取得天氣資料失敗:", error.message);

    if (error.response) {
      // API 回應錯誤
      return res.status(error.response.status).json({
        error: "CWA API 錯誤",
        message: error.response.data.message || "無法取得天氣資料",
        details: error.response.data,
      });
    }

    // 其他錯誤
    res.status(500).json({
      error: "伺服器錯誤",
      message: "無法取得天氣資料，請稍後再試",
    });
  }
};

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "歡迎使用安安天天氣象 API",
    endpoints: {
      taipei: "/api/weather/taipei", // 更新文件說明
      health: "/api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 修正：路由改為 /api/weather/taipei
app.get("/api/weather/taipei", getTaipeiWeather);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "伺服器錯誤",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "找不到此路徑",
    message: `路徑 ${req.path} 不存在`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 伺服器已啟動，監聽 Port: ${PORT}`);
  console.log(`📍 目標城市: 臺北市`);
  console.log(`🔑 API Key 設定狀態: ${CWA_API_KEY ? "已設定" : "未設定 (將無法請求資料)"}`);
});