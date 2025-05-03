import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = 'http://localhost:5000/api/repos'; 

  constructor(private http: HttpClient) {}

  sendRepositoryUrls(payload: { main: string; examples: string[], useRelativeDates:any, averageDays: any, startTimeInterval: any, endTimeInterval: any }) {
    return this.http.post('http://localhost:5000/api/repos', payload);
  }

  getAllRepositories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
