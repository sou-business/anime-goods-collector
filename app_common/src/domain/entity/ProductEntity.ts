export class ProductEntity {
    constructor(
        public readonly id: number | null,
        public readonly detailUrl: string,
        public readonly title: string,
        public readonly imageUrl: string | null,
        public readonly price: number | null
    ) {
        if (!detailUrl) throw new Error('detailUrlは必須です');
        this.validateUrl(detailUrl);
        
        if (!title) throw new Error('titleは必須です');
        
        if (imageUrl) this.validateUrl(imageUrl);
        
        if (price !== null && price < 0) throw new Error('priceは0以上である必要があります');
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
}   