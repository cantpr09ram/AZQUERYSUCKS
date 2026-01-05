# 改進清單（AZQUERYSUCKS）

> 目標：把目前功能維持不變的前提下，提升正確性、效能、可維護性、可用性與 DX。

## 7) SEO / Metadata / PWA

- OpenGraph URL、manifest name 為 placeholder
  - `src/app/layout.tsx:22`：`https://example.com`
  - `src/app/manifest.ts:5`：`name: ""`
  - 建議：補齊真實網址、title、description，並加上 twitter card（若需要）。

- OG route 內容可提升
  - `src/app/api/og/route.tsx:7`：目前是固定文字。
  - 建議：支援 query（例如 title、tagline）讓分享卡更有用。

## 8) 工具鏈與專案結構

- `next.config.ts` 目前是空設定
  - `next.config.ts:3`
  - 建議：若不需要可移除；若要部署/圖片/headers/caching，集中在此管理。

- README 仍是 create-next-app 預設
  - `README.md:1`
  - 建議：補上專案用途、資料來源（courses.json）、本地啟動、部署方式、主要功能。

## 9) 可選的下一步（加分項）

- 加入基本測試（不一定要全面）
  - 對 `parseTimes()`（`src/utils/parse-times.ts:88`）最適合加 unit tests：各種輸入格式、空值、錯誤格式、連續節次合併。

- 狀態管理與儲存
  - 目前 `selectedCourses` 在刷新後會消失。
  - 建議：以 `localStorage` 保存選課清單（只存 `seq`，再從 courses 表查資料），或提供匯入/匯出 JSON。
