import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  authSuccess = false;

  constructor(private authService: AuthService, private translocoService: TranslocoService) {}

  onPasswordChange(data: { username: string; password: string; repeatPassword: string }) {
    let payload;
    payload = {
      username: data.username,
      oldPassword: data.password,
      repeatPassword: data.repeatPassword
    };
    this.authService.changePassword(payload)
      .subscribe({
            next: (res) => {
              this.authSuccess = true;
              localStorage.setItem('loggedUser', data.username);
              Swal.fire({
                title: this.translocoService.translate('success.password_change_success'),
                text: this.translocoService.translate('success.password_change_success'),
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
