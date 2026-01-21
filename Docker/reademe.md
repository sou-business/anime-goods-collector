## 1. 以下サイトからdocker desktopをインストール   
https://www.docker.com/ja-jp/products/docker-desktop/

docker desktop を起動

## 2. powershellで本ディレクトリまで移動して以下を実行

イメージ取得＆コンテナ生成
```
docker-compose up -d
```

### 開発で「コードだけ」反映したい場合（おすすめ）
このリポジトリの `docker-compose.yml` は、`web` と `batch` のソースをコンテナにマウントして `dev` 起動するようにしてあるため、
通常は `docker-compose up -d` だけでコード変更が即反映されます。

依存関係（npm installが必要な変更）またはdocker設定関連ファイルを変更したときだけ、`--build` を付けてください：

```
docker-compose up -d --build
```

コンテナ再生成コマンド（コードを変更して反映したい場合等に利用する）    
```
データ残したいときは「-v」を外す。生成時のログ見たい場合は「-d」外す
docker-compose down -v

webコンテナのみ再ビルドしたい場合
docker-compose up -d web

batchコンテナのみ再ビルドしたい場合
docker-compose up -d batch
```

## 3. Docker Desktopで確認
2. が完了したらDocker Desktopを開いて   
Imagesに「redis、postgres、anime-collect-batch、anime-collect-web」
Containersに「anime-collect」ができる。
不要になればそれらを削除すればいい。

## 4. 実際にサイトを開く
http://localhost:3000/ にアクセスして、ドキュメントディレクトリにある「ドキュメント/実際の画像.png」のようなサイトが表示されれば完了
