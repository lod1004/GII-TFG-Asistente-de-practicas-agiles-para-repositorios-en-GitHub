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

  constructor(private repositoryService: RepositoryService) { }

  ngOnInit(): void {
    this.repositoryService.getRulesResults()
      .subscribe((res: any) => {
        this.rulesResults = res.rules;
      });
  }
}