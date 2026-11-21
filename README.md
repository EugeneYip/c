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

## V2.1 全面驗收與更新機制

V2.1 針對手機使用者回報的問題加入以下改善：

- 修正「加入消費」視窗沒有反應及編輯金額時發生的焦點競態，手機表單採底部抽屜顯示；提高觸控與表單可操作性。
- 縮短手機首頁頁首、重新排版中文主標題、日期選單與底部分頁圖示，避免單字及語句不自然斷行。
- 採用獨立版本號網址重新載入 CSS 與 JavaScript，減少手機瀏覽器保留舊版程式的風險。
- 首頁「檢查更新」透過本站的 version.json 檢查網站版本；**這是軟體版本查詢，不是即時銀行權益爬取，也不表示銀行條款自動更新**。
- 修正僅適用 Chill刷的商家被錯歸入一般數趣刷／大筆刷／好饗刷；增加歐洲指定實體交易不回饋的排除條件。
- 針對台新 LINE Pay 額外領券優惠、支付工具跨卡適用性，以及尚未覆蓋的額度與通路限制顯示提醒；未核實的優惠不自動納入。
- Node 規則測試擴充至 28 組；GitHub Actions 加入 Chromium 及 WebKit（Safari 引擎），驗證 320px、390px、820px 寬度的新增／編輯／保存、設定、商家查詢、版本檢查與水平溢出。
- 本站只以 GitHub Pages 靜態發佈，交易紀錄使用瀏覽器 localStorage，不上傳信用卡個人資料。

所有估算仍需符合發卡行對商家 MCC、實際請款、會員資格、活動名額、額度及銀行當期條款之認列。


## V2.2：手機與平板精簡改版

2026-11-21：依實際 iPhone 截圖、日美信用卡比較服務及 Apple 介面指引進行產品稽核，重點改為「在購物現場快速得到可執行的答案」。

- 頁首改為全寬、短標題的緊湊排版，節省手機首屏空間；仍保留狐狸橘品牌與版本檢查。
- 「三卡混用」正式改稱「逐筆選最佳卡」，指每筆交易在三張卡中擇一，不代表拆單或一筆用多卡。
- 優先顯示只使用 Richart 的當日切換方案與預估台新Point；額外顯示逐筆選卡的估算價值，兩者不混為同一單位。
- 八方案比較先顯示前四項，另外四項按需要展開；逐筆比較將詳細條款收合。
- 新增消費以店家、金額和付款方式為核心，消費分類、地區及加倍哩程等進階欄位預設收合。
- Apple Pay 單獨顯示，使用者不使用的 Google Pay 已從介面移除。
- 新增獨立付款路徑檢核：台新Pay/TWQR 不視為中信卡付款工具。改用中信卡直接刷卡時，結果附帶「需確認店家接受改用信用卡」的提示。
- 新增測試檔 tests/engine.test.cjs，與 tests/rules.test.cjs 共計 40 組 Node 規則測試。
- 原有交易仍依瀏覽器 localStorage 保存，保留 v2.1 使用者資料。

### 重要的資料判斷限制

「逐筆選最佳卡」是比較**假設可在結帳前換卡或改付款方式**的替代方案，而不是實際完成支付。若店家不能接受建議的支付工具或未達銀行指定活動門檻，需改用其他方案。Richart 切換仍須本人於 Richart Life App 操作，同一日以當日最終方案為準。中信 LINE Pay 綁定資格、海外加碼登錄與額度仍需自行確認。完整店家分店、收單 MCC、全期加碼上限、特殊聯名活動不能僅憑店名保證。

首頁「檢查更新」只檢查程式版本 version.json，**不等於官方銀行優惠已即時重新抓取**。一般消費、哩程與 LINE POINTS 的估值不可視為確定可兌換現金。

### 研究參考

- [日本：ポイントルート](https://apps.apple.com/jp/app/id6761101024)：以商家、支付路徑、適用條件為核心。
- [日本：いちペイ](https://apps.apple.com/jp/app/id6814039478)：結帳當下提示使用哪張卡及怎麼付。
- [美國：CardPointers](https://cardpointers.com/)：快速辨識最佳信用卡、以商家為中心。
- [美國：MaxRewards](https://maxrewards.com/)：個人點數估值、優惠與額度。
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/design-principles)：資訊階層、進階展開、操作清晰度。

上述服務只作功能與資訊架構研究，本專案沒有複製其受著作權保護的原始碼或介面資產。
