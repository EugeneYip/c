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

## V2.3：銀行權益更新檢查與三卡福利總覽（2026-11-21）

本版區分三個概念：
1. **軟體版本**：右上角顯示 V2.3，不再把檢查軟體版本當成「銀行權益已更新」。
2. **人工核對權益資料**：data/benefits.json 記載 2026-11-21 人工核對的 28 項主要回饋、福利、年費、有效期限及官方來源，其中部分不納入計算（需要登錄／特定卡別／資格不明）。
3. **銀行公告自動比對**：GitHub Actions 的 check-benefits.yml 每日以臺北時間約上午 09:17 抓取六個官方公開頁面；比對可見文字內容 fingerprint。若不同，只標示「疑似內容異動／待人工確認」，不會未經審核就調整回饋率。

使用者按首頁「檢查權益」進入「權益」頁籤，檢查 GitHub 公開監測紀錄的最近時間、來源、疑似文字變化及擷取錯誤，另可在三張卡間切換權益列表。倘銀行網站反爬蟲、GitHub Actions 未執行、資料超過 48 小時或網路離線，工具會如實顯示「無法確認」；絕不把尚未擷取的資料稱為最新。每日監測不代表任何用戶持有的卡片、回饋名額及請款已確認。

**監測資料**：data/check-status.json（最後檢查狀態），data/check-baselines.json（首次取得的官方頁面標準化文字基準）。一般使用者只需要公開讀取；不用也不應提供 GitHub Token、銀行登入資訊、卡號。由於 Pages 可能不即時重新發布 bot commit，前端優先讀取 GitHub raw 版本，必要時退回同站備援紀錄並警示。

**只列主要活動，不保證完整商家覆蓋**：已整理的內容有台新 Richart 7+1、Chill刷、保費、eSIM、接送、點數效期與兌換；中信 LINE Pay 一般與海外加碼、LINE POINTS 180 天效期、Visa/JCB 指定商家登錄優惠；中信華航商務御璽 NT$30/哩、指定 2 倍、生日 3 倍、20,000 哩加碼上限、年費、機場接送、機票折扣、Agoda、保險和新戶哩程。指定商家優惠常有最高回饋、每季額度及人數限制，因此只有明確符合回饋模型者才會納入自動試算。

注意：Richart 每期帳單加碼金額上限＝永久信用額度加計 NT$300,000；目前的設定只支援「加碼額度已用完」的保守切換，尚不能精算部分剩餘。中信華航每月加碼哩程 20,000 哩上限與當月既有哩程、以及獨立商家限額亦未由工具自動取得。請配合官方帳單核對。

開發驗收：
- node --test tests/rules.test.cjs tests/engine.test.cjs tests/benefits.test.cjs
- python scripts/check_benefits.py --self-test
- node tests/browser.test.cjs（CI 使用 Chromium + WebKit，新增權益頁與監測狀態模擬）
- 每日來源監測工作流程的失敗或改版資訊見 GitHub Actions > Bank rights monitoring。


## V2.4：通路速查、權益優先與監測更新說明（2026-11-21）

- 店家速查新增八個常見通路：高鐵、臺北捷運、家樂福、全聯福利中心、大全聯、臺鐵、momo 與 7-ELEVEN，不影響現有常用店家收藏。新增臺灣高鐵／T-EX／THSR、台北捷運／MRT、家樂福／萬家福／樂家康、全聯／PX Mart 等名稱辨識。
- 台新 Richart 指定高鐵及臺鐵官方購票通路，符合 LEVEL 2 等條件可在天天刷方案享最高 3.3%；使用悠遊卡及非指定通路不得自動套用最高回饋。T-EX 購票、實體卡與官方規定逐項查核。
- 臺北捷運信用卡感應乘車與中信 LINE Pay 聯名卡之一卡通交通優惠分開。中信 LINE Pay 一卡通合格大眾交通每月累計滿 NT$100 回饋 1 點，高鐵除外；按月估算而非逐筆四捨五入，不計入即時信用卡排行榜。
- 全聯、大全聯一般信用卡回饋保守歸零，手動選類別也不能繞過排除。2026/10/30–12/3 台新指定全聯週末滿額活動僅作參考，需符合指定付款方式、店家、金額與限量名額，不能算作一般保證回饋。
- 家樂福及更名通路萬家福、樂家康，須依簽單名稱判定是否適用 Richart 天天刷。
- 權益頁先顯示整理的 28 項主要權益與福利，官方監測紀錄移至下方，來源細節收合以免佔用主要閱讀空間。
- 原「重新檢查」改為「重新讀取監測結果」：每次點擊會不使用快取地讀取 GitHub 公開監測檔案，分別顯示此次讀取與上次銀行實際掃描的時間。此功能**不會立刻重新掃描銀行網站**。儲存庫管理者可由 GitHub Actions 的 Bank rights monitoring 手動執行工作流程；一般使用者可查看結果而不能匿名觸發有寫入權限的排程。
- 新增 Node 通路測試與 Chromium／WebKit 端對端操作測試，涵蓋店家捷徑、捷運按月點數、全聯排除、權益資料在先、監測狀態變動。

官方參考：
[台新 Richart 詳細規定](https://www.taishinbank.com.tw/TSB/personal/credit/intro/overview/cg047/card001/)、
[台新高鐵臺鐵](https://mkpcard.taishinbank.com.tw/tscccms/promotion/detail/WM_20251230190143055)、
[臺北捷運多元支付](https://www.gov.taipei/News_Content.aspx?n=F0DDAF49B89E9413&s=49BF940AA1B9B9EE)、
[中信 LINE Pay 一卡通](https://www.ctbcbank.com/content/dam/minisite/long/creditcard/LINEPay/index.html)、
[台新全聯週年慶](https://mkpcard.taishinbank.com.tw/tscccms/promotion/detail/WM_20260907090737422)。

## V2.7 品質修正（2026-11-23）
修正深淺色全部頁面明確文字配色、快速通路測試過時的 8 項假設、歷史交易無聲截斷、空白店名加入、日期設定同步、票證不任意改刷卡、保費共享加碼額度及官方監測缺失來源的提示。保留既有資料。此次仍不宣稱完整銀行權益覆蓋；以實際公告與個人資格為準。
