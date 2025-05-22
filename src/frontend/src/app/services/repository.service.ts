import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod'; 

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendRepositoryUrls(payload: { main: string; examples: string[], useRelativeDates:any, averageDays: any, startTimeInterval: any, endTimeInterval: any }) {
    return this.http.post(`${this.apiUrl}/repos`, payload);
  }

  getAllRepositories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/repos`);
  }

  getRulesResults(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rules`);
  }
}
