import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmaPhotoDialogComponent } from './tma-photo-dialog.component';

describe('TmaPhotoDialogComponent', () => {
  let component: TmaPhotoDialogComponent;
  let fixture: ComponentFixture<TmaPhotoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmaPhotoDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmaPhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
