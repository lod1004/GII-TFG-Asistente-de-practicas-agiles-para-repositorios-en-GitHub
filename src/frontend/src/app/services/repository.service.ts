import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  checkUrls(payload: { main: string; examples: string[] }) {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/repos/check-urls`, payload);
  }

  sendRepositoryUrls(payload: { main: string; examples: string[], useRelativeDates: any, averageDays: any, startTimeInterval: any, endTimeInterval: any, username: any }) {
    return this.http.post(`${this.apiUrl}/repos`, payload);
  }

  getRepositories(): Observable<any> {
    const username: any = localStorage.getItem('loggedUser');
    return this.http.get(`${this.apiUrl}/repos`, {
      params: { username }
    });
  }

  getRulesResults(): Observable<any> {
    const username: any = localStorage.getItem('loggedUser');
    return this.http.get(`${this.apiUrl}/rules`, {
      params: { username }
    });
  }
}
