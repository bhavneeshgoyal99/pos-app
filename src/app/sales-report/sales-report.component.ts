import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';
import { FormGroup, FormControl } from '@angular/forms';

import { SaleTask } from '../interfaces/SaleTask';
import {MockReportTasks} from '../interfaces/MockReportTasks';


@Component({
  selector: 'app-sales-report',
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
    MatSortModule,
    MatPaginatorModule,
    NgxChartsModule,
    MatMenuModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  // Mock Data
  mockReports: MockReportTasks[] = [];
  brands: string[] = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];
  retailers: string[] = ['Retail Chain A', 'Retail Chain B', 'Retail Chain C'];
  categories: string[] = ['Footwear', 'Apparel', 'Accessories'];
  
  // Filters
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    end: new FormControl<Date | null>(new Date())
  });
  brandFilter = new FormControl<string[]>([]);
  retailerFilter = new FormControl<string[]>([]);
  categoryFilter = new FormControl<string[]>([]);
  
  // Chart Data
  brandRevenueData: any[] = [];
  timeSeriesData: any[] = [];
  categoryDistributionData: any[] = [];
  
  // Table Data
  displayedColumns: string[] = ['product', 'brand', 'category', 'retailer', 'quantity', 'price', 'revenue'];
  dataSource: any[] = [];
  
  // Export State
  exportLoading = false;

  chartColorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#7AA3E5', '#E44D25', '#CFC0BB']
  };

  ngOnInit(): void {
    this.brandRevenueData = [];
    this.timeSeriesData = [];
    this.categoryDistributionData = [];
    
    // Then load data
    this.mockReports = this.generateMockSales();
    this.updateDashboard();
  }

  generateMockSales(): MockReportTasks[] {
    const subcategories: Record<string, string[]> = {
      'Footwear': ['Running', 'Casual', 'Athletic'],
      'Apparel': ['T-Shirts', 'Jackets', 'Shorts'],
      'Accessories': ['Bags', 'Hats', 'Socks']
    };
    
    const reports: MockReportTasks[] = [];
    const today = new Date();
    
    for (let i = 0; i < 150; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
      const retailer = this.retailers[Math.floor(Math.random() * this.retailers.length)];
      
      // Create dates within last 90 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90));
      
      // Generate 1-3 sales tasks per report
      const tasks: SaleTask[] = [];
      const taskCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < taskCount; j++) {
        tasks.push({
          type: 'Sale',
          product: {
            sku: `SKU-${brand.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
            brand: brand,
            category: category,
            subcategory: subcategories[category][Math.floor(Math.random() * subcategories[category].length)]
          },
          price: parseFloat((50 + (Math.random() * 150)).toFixed(2)),
          quantity: Math.floor(Math.random() * 10) + 1
        });
      }
      
      reports.push({
        id: `sales_rep_${i}`,
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
        tasks: tasks
      });
    }
    
    return reports;
  }

  updateDashboard(): void {
    const filtered = this.applyFilters();
    this.generateBrandRevenueData(filtered);
    this.generateTimeSeriesData(filtered);
    this.generateCategoryDistributionData(filtered);
    this.updateTableData(filtered);
  }

  generateBrandRevenueData(reports: MockReportTasks[]): void {
  const brandMap = new Map<string, number>();
  
  reports.forEach(report => {
    report.tasks.forEach(task => {
      const revenue = task.price * task.quantity;
      brandMap.set(task.product.brand, (brandMap.get(task.product.brand) || 0) + revenue);
    });
  });
  
  // Ensure we always return an array with proper structure
  this.brandRevenueData = Array.from(brandMap.entries()).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    extra: { id: name.toLowerCase().replace(' ', '-') }
  })) || []; // Fallback to empty array
}


  generateTimeSeriesData(reports: MockReportTasks[]): void {
    const daysInRange = Math.floor(
      ((this.dateRange.value.end?.getTime() || 0) - (this.dateRange.value.start?.getTime() || 0)) / 
      (1000 * 60 * 60 * 24)
    ) + 1;
    
    const seriesData = [];
    const startDate = this.dateRange.value.start || new Date();
    
    for (let i = 0; i < daysInRange; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dailySales = reports
        .filter(r => r.date.toDateString() === currentDate.toDateString())
        .reduce((sum, r) => sum + r.tasks.reduce((taskSum, t) => taskSum + (t.price * t.quantity), 0), 0);
      
      seriesData.push({
        name: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(dailySales.toFixed(2))
      });
    }
    
    this.timeSeriesData = seriesData;
  }

  generateCategoryDistributionData(reports: MockReportTasks[]): void {
    const categoryMap = new Map<string, number>();
    
    reports.forEach(report => {
      report.tasks.forEach(task => {
        const revenue = task.price * task.quantity;
        const current = categoryMap.get(task.product.category) || 0;
        categoryMap.set(task.product.category, current + revenue);
      });
    });
    
    this.categoryDistributionData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }));
  }

  updateTableData(reports: MockReportTasks[]): void {
    this.dataSource = reports.flatMap(report => 
      report.tasks.map(task => ({
        product: task.product.sku,
        brand: task.product.brand,
        category: task.product.category,
        subcategory: task.product.subcategory,
        retailer: report.pos.retailer,
        pos: report.pos.name,
        quantity: task.quantity,
        price: task.price,
        revenue: parseFloat((task.price * task.quantity).toFixed(2)),
        date: report.date
      }))
    );
  }

  applyFilters(): MockReportTasks[] {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    const selectedBrands = this.brandFilter.value || [];
    const selectedRetailers = this.retailerFilter.value || [];
    const selectedCategories = this.categoryFilter.value || [];
    
    return this.mockReports.filter(report => {
      // Date filter
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;
      
      // Retailer filter
      if (selectedRetailers.length > 0 && 
          !selectedRetailers.includes(report.pos.retailer)) {
        return false;
      }
      
      // Check if any task matches brand/category filters
      return report.tasks.some(task => {
        const brandMatch = selectedBrands.length === 0 || 
                         selectedBrands.includes(task.product.brand);
        const categoryMatch = selectedCategories.length === 0 || 
                            selectedCategories.includes(task.product.category);
        
        return brandMatch && categoryMatch;
      });
    });
  }

  async exportChart(format: 'PNG' | 'CSV'): Promise<void> {
    this.exportLoading = true;
    
    try {
      switch(format) {
        case 'PNG':
          const chartElement = document.getElementById('brandRevenueChart');
          if (chartElement) {
            const dataUrl = await htmlToImage.toPng(chartElement);
            this.downloadImage(dataUrl, 'sales-chart.png');
          }
          break;
          
        case 'CSV':
          const csvData = this.dataSource.map(item => ({
            'Product SKU': item.product,
            'Brand': item.brand,
            'Category': item.category,
            'Subcategory': item.subcategory,
            'Retailer': item.retailer,
            'Store': item.pos,
            'Quantity': item.quantity,
            'Unit Price': item.price,
            'Total Revenue': item.revenue,
            'Date': item.date.toLocaleDateString()
          }));
          this.downloadCSV(csvData, 'sales-report.csv');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.exportLoading = false;
    }
  }

  private downloadCSV(data: any[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, filename);
  }

  private downloadImage(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}