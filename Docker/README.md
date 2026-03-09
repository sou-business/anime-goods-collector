## 前提条件  
 - 本リポジトリをローカルにクローンしていること  
 - ポート：3000、5432、6379が空いてること  

## 1. 以下サイトからdocker desktopをインストール   
https://www.docker.com/ja-jp/products/docker-desktop/

docker desktop を起動

## 2. powershellで本ディレクトリまで移動して以下を実行

イメージ取得＆コンテナビルド＆コンテナ起動
```
docker-compose up -d
```

docker desktopのContainers見て「anime-collect」配下のコンテナが全て起動（Actionsが■）していればOK。  

## 3. Docker Desktopで確認
2. が完了したらDocker Desktopを開いて   
Imagesに「redis、postgres、anime-collect-batch、anime-collect-web」
Containersに「anime-collect」ができる。
不要になればそれらを削除すればいい。

## 4. 実際にサイトを開く
http://localhost:3000/ にアクセスして、ドキュメントディレクトリにある「ドキュメント/実際の画像.png」のようなサイトが表示されれば完了


## docker-compose コマンド一覧

コンテナ生成（web、batchを再ビルドする場合は「cache、db」が起動してる必要がある）
```
// 全コンテナ再起動
docker-compose up -d

// 特定コンテナのみ再起動。末尾はコンテナに応じて変更「web, batch, db, cache」
docker-compose up -d web

// 全コンテナ再ビルド。依存関係を変更、docker設定関連ファイルを変更した場合等に使用する。
docker-compose up -d --build
```

削除
```
// dockerで動いているコンテナを停止
docker-compose stop

// 動いてないコンテナ全削除。データ残したいときは「-v」を外す。生成時のログ見たい場合は「-d」外す
docker-compose down -v

// 未使用のボリューム削除
docker volume prune -f

// 強制的に動いてるイメージもコンテナもボリュームもすべて削除
docker-compose down --volumes --rmi all
```

コンテナ接続（app_webを接続したいコンテナ名に置き換える）
```
docker exec -it app_web sh
```