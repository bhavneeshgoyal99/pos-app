import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

interface PosDetail {
  sku: string;
  brand: string;
  category: string;
  expected: boolean;
  reported: boolean;
  status: string;
}

@Component({
  selector: 'app-pos-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule],
  templateUrl: './pos-details-dialog.component.html',
  styleUrls: ['./pos-details-dialog.component.scss']
})
export class PosDetailsDialogComponent {
  displayedColumns: string[] = ['sku', 'brand', 'category', 'status'];
  dataSource: PosDetail[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    posId: string;
    reports: any[];
  }) {
    this.prepareDataSource();
  }

  prepareDataSource(): void {
    const productMap = new Map<string, PosDetail>();
    
    this.data.reports.forEach(report => {
      report.tasks.forEach((task: any) => {
        if (!productMap.has(task.product.sku)) {
          productMap.set(task.product.sku, {
            sku: task.product.sku,
            brand: task.product.brand,
            category: task.product.category,
            expected: task.isInLineup,
            reported: task.isReported,
            status: this.getStatus(task.isInLineup, task.isReported)
          });
        }
      });
    });
    
    this.dataSource = Array.from(productMap.values());
  }

  getStatus(expected: boolean, reported: boolean): string {
    if (expected && reported) return 'Correctly Placed';
    if (expected && !reported) return 'Missing';
    if (!expected && reported) return 'Unexpected';
    return 'Not Applicable';
  }
}