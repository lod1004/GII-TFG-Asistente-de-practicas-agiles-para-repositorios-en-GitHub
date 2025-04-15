import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Asegúrate de que ReactiveFormsModule esté aquí
import { HttpClientModule } from '@angular/common/http';
import { RepositoryInputComponent } from './repository-input/repository-input.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: RepositoryInputComponent,
  }
];

@NgModule({
  declarations: [RepositoryInputComponent],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,  
    RouterModule.forChild(routes),
    HttpClientModule
  ],
  exports: [RouterModule, RepositoryInputComponent]
})
export class RepositoryInputModule { }
