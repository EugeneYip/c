# 刷哪張？｜狐狸的回饋筆記

專為手機與平板設計的台灣信用卡回饋比較器。台新 Richart 為主要卡，另外提供中信 LINE Pay 及中信華航商務御璽卡比較。

網站：https://eugeneyip.github.io/c/

## 主要功能

- 每日記錄消費，依台灣時間 23:59 的 Richart 最終方案，最佳化整日交易。
- 「只看 Richart」與「三卡混用」分別顯示，避免混淆兩種結果。
- 店家速查、常用店家、每筆金額與付款方式編輯、依日期保存歷史。
- 台新 Pay／TWQR、LINE Pay、Apple Pay 等支付方式，部分具名 Chill刷商家、假日刷及每日八方案比較。
- 國內外中信 LINE Pay 一般回饋、海外額外登錄加碼、商務御璽卡哩程及生日月估值。
- 中信海外加碼有 450 點餘額限制，採整日動態規劃最佳化，不單純依輸入順序選卡。
- iPhone、平板雙欄支援；狐狸橘配色，沒有帳號或第三方追蹤。

## 支援版本

| 卡片 | 主要試算 | 核對範圍 |
| --- | --- | --- |
| 台新 Richart | 基本、指定店家、7+1 方案、TWQR、假日與部分 Chill刷 | 2026/7/1–2027/12/31，Chill 至 2026/12/31 |
| 中信 LINE Pay | 一般 1%、海外實體 2.8%、已登錄海外加碼 2.2% | 2026/7/1–2026/12/31 |
| 中信華航商務御璽 | 一般 NT$30／哩、自行確認指定 2 倍、生日月海外實體 3 倍 | 已核對 2026 年條款 |

台新 Point 依逐筆小數點後無條件捨去計算；LINE POINTS 依逐筆四捨五入；華航哩程是依消費金額換算的估值。所有預估仍受發卡行實際交易認列影響。

## 使用

1. 在「我的設定」選擇 Richart LEVEL 1 或已生效的 LEVEL 2，以及中信卡的實際適用條件。
2. 在「今日建議」加入消費，查看 Richart 每日切換與跨卡最佳化。
3. 在「店家速查」搜尋商家，亦可儲存常用名稱。
4. 必須由持卡人在 Richart Life App 手動完成切換，本站不能代辦。

## 隱私

僅以 localStorage 儲存本機的消費、收藏與偏好。無帳號、後端、分析或追蹤程式。不同裝置不會自動同步，也不要輸入卡號、密碼、驗證碼等敏感資訊。

## 部署

GitHub Pages 的設定為 Settings → Pages → Deploy from a branch → main → /(root)。網站為純靜態 HTML、CSS、JavaScript，不需要建置流程。

## 測試

- Node.js 22：執行 node --test tests/rules.test.cjs。
- 語法：node --check app.js、node --check rules.js。
- GitHub Actions 的品質工作流程包含 Chromium 手機 390×844、平板 820×1180 的基本操作與畫面截圖測試。

## 資料來源與重要限制

- [台新 Richart 官方權益](https://mkp.taishinbank.com.tw/s/2025/RichartCard_2025/index.html)
- [中國信託 LINE Pay 回饋計畫](https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/notice.html)
- [中國信託 LINE Pay 海外加碼](https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/page_travel.html)
- [中國信託華航商務御璽卡](https://www.ctbcbank.com/content/dam/minisite/long/creditcard/CTBCCI/feature.html)

目前商家目錄為依台新官方名單人工整理的快速辨識資料，不是完整商店與分店資料庫。銀行最終仍以實際請款名稱、收單行業類別 MCC、付款方式、活動名額、上限及使用者資格判定。未載入全部聯卡中心小額支付排除分店名單，也未自動計算所有期間限定優惠、新戶券、LINE Pay 領券、跨帳單回饋限額與哩程機票稅費。使用者自訂的點數及哩程價值不代表可向銀行換取現金。2027 年中信兩卡未核對的活動不列入跨卡比較。

研究時參考 [Xuancissus/richart-point-switcher](https://github.com/Xuancissus/richart-point-switcher) 的使用流程理念。本專案程式碼與狐狸視覺獨立編寫，並未轉載其程式碼或 nccc.json。

規則最後人工核對：2026-11-20。獨立非官方服務。
