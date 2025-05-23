# プロダクト要件定義（PRD）

## 🎯 目的
ユーザーが「居住用区分所有財産」の相続税評価額を正確に計算できるWebアプリケーションを提供する。

## 🧑‍💻 対象ユーザー
- 税理士や不動産評価士
- 相続税申告を行う一般ユーザー

## 🛠️ 技術スタック
- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Shadcn UI / Radix UI
- Zod（バリデーション）
- Cursor AI（コード生成・補助）

## 🧮 入力項目と計算ロジック
### 📝 入力項目
- 相続開始日（例：2025年12月1日）
- 新築年月日（例：2012年2月16日）
- 種類：居宅（固定値）
- 総階数（例：10階）
- 所在階（例：7階）
- 専有部分の面積（例：63.26㎡）
- 敷地の面積（例：1306.00㎡）
- 敷地権の割合：分子（例：6608）、分母（例：369648）
- 従来の区分所有権の価格（建物）（例：6,148,686円）
- 前面路線価（例：68,000円）
- 路線価調整率（固定値：1.0）
- 借地権割合（例：50%）
- 借家権割合（固定値：30%）
- 賃貸割合（例：100%）

### 🧠 計算ロジック
- 築年数：築年数 = 相続開始年 - 新築年 + 1
- 敷地利用権の面積：敷地の面積 × (分子 / 分母)
- 従来の敷地利用権の価格（土地）：前面路線価 × 敷地利用権の面積 × 路線価調整率
- 評価乖離率の計算：
  - A = 築年数 × (-0.033)
  - B = min(総階数 / 33, 1) × 0.239
  - C = 所在階 × 0.018（地階の場合は0）
  - D = (敷地利用権の面積 / 専有部分の面積) × (-1.195)
  - 評価乖離率 = A + B + C + D + 3.220
- 評価水準：1 / 評価乖離率
- 区分所有補正率：
  - 評価水準 < 0.6：評価乖離率 × 0.6
  - 0.6 ≤ 評価水準 ≤ 1：1
  - 評価水準 > 1：評価乖離率 × 0.6
- 区分所有権の価格（建物）：従来の区分所有権の価格 × 区分所有補正率
- 借家建物の価格（賃貸している場合）：区分所有権の価格 × (1 - 借家権割合)
- 敷地利用権の価額（土地）：従来の敷地利用権の価格 × 区分所有補正率
- 貸家建付地価額（賃貸している場合）：
  - 貸家建付地価額 = 自用地価額 - (自用地価額 × 借地権割合 × 借家権割合 × 賃貸割合)

## 🖌️ UI/UX設計方針（2024年トレンド準拠）
- 入力フォームは白背景＋シャドウで浮かせ、フォーム全体は淡いブルーグレーで囲む
- 入力欄は大きめ、ラベルは明確にし、余白・パディングを十分に取る
- 出力エリアはカード型で「ここに結果が表示されます」と明示し、未入力時もプレースホルダーを表示
- レスポンシブ対応（スマホ・PC両対応）
- 色コントラスト・フォーカス時の強調などアクセシビリティ配慮
- モダンなWebアプリの標準に合わせた配色・フォント・余白設計
- 主要導線・ボタンは目立つ色で統一

## 🗂️ ディレクトリ構成とAIエージェント設計

src/
├── app/
│   └── page.tsx
├── components/
│   ├── input-form.tsx
│   ├── result-display.tsx
│   └── layout.tsx
├── agents/
│   ├── calculation-agent.ts
│   ├── validation-agent.ts
│   └── root-agent.ts
├── utils/
│   ├── calculations.ts
│   └── validations.ts
├── types/
│   └── index.ts
├── styles/
│   └── globals.css
├── .cursor/
│   └── rules/
│       └── nextjs-react-typescript-tailwind.mdc
├── public/
│   └── assets/
└── README.md

## 🤖 AIエージェントの役割
- root-agent.ts：全体のフロー管理と他エージェントの呼び出し
- calculation-agent.ts：入力データに基づく評価額の計算
- validation-agent.ts：入力データのバリデーション

## 🧑‍💻 Cursorでの開発ステップ
1. プロジェクトの初期化
2. コンポーネントの作成
3. 計算ロジックの実装
4. エージェントの実装
5. スタイルの適用
6. ルールの設定
7. 開発とデバッグ 