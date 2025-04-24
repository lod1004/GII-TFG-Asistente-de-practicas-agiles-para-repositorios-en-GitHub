import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RepositoryService } from '../../../services/repository.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repository-input',
  templateUrl: './repository-input.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule]
})
export class RepositoryInputComponent implements OnInit {
  repositoryForm = new FormGroup({
    mainRepositoryUrl: new FormControl<string>(''),
    sourceRepositoryUrl: new FormControl<string>(''),
  });

  mainUrl: string | null = null;
  exampleUrls: string[] = [];

  constructor(
    private repoService: RepositoryService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

  }

  addMainUrl(): void {
    const url = this.repositoryForm.get('mainRepositoryUrl')?.value?.trim();
    if (url) {
      this.mainUrl = url;
      this.repositoryForm.get('mainRepositoryUrl')?.reset();
    }
  }

  addExampleUrl(): void {
    const url = this.repositoryForm.get('sourceRepositoryUrl')?.value?.trim();
    if (url && this.exampleUrls.length < 5) {
      this.exampleUrls.push(url);
      this.repositoryForm.get('sourceRepositoryUrl')?.reset();
    }
  }

  removeExampleUrl(index: number): void {
    this.exampleUrls.splice(index, 1);
  }

  submitRepo(): void {
    if (!this.mainUrl || this.exampleUrls.length === 0) {
      console.log("Se necesita una URL principal y al menos una de ejemplo.");
      return;
    }

    const payload = {
      main: this.mainUrl,
      examples: this.exampleUrls
    };

    this.repoService.sendRepositoryUrls(payload).subscribe({
      next: (res) => {
        console.log('Enviado correctamente:', res);
        this.router.navigate(['statistics'])
      },
      error: (err) => console.error('Error al enviar las URLs:', err)
    });
  }
}
