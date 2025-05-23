import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { ResultsComponent } from '../modules/results/results.component';
import { HeaderTabsComponent } from '../modules/shared/header/header-tabs/header-tabs.component';

const routes: Routes = [
  {
    path: 'start',
    component: RepositoryInputComponent,
  },
  {
    path: 'results',
    component: HeaderTabsComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'start'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
