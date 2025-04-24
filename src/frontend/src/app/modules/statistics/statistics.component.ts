import { Component, OnInit } from '@angular/core';
import { RepositoryService } from '../../services/repository.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {

  mainRepository: any;
  comparisonRepositories: any[] = [];
  repoIndex: number = 0;

  constructor(private repositoryService: RepositoryService) { }

  ngOnInit(): void {
    this.repositoryService.getAllRepositories()
      .subscribe((res: any[]) => {
        console.log(res)
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
