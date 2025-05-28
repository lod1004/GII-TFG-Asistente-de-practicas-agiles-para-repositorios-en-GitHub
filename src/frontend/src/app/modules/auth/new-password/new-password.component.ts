import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [StartPageComponent],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {
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
      .subscribe(res => console.log(res))
  }
}
