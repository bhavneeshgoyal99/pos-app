import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tma-photo-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './tma-photo-dialog.component.html',
  styleUrls: ['./tma-photo-dialog.component.scss']
})
export class TmaPhotoDialogComponent {
  currentIndex = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { photos: string[] }) {}

  nextPhoto(): void {
    this.currentIndex = (this.currentIndex + 1) % this.data.photos.length;
  }

  prevPhoto(): void {
    this.currentIndex = (this.currentIndex - 1 + this.data.photos.length) % this.data.photos.length;
  }
}