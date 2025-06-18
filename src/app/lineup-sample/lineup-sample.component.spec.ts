import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineupSampleComponent } from './lineup-sample.component';

describe('LineupSampleComponent', () => {
  let component: LineupSampleComponent;
  let fixture: ComponentFixture<LineupSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineupSampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineupSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
