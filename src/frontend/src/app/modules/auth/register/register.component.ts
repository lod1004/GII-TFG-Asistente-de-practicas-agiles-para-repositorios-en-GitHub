import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  authSuccess = false;

  constructor(private authService: AuthService, private translocoService: TranslocoService) { }

  onRegisterSubmit(data: { username: string; password: string; repeatPassword?: string }) {
    let payload;
    payload = {
      username: data.username,
      password: data.password
    };
    this.authService.register(payload).subscribe({
      next: (res) => {
        this.authSuccess = true;
        localStorage.setItem('loggedUser', data.username);
        localStorage.setItem('languageCode', 'es');
        Swal.fire({
          title: this.translocoService.translate('success.register_success'),
          text: this.translocoService.translate('success.register_success'),
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
          text: this.translocoService.translate('errors.username_duplicated_error'),
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
