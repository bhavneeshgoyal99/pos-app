export interface TmaTask {
  type: 'TMA';
  product: {
    sku: string;
    brand: string;
    category: string;
  };
  eventType: string;
  photos: string[];
  notes: string;
  timestamp: Date;
}