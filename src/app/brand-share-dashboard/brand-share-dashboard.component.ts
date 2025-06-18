import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

import { BrandExposure } from '../interfaces/BrandExposure';
import { BrandShareResult } from '../interfaces/BrandShareResult';

@Component({
  selector: 'app-brand-share-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatTooltipModule,
    MatTableModule,
    MatTabsModule,
    MatProgressBarModule,
    NgxChartsModule,
    MatButtonToggleModule
  ],
  templateUrl: './brand-share-dashboard.component.html',
  styleUrls: ['./brand-share-dashboard.component.scss']
})
export class BrandShareDashboardComponent implements OnInit {
  // Chart configuration
  chartOptions = {
    view: [800, 400] as [number, number],
    showLegend: true,
    legendPosition: LegendPosition.Right,
    legendTitle: 'Brands',
    showXAxis: true,
    showYAxis: true,
    showXAxisLabel: true,
    showYAxisLabel: true,
    xAxisLabel: 'Brand',
    yAxisLabel: 'Share (%)',
    showDataLabel: true,
    gradient: false,
    colorScheme: {
       name: 'custom',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#FFA500', '#4682B4']
    },
    animations: true
  };

  // Mock data
  exposureData: BrandExposure[] = [
    { brand: 'Nike', category: 'Shoes', subcategory: 'Sports', exposureCount: 120 },
    { brand: 'Puma', category: 'Shoes', subcategory: 'Sports', exposureCount: 85 },
    { brand: 'Adidas', category: 'Shoes', subcategory: 'Sports', exposureCount: 90 },
    { brand: 'Reebok', category: 'Shoes', subcategory: 'Sports', exposureCount: 110 },
    { brand: 'Under Armour', category: 'Shoes', subcategory: 'Sports', exposureCount: 60 },
  ];

  // Filter options
  categories: string[] = [];
  subcategories: string[] = [];
  brands: string[] = [];
  
  // Filters
  selectedCategory = '';
  selectedSubcategory = '';
  selectedBrand = '';

  // Analysis results
  subcategoryResults: BrandShareResult[] = [];
  categoryResults: BrandShareResult[] = [];
  currentView: 'subcategory' | 'category' = 'subcategory';
  chartType: 'vertical-bar' | 'pie' | 'advanced-pie' = 'vertical-bar';

  ngOnInit(): void {
    this.initializeFilters();
    this.analyzeData();
  }

  initializeFilters(): void {
    this.categories = [...new Set(this.exposureData.map(item => item.category))];
    this.brands = [...new Set(this.exposureData.map(item => item.brand))];
    this.updateSubcategoryOptions();
  }

  updateSubcategoryOptions(): void {
    this.subcategories = this.selectedCategory 
      ? [...new Set(this.exposureData
          .filter(item => item.category === this.selectedCategory)
          .map(item => item.subcategory))]
      : [...new Set(this.exposureData.map(item => item.subcategory))];
    
    if (!this.subcategories.includes(this.selectedSubcategory)) {
      this.selectedSubcategory = '';
    }
  }

  onFilterChange(): void {
    this.updateSubcategoryOptions();
    this.analyzeData();
  }

  analyzeData(): void {
    const filteredData = this.getFilteredData();
    
    // Subcategory analysis
    if (this.selectedSubcategory) {
      const subcategoryData = filteredData.filter(
        item => item.subcategory === this.selectedSubcategory
      );
      this.subcategoryResults = this.calculateBrandShare(subcategoryData);
    } else {
      this.subcategoryResults = [];
    }
    
    // Category analysis
    if (this.selectedCategory) {
      const categoryData = filteredData.filter(
        item => item.category === this.selectedCategory
      );
      this.categoryResults = this.calculateBrandShare(categoryData);
    } else {
      this.categoryResults = this.calculateBrandShare(filteredData);
    }
  }

  calculateBrandShare(data: BrandExposure[]): BrandShareResult[] {
    const totalExposure = data.reduce((sum, item) => sum + item.exposureCount, 0);
    if (totalExposure === 0) return [];
    
    const brandGroups = new Map<string, {count: number, exposure: number}>();
    data.forEach(item => {
      const current = brandGroups.get(item.brand) || {count: 0, exposure: 0};
      brandGroups.set(item.brand, {
        count: current.count + 1,
        exposure: current.exposure + item.exposureCount
      });
    });
    
    return Array.from(brandGroups.entries())
      .map(([brand, data]) => ({
        name: brand,
        value: (data.exposure / totalExposure) * 100,
        extra: {
          exposureCount: data.exposure
        }
      }))
      .sort((a, b) => b.value - a.value);
  }

  getFilteredData(): BrandExposure[] {
    let data = [...this.exposureData];
    
    if (this.selectedCategory) {
      data = data.filter(item => item.category === this.selectedCategory);
    }
    
    if (this.selectedSubcategory) {
      data = data.filter(item => item.subcategory === this.selectedSubcategory);
    }
    
    if (this.selectedBrand) {
      data = data.filter(item => item.brand === this.selectedBrand);
    }
    
    return data;
  }

  get currentResults(): BrandShareResult[] {
    return this.currentView === 'subcategory' && this.selectedSubcategory
      ? this.subcategoryResults
      : this.categoryResults;
  }

  get chartTitle(): string {
    return `Brand Share in ${this.currentView === 'category' 
      ? (this.selectedCategory || 'All Categories') 
      : this.selectedSubcategory}`;
  }

  formatDataLabel(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  onSelectChartItem(event: any): void {
    // You can implement selection handling here
    console.log('Item selected', event);
  }
}