import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryInputComponent } from '../modules/repository-input/repository-input.component';
import { HeaderTabsComponent } from '../modules/shared/header/header-tabs/header-tabs.component';
import { LoginComponent } from '../modules/auth/login/login.component';
import { RegisterComponent } from '../modules/auth/register/register.component';
import { NewPasswordComponent } from '../modules/auth/new-password/new-password.component';
import { AuthGuard } from '../guards/auth-guard.guard';

const routes: Routes = [
  {
    path: 'add-repositories',
    component: RepositoryInputComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'results',
    component: HeaderTabsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new-password',
    component: NewPasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
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
