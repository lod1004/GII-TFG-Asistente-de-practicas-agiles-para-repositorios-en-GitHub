import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidateTokenGuard } from '../guards/validate-token.guard';
import { CommonModule } from '@angular/common';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input/repository-input.component';

const routes: Routes = [
  {
    path: 'add-repositories',
    loadChildren: () => import ('../modules/repository-input/repository-input.module').then(m => m.RepositoryInputModule)
    // canActivate: [ValidateTokenGuard]
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'add-repositories'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {useHash: false})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
