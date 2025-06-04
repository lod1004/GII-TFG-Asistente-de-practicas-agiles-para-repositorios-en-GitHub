import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../material.module';
import Swal from 'sweetalert2';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialModule, TranslocoModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  username: string | null = null;
  languageCode: string = 'es';

  constructor(public router: Router, private translocoService: TranslocoService, private authService: AuthService) {
    this.languageCode = localStorage.getItem('languageCode')!;
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('loggedUser');
  }

  logout(): void {
    Swal.fire({
      title: this.translocoService.translate('messages.confirm_logout'),
      showDenyButton: true,
      denyButtonText: this.translocoService.translate('buttons.no_go_back'),
      confirmButtonText: this.translocoService.translate('buttons.confirm_logout'),
      reverseButtons: true,
      customClass: {
        confirmButton: 'custom-success-button',
        denyButton: 'custom-error-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('loggedUser');
        this.router.navigate(['/']);
      } else if (result.isDenied) {
      }
    });
  }

  goToNewPassword(): void {
    this.router.navigate(['/new-password']);
  }

  goBack(): void {
    this.router.navigate(['/add-repositories']);
  }

  changeLanguage(languageCode: string) {
    this.languageCode = languageCode;
    localStorage.setItem('languageCode', languageCode);
    this.translocoService.setActiveLang(languageCode);

    let payload;
    payload = {
      username: this.username!,
      languageCode: languageCode
    };
    this.authService.changeLanguage(payload)
      .subscribe({
        next: (res) => { }
      });
  }
}
