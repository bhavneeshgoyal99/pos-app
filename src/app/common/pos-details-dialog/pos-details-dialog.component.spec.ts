import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosDetailsDialogComponent } from './pos-details-dialog.component';

describe('PosDetailsDialogComponent', () => {
  let component: PosDetailsDialogComponent;
  let fixture: ComponentFixture<PosDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
