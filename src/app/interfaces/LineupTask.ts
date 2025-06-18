export interface LineupTask {
  type: 'Lineup';
  product: {
    sku: string;
    brand: string;
    category: string;
    subcategory: string;
  };
  isInLineup: boolean;
  isReported: boolean;
}