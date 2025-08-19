import { ProductModel } from "app_common";

export class FrontProduct {
    title: string;
    price?: number;
    detail_url?: string;
    image_url?: string;

    constructor({ title, price, detail_url, image_url }: ProductModel) {
        this.title = title;
        this.price = price;
        this.detail_url = detail_url;
        this.image_url = image_url;
    }
}