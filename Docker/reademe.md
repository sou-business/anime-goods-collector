powershellで本ディレクトリまで移動

コンテナ生成
```
docker-compose up -d

DBコンテナスタート
```
docker start postgres_scraping_anime

コンテナ再生成コマンド。データ残したいときは「-v」を外す。生成時のログ見たい場合は「-d」外す
```
docker-compose down -v
docker-compose up -d

