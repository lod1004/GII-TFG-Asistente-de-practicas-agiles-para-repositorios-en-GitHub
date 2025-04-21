import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input/repository-input.component';

const routes: Routes = [
  {
    path: 'add-repositories',
    component: RepositoryInputComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'add-repositories'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
