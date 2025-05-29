import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [StartPageComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  authSuccess = false;

  constructor(private authService: AuthService) { }

  onRegisterSubmit(data: { username: string; password: string; repeatPassword?: string }) {
    console.log('Datos recibidos en Registro:', data);
    let payload;
    payload = {
      username: data.username,
      password: data.password
    };
    this.authService.register(payload).subscribe({
      next: (res) => {
        this.authSuccess = true;
        localStorage.setItem('loggedUser', data.username);
        Swal.fire({
          title: 'Usuario registrado',
          text: 'Usuario registrado',
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
          text: 'Nombre de usuario no válido',
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
