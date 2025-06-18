import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandShareDashboardComponent } from './brand-share-dashboard.component';

describe('BrandShareDashboardComponent', () => {
  let component: BrandShareDashboardComponent;
  let fixture: ComponentFixture<BrandShareDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandShareDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandShareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
