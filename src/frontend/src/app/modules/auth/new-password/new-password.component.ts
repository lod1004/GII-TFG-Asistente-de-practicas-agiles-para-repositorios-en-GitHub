import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  authSuccess = false;

  constructor(
    private authService: AuthService
  ) {}

  onPasswordChange(data: { username: string; password: string; repeatPassword: string }) {
    const payload = {
      username: data.username,
      oldPassword: data.password,
      repeatPassword: data.repeatPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.authSuccess = true;
        this.authService.saveLoginData(data.username);
        this.authService.showSuccess('success.password_change_success', 'success.password_change_success');
      },
      error: (err) => {
        console.error('Error en cambio de contraseña:', err);
        this.authService.showError('errors.error', 'errors.username_password_error');
      }
    });
  }
}
