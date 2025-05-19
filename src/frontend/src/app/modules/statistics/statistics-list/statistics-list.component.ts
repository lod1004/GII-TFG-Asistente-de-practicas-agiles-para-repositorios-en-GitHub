import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-statistics-list',
  imports: [CommonModule, MaterialModule],
  templateUrl: './statistics-list.component.html',
  styleUrl: './statistics-list.component.css',
  standalone: true
})
export class StatisticsListComponent {
  @Input() repo: any;
  @Input() comparisonRepo: any = null;

  isBetter(current: number, compared: number, higherIsBetter = true): boolean {
    if (compared === null || compared === undefined) return true;
    return higherIsBetter ? current > compared : current < compared;
  }

  isWorse(current: number, compared: number, higherIsBetter = true): boolean {
    if (compared === null || compared === undefined) return false;
    return higherIsBetter ? current < compared : current > compared;
  }

  equals(current: number, compared: number): boolean {
    if (compared === null || compared === undefined) return false;
    return current == compared;
  }

  getStatColor(current: number, compared: number, higherIsBetter = true): string {
    if (this.isBetter(current, compared, higherIsBetter)) return '#8BC34A';
    if (this.isWorse(current, compared, higherIsBetter)) return '#F44336';
    if (this.equals(current, compared)) return '#FFFFFF';
    return '#CCCCCC';
  }
}