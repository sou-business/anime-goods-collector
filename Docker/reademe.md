## 1. 以下サイトからdocker desktopをインストール   
https://www.docker.com/ja-jp/products/docker-desktop/

docker desktop を起動

## 2. powershellで本ディレクトリまで移動して以下を実行

イメージ取得＆コンテナ生成
```
docker-compose up -d db
```

app_common/prisma/scheam.prismaを基にテーブル作成する
```
cd ../app_common
npx prisma db push
```

再度本ディレクトリまで移動して以下を実行
```
docker-compose up -d
```

### 開発で「コードだけ」反映したい場合（おすすめ）
このリポジトリの `docker-compose.yml` は、`web` と `batch` のソースをコンテナにマウントして `dev` 起動するようにしてあるため、
通常は `docker-compose up -d` だけでコード変更が即反映されます。

コンテナ生成
```
依存関係（npm installが必要な変更）またはdocker設定関連ファイルを変更したときだけ、`--build` を付けてください：
docker-compose up -d --build

webコンテナのみ再ビルドしたい場合（他コンテナも同様「web, batch, db, cache」等）
docker-compose up -d web
```

削除
```
dockerで動いているコンテナを停止
docker-compose stop

動いてないコンテナ全削除。データ残したいときは「-v」を外す。生成時のログ見たい場合は「-d」外す
docker-compose down -v

強制的にイメージもコンテナもボリュームもすべて削除
docker-compose down --volumes --rmi all
```

## 3. Docker Desktopで確認
2. が完了したらDocker Desktopを開いて   
Imagesに「redis、postgres、anime-collect-batch、anime-collect-web」
Containersに「anime-collect」ができる。
不要になればそれらを削除すればいい。

## 4. 実際にサイトを開く
http://localhost:3000/ にアクセスして、ドキュメントディレクトリにある「ドキュメント/実際の画像.png」のようなサイトが表示されれば完了
