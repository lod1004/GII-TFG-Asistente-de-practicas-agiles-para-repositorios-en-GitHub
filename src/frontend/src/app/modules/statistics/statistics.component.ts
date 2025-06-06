import { Component, OnInit } from '@angular/core';
import { RepositoryService } from '../../services/repository.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../protected/material.module';
import { StatisticsListComponent } from './statistics-list/statistics-list.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-statistics',
  imports: [CommonModule, MaterialModule, TranslocoModule, StatisticsListComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {

  mainRepository: any;
  comparisonRepositories: any[] = [];
  repoIndex: number = 0;
  loading: boolean = false;

  constructor(private repositoryService: RepositoryService) { }

  ngOnInit(): void {
    this.loading = true;
    this.repositoryService.getRepositories()
      .subscribe((res: any[]) => {
        this.loading = false;
        this.mainRepository = res.find(repo => repo.isMain);
        this.comparisonRepositories = res.filter(repo => !repo.isMain);
      })
  }

  get showedRepo() {
    return this.comparisonRepositories[this.repoIndex];
  }

  nextRepo() {
    if (this.repoIndex < this.comparisonRepositories.length - 1) {
      this.repoIndex++;
    }
  }

  prevRepo() {
    if (this.repoIndex > 0) {
      this.repoIndex--;
    }
  }

}
