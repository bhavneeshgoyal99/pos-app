import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import { curveLinear } from 'd3-shape';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MockReportStock } from '../interfaces/MockReportStock';
import { Product } from '../interfaces/Product';

@Component({
  selector: 'app-stock-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    NgxChartsModule,
    MatCheckboxModule
  ],
  templateUrl: './stock-status.component.html',
  styleUrls: ['./stock-status.component.scss'],
})
export class StockStatusComponent implements OnInit {
  // Mock Data
  mockReports: MockReportStock[] = [];
  brands: string[] = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];
  retailers: string[] = ['Retail Chain A', 'Retail Chain B', 'Retail Chain C'];

  // Filters
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ),
    end: new FormControl<Date | null>(new Date()),
  });
  brandFilter = new FormControl<string[]>([]);
  retailerFilter = new FormControl<string[]>([]);

  // Chart Data
  stockLevelData: any[] = [];
  outOfStockData: any[] = [];
  curve = curveLinear; // For line chart curve

  // Table Data
  displayedColumns: string[] = [
    'product',
    'brand',
    'location',
    'stock',
    'status',
  ];
  dataSource: any[] = [];

  // Export State
  exportLoading = false;

  selectedProducts: string[] = [];

  records: Product[] = [
    {
      retailer: 'WORTEN',
      pointOfSale: 'WORTEN, Añaza',
      sku: '55E7NQ PRO (6942351402819)',
      date: '22.05.2025, 12:08:16',
      imageUrl: 'https://www.shutterstock.com/image-photo/orchard-road-singapore-november-19-260nw-2393278461.jpg',
    },
    {
      retailer: 'WORTEN',
      pointOfSale: 'WORTEN, Añaza',
      sku: '55U7NQ (6942351404325)',
      date: '22.05.2025, 12:08:15',
      imageUrl: 'https://www.shutterstock.com/image-photo/orchard-road-singapore-november-19-260nw-2393278461.jpg',
    },
    {
      retailer: 'MEDIAMARKT',
      pointOfSale: 'MEDIAMARKT, Añaza',
      sku: '65E7NQ PRO (6942351402871)',
      date: '22.05.2025, 11:26:46',
      imageUrl: 'https://www.shutterstock.com/image-photo/orchard-road-singapore-november-19-260nw-2393278461.jpg',
    },
    {
      retailer: 'MEDIAMARKT',
      pointOfSale: 'MEDIAMARKT, Añaza',
      sku: '65E7NQ (6942351402870)',
      date: '22.05.2025, 11:26:46',
      imageUrl: 'https://www.shutterstock.com/image-photo/orchard-road-singapore-november-19-260nw-2393278461.jpg',
    },
  ];

  ngOnInit(): void {
    this.mockReports = this.generateMockStockReports();
    this.updateDashboard();
  }

  generateMockStockReports(): MockReportStock[] {
    const categories = ['Footwear', 'Apparel', 'Accessories'];
    const subcategories: Record<string, string[]> = {
      Footwear: ['Running', 'Casual', 'Athletic'],
      Apparel: ['T-Shirts', 'Jackets', 'Shorts'],
      Accessories: ['Bags', 'Hats', 'Socks'],
    };

    const reports: MockReportStock[] = [];
    const today = new Date();

    for (let i = 0; i < 150; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
      const retailer =
        this.retailers[Math.floor(Math.random() * this.retailers.length)];

      // Create dates within last 90 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90));

      const threshold = Math.floor(Math.random() * 5) + 3; // Random threshold between 3-7
      const quantity = Math.floor(Math.random() * 15); // Random stock 0-14

      reports.push({
        id: `stock_rep_${i}`,
        user: {
          id: `user_${i % 5}`,
          name: `Promoter ${['A', 'B', 'C', 'D', 'E'][i % 5]}`,
        },
        pos: {
          id: `pos_${i % 15}`,
          name: `Store ${(i % 15) + 1}`,
          retailer: retailer,
        },
        date: date,
        tasks: [
          {
            type: 'Stock',
            product: {
              sku: `SKU-${brand.substring(0, 3)}-${Math.floor(
                1000 + Math.random() * 9000
              )}`,
              brand: brand,
              category: category,
              subcategory:
                subcategories[category][
                  Math.floor(Math.random() * subcategories[category].length)
                ],
            },
            quantity: quantity,
            threshold: threshold,
          },
        ],
      });
    }

    return reports;
  }

  updateDashboard(): void {
    const filtered = this.applyFilters();
    this.generateStockLevelData(filtered);
    this.generateOutOfStockData(filtered);
    this.updateTableData(filtered);
  }

  generateStockLevelData(reports: MockReportStock[]): void {
    const brandMap = new Map<string, { total: number; count: number }>();

    reports.forEach((report) => {
      const task = report.tasks[0];
      const current = brandMap.get(task.product.brand) || {
        total: 0,
        count: 0,
      };
      brandMap.set(task.product.brand, {
        total: current.total + task.quantity,
        count: current.count + 1,
      });
    });

    this.stockLevelData = Array.from(brandMap.entries())
      .map(([name, data]) => ({
        name,
        value: parseFloat((data.total / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }

  generateOutOfStockData(reports: MockReportStock[]): void {
    // Group by retailer and week to show trends over time
    const retailerWeekMap = new Map<
      string,
      Map<string, { outOfStock: number; total: number }>
    >();

    reports.forEach((report) => {
      const task = report.tasks[0];
      const retailer = report.pos.retailer;
      const week = this.getWeekNumber(report.date);

      if (!retailerWeekMap.has(retailer)) {
        retailerWeekMap.set(retailer, new Map());
      }

      const weekMap = retailerWeekMap.get(retailer)!;
      const current = weekMap.get(week) || { outOfStock: 0, total: 0 };

      weekMap.set(week, {
        outOfStock: current.outOfStock + (task.quantity === 0 ? 1 : 0),
        total: current.total + 1,
      });
    });

    // Format data for line chart (series per retailer)
    this.outOfStockData = Array.from(retailerWeekMap.entries()).map(
      ([retailer, weekMap]) => {
        return {
          name: retailer,
          series: Array.from(weekMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort weeks chronologically
            .map(([week, data]) => ({
              name: `Week ${week}`,
              value: parseFloat(
                ((data.outOfStock / data.total) * 100).toFixed(1)
              ),
            })),
        };
      }
    );
  }

  getWeekNumber(date: Date): string {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const dayNumber = Math.floor(
      (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((dayNumber + oneJan.getDay() + 1) / 7).toString();
  }

  updateTableData(reports: MockReportStock[]): void {
    this.dataSource = reports.map((report) => {
      const task = report.tasks[0];
      return {
        product: task.product.sku,
        brand: task.product.brand,
        category: task.product.category,
        location: report.pos.name,
        retailer: report.pos.retailer,
        stock: task.quantity,
        threshold: task.threshold,
        status: this.getStockStatus(task.quantity, task.threshold),
        date: report.date,
      };
    });
  }

  getStockStatus(quantity: number, threshold: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < threshold) return 'Low Stock';
    return 'In Stock';
  }

  applyFilters(): MockReportStock[] {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    const selectedBrands = this.brandFilter.value || [];
    const selectedRetailers = this.retailerFilter.value || [];

    return this.mockReports.filter((report) => {
      // Date filter
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;

      // Brand filter
      if (
        selectedBrands.length > 0 &&
        !selectedBrands.includes(report.tasks[0].product.brand)
      ) {
        return false;
      }

      // Retailer filter
      if (
        selectedRetailers.length > 0 &&
        !selectedRetailers.includes(report.pos.retailer)
      ) {
        return false;
      }

      return true;
    });
  }

  async exportData(format: 'CSV'): Promise<void> {
    this.exportLoading = true;

    try {
      const exportData = this.dataSource.map((item) => ({
        'Product SKU': item.product,
        Brand: item.brand,
        Category: item.category,
        Store: item.location,
        Retailer: item.retailer,
        'Stock Level': item.stock,
        'Minimum Threshold': item.threshold,
        Status: item.status,
        'Last Updated': item.date.toLocaleDateString(),
      }));

      this.downloadCSV(exportData, 'stock-status-report.csv');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.exportLoading = false;
    }
  }

  private downloadCSV(data: any[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');
    XLSX.writeFile(wb, filename);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Out of Stock':
        return 'status-out';
      case 'Low Stock':
        return 'status-low';
      default:
        return 'status-ok';
    }
  }

  toggleSelectedProduct(product: Product): void {
  const index = this.selectedProducts.indexOf(product.sku);
  
  if (index > -1) {
    // SKU is already selected — remove it
    this.selectedProducts.splice(index, 1);
  } else {
    // SKU not selected — add it
    this.selectedProducts.push(product.sku);
  }
}
}
