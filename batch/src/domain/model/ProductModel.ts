export class ProductModel {
    constructor(
        public readonly title: string,
        public readonly price?: number,
        public readonly detail_url?: string,
        public readonly image_url?: string,
    ) {
    }
  
    // デバッグ・ログ用
    toString(): string {
        const priceStr = this.price ? `¥${this.price.toLocaleString()}`: '';
        const urlInfo = this.detail_url ? `, url=${this.detail_url}` : '';
        const imageInfo = this.image_url ? `, has_image=true` : ', has_image=false';
        
        return `Product(title="${this.title}", price=${priceStr}${urlInfo}${imageInfo})`;
    }
}