# Break Only Three

React・PixiJS・Reduxで動くブラウザゲームです。Viteで静的ファイルを生成し、
サーバー処理・API・データベースなしで配信できます。

## 開発

Node.js 22.12以降を使用します。

```sh
npm ci
npm run dev
```

React 18に対応する`@pixi/react 7`を使用し、PixiJS 6とゲームロジックを維持しています。
既存依存関係のインストール設定は`.npmrc`にまとめています。

## 検証・ビルド

```sh
npm run type-check
npm run build
npm run preview
```

`build`は型チェック後に`dist/`へHTML・JavaScript・CSS・画像と
PWA用Service Workerを生成します。`preview`はローカル確認用です。
本番でNode.jsプロセスを起動する必要はありません。

## デプロイ

Vercelは`vercel.json`によりViteとしてビルドし、`dist/`を配信します。
他の静的ホスティングでも`npm ci && npm run build`の後、
`dist/`全体をサイトのルートに配置してください。
SSR・Serverless Functions・Next.js画像最適化APIは使用しません。

## PWA

本番ビルドには画面とゲーム画像を事前キャッシュするService Workerが含まれます。
HTTPS（ローカルではlocalhost）で一度読み込み、キャッシュ完了後はオフラインでも遊べます。
更新でゲームが中断されないよう、新しいService Workerは既存タブを閉じた後に有効になります。

## 構成

- `index.html`: タイトル・メタ情報と静的エントリー
- `src/main.tsx`: ReactとReduxの起動
- `src/App.tsx`: メニュー・結果・シェア
- `src/features/reactpixi/game-stage.tsx`: Pixi描画と入力
- `src/game/`: ゲームロジック（移行前から維持）
- `vite.config.mts`: React・PWA・ブラウザ用依存解決

未使用だったNext.jsのサンプルAPI `/api/counter`は削除しました。
