export class ProductModel {
    constructor(
        public readonly id: number | null,
        public readonly detailUrl: string,
        public readonly title: string,
        public readonly imageUrl: string | null,
        public readonly price: number | null
    ) {}
}