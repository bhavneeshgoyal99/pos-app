export interface SaleTask {
  type: 'Sale';
  product: {
    sku: string;
    brand: string;
    category: string;
    subcategory: string;
  };
  price: number;
  quantity: number;
}