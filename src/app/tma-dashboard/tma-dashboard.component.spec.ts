import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmaDashboardComponent } from './tma-dashboard.component';

describe('TmaDashboardComponent', () => {
  let component: TmaDashboardComponent;
  let fixture: ComponentFixture<TmaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmaDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
