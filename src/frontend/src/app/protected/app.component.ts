import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Asistente de prácticas ágiles para repositorios en GitHub';

  constructor(public router: Router, private translocoService: TranslocoService) {
    const savedLang = localStorage.getItem('languageCode');
    if (savedLang) {
      this.translocoService.setActiveLang(savedLang);
    }
  }
}
