import { ProductEntity } from 'app_common/server';

export function buildProductEntity(
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