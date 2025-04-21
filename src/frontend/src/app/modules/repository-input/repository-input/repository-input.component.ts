import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RepositoryService } from '../../../services/repository.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-repository-input',
  templateUrl: './repository-input.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule]
})
export class RepositoryInputComponent implements OnInit {
  repositoryForm =new FormGroup({
    mainRepositoryUrl: new FormControl<string>(''),
  })

  constructor(
    private repoService: RepositoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {

  }

  submitRepo(): void {
    if (this.repositoryForm.valid) {
      const mainRepositoryUrl = this.repositoryForm.get('mainRepositoryUrl')?.value;
      this.repoService.sendRepositoryUrl({ url: mainRepositoryUrl! }).subscribe({
        next: (res) => {
          console.log('Enviado correctamente:', res);
        },
        error: (err) => {
          console.error('Error al enviar la url del repositorio:', err);
        }
      });
    } else {
      console.log('Formulario no válido');
    }
  }
}
