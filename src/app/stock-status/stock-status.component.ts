import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import * as XLSX from 'xlsx';

import { StockTask } from '../interfaces/StockTask';

interface MockReportStock {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string; retailer: string };
  date: Date;
  tasks: StockTask[];
}

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
    NgxChartsModule
  ],
  templateUrl: './stock-status.component.html',
  styleUrls: ['./stock-status.component.scss']
})
export class StockStatusComponent implements OnInit {
  // Mock Data
  mockReports: MockReportStock[] = [];
  brands: string[] = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];
  retailers: string[] = ['Retail Chain A', 'Retail Chain B', 'Retail Chain C'];
  
  // Filters
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    end: new FormControl<Date | null>(new Date())
  });
  brandFilter = new FormControl<string[]>([]);
  retailerFilter = new FormControl<string[]>([]);
  
  // Chart Data
  stockLevelData: any[] = [];
  outOfStockData: any[] = [];
  
  // Table Data
  displayedColumns: string[] = ['product', 'brand', 'location', 'stock', 'status'];
  dataSource: any[] = [];
  
  // Export State
  exportLoading = false;

  ngOnInit(): void {
    this.mockReports = this.generateMockStockReports();
    this.updateDashboard();
  }

  generateMockStockReports(): MockReportStock[] {
    const categories = ['Footwear', 'Apparel', 'Accessories'];
    const subcategories: Record<string, string[]> = {
      'Footwear': ['Running', 'Casual', 'Athletic'],
      'Apparel': ['T-Shirts', 'Jackets', 'Shorts'],
      'Accessories': ['Bags', 'Hats', 'Socks']
    };
    
    const reports: MockReportStock[] = [];
    const today = new Date();
    
    for (let i = 0; i < 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
      const retailer = this.retailers[Math.floor(Math.random() * this.retailers.length)];
      
      // Create dates within last 90 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90));
      
      const threshold = Math.floor(Math.random() * 5) + 3; // Random threshold between 3-7
      const quantity = Math.floor(Math.random() * 15); // Random stock 0-14
      
      reports.push({
        id: `stock_rep_${i}`,
        user: { 
          id: `user_${i % 5}`, 
          name: `Promoter ${['A', 'B', 'C', 'D', 'E'][i % 5]}`
        },
        pos: { 
          id: `pos_${i % 15}`, 
          name: `Store ${i % 15 + 1}`,
          retailer: retailer
        },
        date: date,
        tasks: [{
          type: 'Stock',
          product: {
            sku: `SKU-${brand.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
            brand: brand,
            category: category,
            subcategory: subcategories[category][Math.floor(Math.random() * subcategories[category].length)]
          },
          quantity: quantity,
          threshold: threshold
        }]
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
    const brandMap = new Map<string, { total: number, count: number }>();
    
    reports.forEach(report => {
      const task = report.tasks[0];
      const current = brandMap.get(task.product.brand) || { total: 0, count: 0 };
      brandMap.set(task.product.brand, {
        total: current.total + task.quantity,
        count: current.count + 1
      });
    });
    
    this.stockLevelData = Array.from(brandMap.entries())
      .map(([name, data]) => ({ 
        name, 
        value: parseFloat((data.total / data.count).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }

  generateOutOfStockData(reports: MockReportStock[]): void {
    const retailerMap = new Map<string, { outOfStock: number, total: number }>();
    
    reports.forEach(report => {
      const task = report.tasks[0];
      const current = retailerMap.get(report.pos.retailer) || { outOfStock: 0, total: 0 };
      retailerMap.set(report.pos.retailer, {
        outOfStock: current.outOfStock + (task.quantity === 0 ? 1 : 0),
        total: current.total + 1
      });
    });
    
    this.outOfStockData = Array.from(retailerMap.entries())
      .map(([name, data]) => ({
        name,
        value: parseFloat(((data.outOfStock / data.total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value);
  }

  updateTableData(reports: MockReportStock[]): void {
    this.dataSource = reports.map(report => {
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
        date: report.date
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
    
    return this.mockReports.filter(report => {
      // Date filter
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;
      
      // Brand filter
      if (selectedBrands.length > 0 && 
          !selectedBrands.includes(report.tasks[0].product.brand)) {
        return false;
      }
      
      // Retailer filter
      if (selectedRetailers.length > 0 && 
          !selectedRetailers.includes(report.pos.retailer)) {
        return false;
      }
      
      return true;
    });
  }

  async exportData(format: 'CSV'): Promise<void> {
    this.exportLoading = true;
    
    try {
      const exportData = this.dataSource.map(item => ({
        'Product SKU': item.product,
        'Brand': item.brand,
        'Category': item.category,
        'Store': item.location,
        'Retailer': item.retailer,
        'Stock Level': item.stock,
        'Minimum Threshold': item.threshold,
        'Status': item.status,
        'Last Updated': item.date.toLocaleDateString()
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
  switch(status) {
    case 'Out of Stock': return 'status-out';
    case 'Low Stock': return 'status-low';
    default: return 'status-ok';
  }
}
}