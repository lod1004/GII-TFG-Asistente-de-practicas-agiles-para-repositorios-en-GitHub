import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authSuccess = false;

  constructor(
    private authService: AuthService
  ) { }

  onLoginSubmit(data: { username: string; password: string }) {
    const payload = { username: data.username, password: data.password };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.authSuccess = true;
        this.authService.saveLoginData(data.username, res.languageCode);
        this.authService.showSuccess('messages.login', 'success.login_success');
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.authService.showError('errors.error', 'errors.username_password_error');
      }
    });
  }
}
