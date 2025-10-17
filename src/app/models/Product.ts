// src/app/models/product.model.ts
export interface Product {
  _id: string;
  name: string;
  barcode: string;
  price: number;
  categoryId: {
    _id: string;
    name: string;
  } | null;
  minStockThreshold: number;
  quantity: number;
  image?: string;
}