import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
}
