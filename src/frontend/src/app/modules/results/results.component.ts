import { Component, OnInit } from '@angular/core';
import { RepositoryService } from '../../services/repository.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-results',
  imports: [CommonModule, MaterialModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit {
  rulesResults: any[] = [];
  loading: boolean = false;
  constructor(private repositoryService: RepositoryService) { }

  ngOnInit(): void {
    this.loading = true;
    this.repositoryService.getRulesResults()
      .subscribe((res: any) => {
        this.loading = false;
        this.rulesResults = res.rules;
      });
  }

  getProgressColor(rule: any): string {
    const ratio = rule.totalStats > 0 ? rule.statsBetter / rule.totalStats : 0;

    if (ratio >= 0.75) return ' #8bc34a';
    if (ratio >= 0.5) return '#ffc107';
    if (ratio >= 0.25) return ' #ff9800';
    return ' #f44336';
  }

  getProgressColorFromRatio(ratio: number): string {
    if (ratio >= 0.75) return ' #8bc34a';
    if (ratio >= 0.5) return ' #ffc107';
    if (ratio >= 0.25) return ' #ff9800';
    return ' #f44336';
  }
}