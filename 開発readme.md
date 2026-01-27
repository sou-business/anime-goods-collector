前提   
```bash
OS：windows11
```

各プロジェクト一括で依存関係の解決＆ビルド
```bash
npm install
```

各プロジェクトで個別にビルドしたい場合は、各プロジェクト直下で以下を実行
```bash
npm run build
```

app_common/prisma/schema.prismaを修正した場合は、app_common直下で以下の用途に応じたコマンドを実行
```bash
モジュールに反映したい場合
npx prisma generate

scheam.prismaを基にテーブルを再作成したい場合
npx prisma db push
```

特定のファイル実行
```bash
npx tsx ファイルパス
```

errorや問題個所のあるファイル表示(app_common, app_batch直下)
```bash
npx eslint --quiet
```

dockerを使わずにサーバ起動したい場合
```bash
npm run dev --workspace=app_web
```