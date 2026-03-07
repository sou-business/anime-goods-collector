export class ProductEntity {
    constructor(
        public readonly detailUrl: string,
        public readonly imageUrl: string,
        public readonly title: string,
        public readonly price: number
    ) {
        this.validateRequired(detailUrl, 'detailUrl');
        this.validateRequired(imageUrl, 'imageUrl');
        this.validateRequired(title, 'title');
        this.validateUrl(detailUrl);
        this.validateUrl(imageUrl);
        if (price < 0) throw new Error('priceは0以上である必要があります');
    }

    /**
   * 外部データ（Raw Data）をドメインモデルとして「構成」する
   */
    static fromRawData(
        baseUrl: string,
        detailPath: string,
        imagePath: string,
        rawTitle: string,
        rawPrice: string
    ): ProductEntity {
        const detailUrl = new URL(detailPath, baseUrl).href;
        const imageUrl = new URL(imagePath, baseUrl).href;
        const price = parseInt(rawPrice.replace(/[^\d]/g, ''));

        return new ProductEntity(
            detailUrl,
            imageUrl,
            rawTitle,
            price
        );
    }

    private validateUrl(url: string): void {
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            throw new Error('URLが不正な形式です');
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('URLはhttp/https形式である必要があります');
        }
    }

    private validateRequired(value: string, fieldName: string): void {
        if (!value) throw new Error(`${fieldName}は必須です`);
    }

}