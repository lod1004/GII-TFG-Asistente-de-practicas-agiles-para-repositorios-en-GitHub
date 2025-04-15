import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RepositoryService } from '../../../services/repository.service';

@Component({
  standalone: false,
  selector: 'app-repository-input',
  templateUrl: './repository-input.component.html',
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
