import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { ResultsComponent } from '../modules/results/results.component';
import { HeaderTabsComponent } from '../modules/shared/header/header-tabs/header-tabs.component';
import { StartPageComponent } from '../modules/auth/start-page/start-page.component';
import { LoginComponent } from '../modules/auth/login/login.component';
import { RegisterComponent } from '../modules/auth/register/register.component';
import { NewPasswordComponent } from '../modules/auth/new-password/new-password.component';

const routes: Routes = [
  {
    path: 'add-repositories',
    component: RepositoryInputComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'new-password',
    component: NewPasswordComponent,
  },
  {
    path: 'results',
    component: HeaderTabsComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
