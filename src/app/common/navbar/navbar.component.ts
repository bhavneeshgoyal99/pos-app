import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navItems = [
    { path: '/reports/sales', icon: 'attach_money', label: 'Sales' },
    { path: '/reports/stock', icon: 'inventory_2', label: 'Stock' },
    { path: '/reports/lineup', icon: 'stacked_bar_chart', label: 'Lineup' },
    { path: '/reports/brands', icon: 'stacked_bar_chart', label: 'Brands' },
  ];

  userMenuItems = [
    { icon: 'settings', label: 'Settings' },
    { icon: 'logout', label: 'Logout' }
  ];
}