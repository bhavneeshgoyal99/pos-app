import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AuthenticatedLayoutComponent } from './layout/authenticated-layout/authenticated-layout.component';
import { StockStatusComponent } from './stock-status/stock-status.component';
import { LineupSampleComponent } from './lineup-sample/lineup-sample.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { TmaDashboardComponent } from './tma-dashboard/tma-dashboard.component';
import { BrandShareDashboardComponent } from './brand-share-dashboard/brand-share-dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  { 
    path: 'reports',
    component: AuthenticatedLayoutComponent,
    canActivate: [],
    children: [
      { path: 'sales', component: SalesReportComponent },
      { path: 'stock', component: StockStatusComponent },
      { path: 'lineup', component: LineupSampleComponent },
      { path: 'tma', component: TmaDashboardComponent },
      { path: 'brands', component: BrandShareDashboardComponent },
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: '' }
];
