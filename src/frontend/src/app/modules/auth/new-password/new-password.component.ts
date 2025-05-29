import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [StartPageComponent],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  authSuccess = false;

  constructor(private authService: AuthService) {}

  onPasswordChange(data: { username: string; password: string; repeatPassword: string }) {
    console.log('Datos recibidos para cambio de contraseña:', data);
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
                title: 'Contraseña actualizada',
                text: 'Contraseña actualizada',
                icon: 'success',
                confirmButtonText: 'Continuar',
                customClass: {
                  confirmButton: 'custom-success-button'
                }
              });
            },
            error: (err) => {
              console.error('Error en login:', err);
              Swal.fire({
                title: 'Error',
                text: 'Usuario o contraseña incorrectos.',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo',
                customClass: {
                  confirmButton: 'custom-error-button'
                }
              });
            }
          });
  }
}
