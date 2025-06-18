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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { TmaPhotoDialogComponent } from '../common/tma-photo-dialog/tma-photo-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormControl } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

import {TmaTask} from '../interfaces/TmaTask';
import {MockReportTma} from '../interfaces/MockReportTma';


@Component({
  selector: 'app-tma-dashboard',
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
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './tma-dashboard.component.html',
  styleUrls: ['./tma-dashboard.component.scss']
})
export class TmaDashboardComponent implements OnInit {
  // Mock Data
  mockReports: MockReportTma[] = [];
  eventTypes: string[] = ['Product Island', 'Competitor Comparison', 'Product Damage', 
                         'Special Display', 'Promotional Setup', 'Seasonal Display'];
  brands: string[] = ['Nike', 'Adidas', 'Puma', 'Reebok'];
  
  // Filters
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    end: new FormControl<Date | null>(new Date())
  });
  eventTypeFilter = new FormControl<string[]>([]);
  brandFilter = new FormControl<string[]>([]);
  
  // Table Data
  displayedColumns: string[] = ['select', 'eventType', 'product', 'pos', 'photos', 'actions'];
  dataSource: any[] = [];
  selection = new SelectionModel<any>(true, []);
  
  // Export State
  exportLoading = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.mockReports = this.generateMockTmaReports();
    this.updateTableData();
  }

  generateMockTmaReports(): MockReportTma[] {
    const categories = ['Footwear', 'Apparel', 'Accessories'];
    const mockPhotos = [
      'https://via.placeholder.com/300x200/5AA454/FFFFFF?text=Product+Island',
      'https://via.placeholder.com/300x200/A10A28/FFFFFF?text=Competitor',
      'https://via.placeholder.com/300x200/C7B42C/000000?text=Promo'
    ];
    
    const reports: MockReportTma[] = [];
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const eventType = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
      const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Create dates within last 90 days
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 90));
      
      // Generate 1-3 photos per report
      const photoCount = Math.floor(Math.random() * 3) + 1;
      const photos = Array.from({ length: photoCount }, () => 
        mockPhotos[Math.floor(Math.random() * mockPhotos.length)]);
      
      reports.push({
        id: `tma_rep_${i}`,
        user: { 
          id: `user_${i % 5}`, 
          name: `Promoter ${['A', 'B', 'C', 'D', 'E'][i % 5]}`
        },
        pos: { 
          id: `pos_${i % 15}`, 
          name: `Store ${i % 15 + 1}`,
          retailer: ['Retail Chain A', 'Retail Chain B'][i % 2]
        },
        date: date,
        tasks: [{
          type: 'TMA',
          product: {
            sku: `SKU-${brand.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
            brand: brand,
            category: category
          },
          eventType: eventType,
          photos: photos,
          notes: `Sample notes for ${eventType.toLowerCase()} activity`,
          timestamp: new Date(date.getTime() + Math.floor(Math.random() * 86400000))
        }]
      });
    }
    
    return reports;
  }

  updateTableData(): void {
    const filtered = this.applyFilters();
    this.dataSource = filtered.flatMap(report => 
      report.tasks.map(task => ({
        id: report.id,
        eventType: task.eventType,
        product: `${task.product.brand} - ${task.product.sku}`,
        pos: report.pos.name,
        retailer: report.pos.retailer,
        photos: task.photos,
        notes: task.notes,
        date: task.timestamp,
        report: report
      }))
    );
  }

  applyFilters(): MockReportTma[] {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    const selectedEventTypes = this.eventTypeFilter.value || [];
    const selectedBrands = this.brandFilter.value || [];
    
    return this.mockReports.filter(report => {
      // Date filter
      if (startDate && report.date < startDate) return false;
      if (endDate && report.date > endDate) return false;
      
      // Check if any task matches event type/brand filters
      return report.tasks.some(task => {
        const eventTypeMatch = selectedEventTypes.length === 0 || 
                             selectedEventTypes.includes(task.eventType);
        const brandMatch = selectedBrands.length === 0 || 
                         selectedBrands.includes(task.product.brand);
        
        return eventTypeMatch && brandMatch;
      });
    });
  }

  viewPhotos(photos: string[]): void {
    this.dialog.open(TmaPhotoDialogComponent, {
      width: '90vw',
      maxHeight: '90vh',
      data: { photos }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Toggle all rows */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }

  async exportSelected(format: 'CSV' | 'ZIP'): Promise<void> {
    this.exportLoading = true;
    
    try {
      const selectedItems = this.selection.selected;
      
      switch(format) {
        case 'CSV':
          this.exportToCsv(selectedItems);
          break;
          
        case 'ZIP':
          // In a real app, you would implement actual ZIP export
          console.log('ZIP export would be implemented here');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.exportLoading = false;
    }
  }

  private exportToCsv(items: any[]): void {
    const csvData = items.map(item => ({
      'Event Type': item.eventType,
      'Product': item.product,
      'Store': item.pos,
      'Retailer': item.retailer,
      'Date': item.date.toLocaleDateString(),
      'Photo Count': item.photos.length,
      'Notes': item.notes
    }));
    
    // Create CSV and download
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + csvData.map(row => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tma-activities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}