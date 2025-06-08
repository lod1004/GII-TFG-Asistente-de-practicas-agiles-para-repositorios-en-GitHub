import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private translocoService: TranslocoService) { }

  register(payload: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registerUser`, payload);
  }

  login(payload: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/loginUser`, payload);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedUser');
  }

  changePassword(payload: { username: string, oldPassword: string, repeatPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, payload);
  }

  changeLanguage(payload: { username: string, languageCode: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-language`, payload);
  }

    showSuccess(titleKey: string, textKey: string) {
    Swal.fire({
      title: this.translocoService.translate(titleKey),
      text: this.translocoService.translate(textKey),
      icon: 'success',
      confirmButtonText: this.translocoService.translate('buttons.continue'),
      customClass: {
        confirmButton: 'custom-success-button'
      }
    });
  }

  showError(titleKey: string, textKey: string) {
    Swal.fire({
      title: this.translocoService.translate(titleKey),
      text: this.translocoService.translate(textKey),
      icon: 'error',
      confirmButtonText: this.translocoService.translate('buttons.try_again'),
      customClass: {
        confirmButton: 'custom-error-button'
      }
    });
  }

  saveLoginData(username: string, languageCode = 'es') {
    localStorage.setItem('loggedUser', username);
    localStorage.setItem('languageCode', languageCode);
  }
}
