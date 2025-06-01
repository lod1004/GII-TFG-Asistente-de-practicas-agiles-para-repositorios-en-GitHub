import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RepositoryService } from '../../services/repository.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-repository-input',
  styleUrl: 'repository-input.component.css',
  templateUrl: './repository-input.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, HttpClientModule]
})
export class RepositoryInputComponent implements OnInit {
  repositoryForm = new FormGroup({
    mainRepositoryUrl: new FormControl<string>(''),
    sourceRepositoryUrl: new FormControl<string>(''),
    useTimeIntervals: new FormControl<boolean>(false),
    useRelativeDates: new FormControl<boolean>(false),
    averageDays: new FormControl<number>(15),
    startTimeInterval: new FormControl<number>(0),
    endTimeInterval: new FormControl<number>(0),
  });

  mainUrl: string | null = null;
  exampleUrls: string[] = [];

  loading: boolean = false;
  loadingMessage: string = '';

  constructor(
    private repoService: RepositoryService,
    private router: Router,
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

  get daysNumberError(): boolean {
    const days = this.repositoryForm.controls.averageDays?.value;
    return days != null && days < 1;
  }

  get relativeTimeIntervalsError(): boolean {
    const useRelative = this.repositoryForm.controls.useRelativeDates?.value;
    const endInterval = this.repositoryForm.controls.endTimeInterval?.value;
    return useRelative === true && endInterval != null && endInterval >= 5;
  }

  get timeIntervalsComparisonError(): boolean {
    const startInterval = this.repositoryForm.controls.startTimeInterval?.value;
    const endInterval = this.repositoryForm.controls.endTimeInterval?.value;
    if (startInterval != null || endInterval != null) {
      if (startInterval! >= endInterval!) {
        return true;
      }
    }
    return false
  }

  get timeIntervalsValueError(): boolean {
    const startInterval = this.repositoryForm.controls.startTimeInterval?.value;
    const endInterval = this.repositoryForm.controls.endTimeInterval?.value;
    if (startInterval == null || endInterval == null
      || startInterval < 0 || !Number.isInteger(startInterval)
      || endInterval < 0 || !Number.isInteger(endInterval)) {
      return true;
    } else { return false }
  }

  submitRepo(): void {
    const main = this.mainUrl!;
    const examples = this.exampleUrls;

    this.repoService.checkUrls({ main, examples }).subscribe({
      next: (checkRes) => {
        if (checkRes.success) {
          this.proceedWithAnalysis();
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo acceder a los repositorios. Verifique sus URLs y asegúrese de que existen y son públicos.',
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo',
            customClass: {
              confirmButton: 'custom-error-button'
            }
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al verificar las URLs.',
          text: 'No se pudo acceder a los repositorios. Verifique sus URLs y asegúrese de que existen y son públicos.',
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo',
          customClass: {
            confirmButton: 'custom-error-button'
          }
        });
      }
    });
  }


  proceedWithAnalysis(): void {
    let payload;
    const username = localStorage.getItem('loggedUser');

    if (this.repositoryForm.controls.useTimeIntervals?.value === true) {
      payload = {
        main: this.mainUrl!,
        examples: this.exampleUrls,
        useRelativeDates: this.repositoryForm.controls.useRelativeDates.value,
        averageDays: this.repositoryForm.controls.averageDays.value,
        startTimeInterval: this.repositoryForm.controls.startTimeInterval.value,
        endTimeInterval: this.repositoryForm.controls.endTimeInterval.value,
        username
      };
    } else {
      payload = {
        main: this.mainUrl!,
        examples: this.exampleUrls,
        useRelativeDates: true,
        averageDays: this.repositoryForm.controls.averageDays.value,
        startTimeInterval: 0,
        endTimeInterval: 4,
        username
      };
    }

    this.loading = true;
    this.loadingMessage = 'Preparando análisis...';

    let delay = 1000;
    const spinnerPhases = ['Commits', 'Commits', 'Issues', 'Issues', 'Issues', 'Pull Requests', 'Releases', 'Workflows'];

    [this.mainUrl!, ...this.exampleUrls].forEach(repo => {
      spinnerPhases.forEach(phase => {
        setTimeout(() => {
          this.loadingMessage = `Analizando ${phase} de ${repo}...`;
        }, delay);
        delay += 1600;
      });
    });

    setTimeout(() => {
      this.loadingMessage = 'Generando métricas de calidad de proceso...';
    }, delay);

    setTimeout(() => {
      this.loadingMessage = 'Evaluando prácticas ágiles';
    }, delay + 1000);

    this.repoService.sendRepositoryUrls(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['results']);
      },
      error: (err) => {
        console.error('Error al enviar las URLs:', err);
        this.loading = false;
      }
    });
  }

}