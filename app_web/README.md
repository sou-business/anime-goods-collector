## Getting Started

サーバ起動:
```bash
npm run dev
```

app/prisma/schema.prismaを修正した場合は、以下コマンドを実行
```bash
npx prisma generate
```

特定のファイル実行
```bash
npx tsx src/db/products.ts
```