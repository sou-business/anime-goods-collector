export class ProductModel {
    constructor(
        public readonly title: string,
        public readonly price?: number,
        public readonly detail_url?: string,
        public readonly image_url?: string,
    ) {}
}