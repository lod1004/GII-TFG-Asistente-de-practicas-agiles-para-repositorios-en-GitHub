import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [StartPageComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authSuccess = false;

  constructor(private authService: AuthService) { }

  onLoginSubmit(data: { username: string; password: string }) {
    console.log('Datos recibidos en Login:', data);

    const payload = {
      username: data.username,
      password: data.password,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.authSuccess = true;
        localStorage.setItem('loggedUser', data.username);
        Swal.fire({
          title: 'Sesión iniciada',
          text: 'Sesión iniciada correctamente.',
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
