import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';

const routes: Routes = [
  {
    path: 'add-repositories',
    component: RepositoryInputComponent,
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
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
