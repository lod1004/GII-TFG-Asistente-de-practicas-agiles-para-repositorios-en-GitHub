import { Component } from '@angular/core';
import { ResultsComponent } from '../../../results/results.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../protected/material.module';
import { StatisticsListComponent } from '../../../statistics/statistics-list/statistics-list.component';
import { StatisticsComponent } from '../../../statistics/statistics.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-header-tabs',
  imports: [ResultsComponent, StatisticsComponent, TranslocoModule, CommonModule, MaterialModule],
  templateUrl: './header-tabs.component.html',
  styleUrl: './header-tabs.component.css'
})
export class HeaderTabsComponent {
  tab: string = 'rules'

}
