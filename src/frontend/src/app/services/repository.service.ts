import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl = 'http://localhost:5000/api/repos'; 

  constructor(private http: HttpClient) {}

  sendRepositoryUrl(payload: { url: string }) {
    return this.http.post('http://localhost:5000/api/repos', payload);
  }
}
