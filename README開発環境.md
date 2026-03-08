ビルド完了手順
--

前提   
```bash
OS：windows11
エディタ：Cursor、VSCode
```

Node.jsを端末にインストールする
```bash
サイト：https://nodejs.org/ja
バージョン：>=22.16.0
```

gitクローンしたリポジトリ直下で以下を実行   
各プロジェクト一括で依存関係の解決＆ビルド
```bash
npm install
```

各プロジェクトで個別にビルドしたい場合は、各プロジェクト直下で以下を実行。
```bash
npm run build
```

必要に応じて実行するコマンド
--

app_common/prisma/schema.prismaを修正した場合は、app_common直下で以下の用途に応じたコマンドを実行。
```bash
モジュールに反映したい場合（schema.prismaを基に関連prismaモジュールを生成する）
npx prisma generate

scheam.prismaを基にテーブルを作成したい場合
npx prisma db push
```

特定のファイル実行
```bash
npx tsx ファイルパス

デバッグしたい場合は「ctrl + shift + p」で「JavaScript Debug Terminal」開いて、上記コマンドを実行する
```

dockerを使わずにサーバ起動したい場合
```bash
npm run dev --workspace=app_web
```

その他コマンド
```bash
各階層に存在する「package.json」の「scripts」を参照。scripts内のスクリプトを以下コマンドで実行できる
npm run コマンド名
```