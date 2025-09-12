## 1. 以下サイトからdocker desktopをインストール   
https://www.docker.com/ja-jp/products/docker-desktop/

## 2. powershellで本ディレクトリまで移動して以下を実行

コンテナ生成
```
docker-compose up -d
```

コンテナ再生成コマンド（コードを変更して反映したい場合等に利用する）    
```
データ残したいときは「-v」を外す。生成時のログ見たい場合は「-d」外す

docker-compose down -v

既存イメージのまま起動。Dockerfile の変更は無視
docker-compose up -d

Dockerfile を再ビルドして最新コード・依存を反映
docker-compose up -d --build
```

## 3. Docker Desktopで確認
2. が完了したらDocker Desktopを開いて   
Imagesに「redis、postgres、anime-collect-batch、anime-collect-web」
Containersに「anime-collect」ができる。
不要になればそれらを削除すればいい。

## 4. 実際にサイトを開く
http://localhost:3000/ にアクセスして、ドキュメントディレクトリにある「実際の画像.png」のようなサイトが表示されれば完了
