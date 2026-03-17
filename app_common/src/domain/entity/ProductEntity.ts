export type ProductProps = {
    detailUrl: string;
    imageUrl: string;
    title: string;
    price: number;
}

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

    static reconstruct(product: ProductProps): ProductEntity {
        return new ProductEntity(
            product.detailUrl,
            product.imageUrl,
            product.title,
            product.price
        );
    }

    private validateUrl(url: string): void {
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            throw new Error(`URLが不正な形式です：${url}`);
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error(`URLはhttp/https形式である必要があります：${url}`);
        }
    }

    private validateRequired(value: string, fieldName: string): void {
        if (!value) throw new Error(`${fieldName}は必須です`);
    }

}