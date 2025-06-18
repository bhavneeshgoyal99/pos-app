import { Component, Inject, OnInit } from '@angular/core';
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
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';

import { PosDetailsDialogComponent } from '../common/pos-details-dialog/pos-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { PosDetail } from '../interfaces/PosDetail';
import { LineupTask } from '../interfaces/LineupTask';
import { MockReport } from '../interfaces/MockReport';
import {PosPerformance} from '../interfaces/PosPerformance';


@Component({
  selector: 'app-lineup-sample',
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
  ],
  templateUrl: './lineup-sample.component.html',
  styleUrls: ['./lineup-sample.component.scss'],
})
export class LineupSampleComponent implements OnInit {
  // Mock Data
  mockReports: MockReport[] = [];
  brands: string[] = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];
  retailers: string[] = ['Retail Chain A', 'Retail Chain B', 'Retail Chain C'];
  categories: string[] = ['Footwear', 'Apparel', 'Accessories'];

  // Filters
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ),
    end: new FormControl<Date | null>(new Date()),
  });
  brandFilter = new FormControl<string[]>([]);
  retailerFilter = new FormControl<string[]>([]);
  categoryFilter = new FormControl<string[]>([]);

  // Analysis Data
  posPerformanceData: PosPerformance[] = [];
  categoryPerformanceData: any[] = [];

  // Table Data
  displayedColumns: string[] = [
    'posName',
    'retailer',
    'lineupPlacement',
    'samplePlacement',
    'details',
  ];
  sortField: string = 'lineupPlacement';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Export State
  exportLoading = false;
  dataSource: PosDetail[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.mockReports = this.generateMockLineupReports();
    this.updateAnalysis();
  }

  generateMockLineupReports(): MockReport[] {
    const subcategories: Record<string, string[]> = {
      Footwear: ['Running', 'Casual', 'Athletic'],
      Apparel: ['T-Shirts', 'Jackets', 'Shorts'],
      Accessories: ['Bags', 'Hats', 'Socks'],
    };

    const reports: MockReport[] = [];
    const today = new Date();

    // Generate lineup definitions for each POS (5-15 products per POS)
    const posLineups: Record<string, string[]> = {};
    for (let i = 0; i < 15; i++) {
      const posId = `pos_${i}`;
      posLineups[posId] = [];
      const lineupSize = Math.floor(Math.random() * 10) + 5;

      for (let j = 0; j < lineupSize; j++) {
        const brand =
          this.brands[Math.floor(Math.random() * this.brands.length)];
        posLineups[posId].push(`SKU-${brand}-${1000 + j}`);
      }
    }

    // Generate reports (3-8 per POS)
    for (let i = 0; i < 100; i++) {
      const posId = `pos_${i % 15}`;
      const posName = `Store ${(i % 15) + 1}`;
      const retailer =
        this.retailers[Math.floor(Math.random() * this.retailers.length)];
      const category =
        this.categories[Math.floor(Math.random() * this.categories.length)];
      const subcategory =
        subcategories[category][
          Math.floor(Math.random() * subcategories[category].length)
        ];

      // Create dates within last 90 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90));

      // Generate 3-8 tasks per report (mix of lineup and non-lineup products)
      const tasks: LineupTask[] = [];
      const taskCount = Math.floor(Math.random() * 5) + 3;
      const lineupProducts = [...posLineups[posId]];

      for (let j = 0; j < taskCount; j++) {
        const brand =
          this.brands[Math.floor(Math.random() * this.brands.length)];
        const isInLineup = Math.random() > 0.5 && lineupProducts.length > 0;
        let sku: string;

        if (isInLineup) {
          sku = lineupProducts.pop()!;
        } else {
          sku = `SKU-${brand}-${Math.floor(2000 + Math.random() * 8000)}`;
        }

        tasks.push({
          type: 'Lineup',
          product: {
            sku: sku,
            brand: brand,
            category: category,
            subcategory: subcategory,
          },
          isInLineup: isInLineup,
          isReported: Math.random() > 0.3, // 70% chance of being reported
        });
      }

      reports.push({
        id: `lineup_rep_${i}`,
        user: {
          id: `user_${i % 5}`,
          name: `Promoter ${['A', 'B', 'C', 'D', 'E'][i % 5]}`,
        },
        pos: {
          id: posId,
          name: posName,
          retailer: retailer,
        },
        date: date,
        tasks: tasks,
      });
    }

    return reports;
  }

  updateAnalysis(): void {
    const filtered = this.applyFilters();
    this.calculatePosPerformance(filtered);
    this.calculateCategoryPerformance(filtered);
  }

  calculatePosPerformance(reports: MockReport[]): void {
    const posMap = new Map<string, PosPerformance>();

    // First pass: count lineup sizes per POS
    reports.forEach((report) => {
      if (!posMap.has(report.pos.id)) {
        posMap.set(report.pos.id, {
          posId: report.pos.id,
          posName: report.pos.name,
          retailer: report.pos.retailer,
          totalLineup: 0,
          reportedLineup: 0,
          totalReported: 0,
          lineupPlacement: 0,
          samplePlacement: 0,
        });
      }
    });

    // Second pass: calculate metrics
    reports.forEach((report) => {
      const performance = posMap.get(report.pos.id)!;
      const lineupTasks = report.tasks.filter((t) => t.isInLineup);
      const reportedTasks = report.tasks.filter((t) => t.isReported);

      performance.totalLineup += lineupTasks.length;
      performance.reportedLineup += lineupTasks.filter(
        (t) => t.isReported
      ).length;
      performance.totalReported += reportedTasks.length;
    });

    // Calculate percentages
    this.posPerformanceData = Array.from(posMap.values())
      .map((pos) => {
        return {
          ...pos,
          lineupPlacement:
            pos.totalLineup > 0
              ? parseFloat(
                  ((pos.reportedLineup / pos.totalLineup) * 100).toFixed(1)
                )
              : 0,
          samplePlacement:
            pos.totalLineup > 0
              ? parseFloat(
                  ((pos.totalReported / pos.totalLineup) * 100).toFixed(1)
                )
              : 0,
        };
      })
      .sort(this.sortPerformanceData.bind(this));
  }

  calculateCategoryPerformance(reports: MockReport[]): void {
    const categoryMap = new Map<string, { lineup: number; reported: number }>();

    reports.forEach((report) => {
      report.tasks.forEach((task) => {
        if (!task.isInLineup) return;

        const current = categoryMap.get(task.product.category) || {
          lineup: 0,
          reported: 0,
        };
        categoryMap.set(task.product.category, {
          lineup: current.lineup + 1,
          reported: current.reported + (task.isReported ? 1 : 0),
        });
      });
    });

    this.categoryPerformanceData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        name: category,
        value: parseFloat(((data.reported / data.lineup) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }

  sortPerformanceData(a: PosPerformance, b: PosPerformance): number {
    const modifier = this.sortDirection === 'asc' ? 1 : -1;

    switch (this.sortField) {
      case 'lineupPlacement':
        return (a.lineupPlacement - b.lineupPlacement) * modifier;
      case 'samplePlacement':
        return (a.samplePlacement - b.samplePlacement) * modifier;
      case 'posName':
        return a.posName.localeCompare(b.posName) * modifier;
      default:
        return 0;
    }
  }

  sortData(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }

    this.posPerformanceData.sort(this.sortPerformanceData.bind(this));
  }

  applyFilters(): MockReport[] {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    const selectedBrands = this.brandFilter.value || [];
    const selectedRetailers = this.retailerFilter.value || [];
    const selectedCategories = this.categoryFilter.value || [];

    return this.mockReports.filter((report) => {
      // Date filter
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;

      // Retailer filter
      if (
        selectedRetailers.length > 0 &&
        !selectedRetailers.includes(report.pos.retailer)
      ) {
        return false;
      }

      // Check if any task matches brand/category filters
      const hasMatchingTask = report.tasks.some((task) => {
        const brandMatch =
          selectedBrands.length === 0 ||
          selectedBrands.includes(task.product.brand);
        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.includes(task.product.category);

        return brandMatch && categoryMatch;
      });

      return hasMatchingTask;
    });
  }

  async exportData(): Promise<void> {
    this.exportLoading = true;

    try {
      const exportData = this.posPerformanceData.map((item) => ({
        Store: item.posName,
        Retailer: item.retailer,
        'Lineup Placement (%)': item.lineupPlacement,
        'Sample Placement (%)': item.samplePlacement,
        'Expected Products': item.totalLineup,
        'Reported Products': item.totalReported,
        'Correctly Placed': item.reportedLineup,
      }));

      this.downloadCSV(exportData, 'lineup-performance.csv');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.exportLoading = false;
    }
  }

  private downloadCSV(data: any[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lineup Performance');
    XLSX.writeFile(wb, filename);
  }

  getPlacementColor(value: number): string {
    if (value >= 80) return 'green';
    if (value >= 50) return 'orange';
    return 'red';
  }

  getBoxChartData(): any[] {
    if (this.posPerformanceData.length === 0) return [];

    // Calculate quartiles for lineup placement
    const values = this.posPerformanceData
      .map((p) => p.lineupPlacement)
      .sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const median = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const min = values[0];
    const max = values[values.length - 1];

    return [
      {
        name: 'Lineup Placement',
        series: [
          { name: 'min', value: min },
          { name: 'Q1', value: q1 },
          { name: 'median', value: median },
          { name: 'Q3', value: q3 },
          { name: 'max', value: max },
        ],
      },
    ];
  }

  viewPosDetails(posId: string): void {
    const posReports = this.mockReports.filter(r => r.pos.id === posId);
  
    this.dialog.open(PosDetailsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        posId: posId,
        reports: posReports
      }
    });
  }
}
