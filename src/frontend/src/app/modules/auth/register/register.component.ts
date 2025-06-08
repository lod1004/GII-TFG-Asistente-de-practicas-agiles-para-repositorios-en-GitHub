import { Component } from '@angular/core';
import { StartPageComponent } from '../start-page/start-page.component';
import { AuthService } from '../../../services/auth.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [StartPageComponent, TranslocoModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  authSuccess = false;

  constructor(
    private authService: AuthService
  ) { }

  onRegisterSubmit(data: { username: string; password: string }) {
    const payload = { username: data.username, password: data.password };

    this.authService.register(payload).subscribe({
      next: () => {
        this.authSuccess = true;
        this.authService.saveLoginData(data.username);
        this.authService.showSuccess('success.register_success', 'success.register_success');
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.authService.showError('errors.error', 'errors.username_duplicated_error');
      }
    });
  }
}
