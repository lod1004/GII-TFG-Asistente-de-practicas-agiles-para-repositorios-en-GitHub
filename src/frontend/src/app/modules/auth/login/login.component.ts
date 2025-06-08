import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2'
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authSuccess = false;

  constructor(private authService: AuthService, private translocoService: TranslocoService) { }

  onLoginSubmit(data: { username: string; password: string }) {

    const payload = {
      username: data.username,
      password: data.password,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.authSuccess = true;
        localStorage.setItem('loggedUser', data.username);
        localStorage.setItem('languageCode', res.languageCode);
        Swal.fire({
          title: this.translocoService.translate('messages.login'),
          text: this.translocoService.translate('success.login_success'),
          icon: 'success',
          confirmButtonText: this.translocoService.translate('buttons.continue'),
          customClass: {
            confirmButton: 'custom-success-button'
          }
        });
      },
      error: (err) => {
        console.error('Error en login:', err);
        Swal.fire({
          title: this.translocoService.translate('errors.error'),
          text: this.translocoService.translate('errors.username_password_error'),
          icon: 'error',
          confirmButtonText: this.translocoService.translate('buttons.try_again'),
          customClass: {
            confirmButton: 'custom-error-button'
          }
        });
      }
    });
  }

}
