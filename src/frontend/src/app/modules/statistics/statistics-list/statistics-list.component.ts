import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-statistics-list',
  imports: [CommonModule, MaterialModule],
  templateUrl: './statistics-list.component.html',
  styleUrl: './statistics-list.component.css'
})
export class StatisticsListComponent {
  @Input() repo: any;
}
