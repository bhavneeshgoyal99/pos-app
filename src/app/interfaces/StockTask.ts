export interface StockTask {
  type: 'Stock';
  product: {
    sku: string;
    brand: string;
    category: string;
    subcategory: string;
  };
  quantity: number;
  threshold: number; // Minimum stock level
}