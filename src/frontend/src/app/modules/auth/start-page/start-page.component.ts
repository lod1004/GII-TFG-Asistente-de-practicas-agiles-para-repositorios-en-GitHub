import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MaterialModule } from '../../../protected/material.module';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, MaterialModule, RouterLink, ReactiveFormsModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent implements OnInit, OnChanges {
  @Input() isLogin = false;
  @Input() isRegistering = false;
  @Input() isChangingPassword = false;
  @Input() authSuccess: boolean = false;

  showPassword: boolean = false;
  showRepeatPassword: boolean = false;

  @Output() formSubmitted = new EventEmitter<{
    username: string;
    password: string;
    repeatPassword: string;
  }>();

  authForm!: FormGroup;

  languageCode: string = 'es';

  constructor(public router: Router, private fb: FormBuilder, private translocoService: TranslocoService) {
    this.languageCode = localStorage.getItem('languageCode')!;
  }

  ngOnInit(): void {
    const passwordSecurityPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/;

    this.authForm = this.fb.group({
      usernameCtrl: ['', Validators.required],
      passwordCtrl: ['', Validators.required],
      repeatPasswordCtrl: [
        '',
        this.isRegistering || this.isChangingPassword
          ? [Validators.required, Validators.pattern(passwordSecurityPattern)]
          : []
      ]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authSuccess'] && this.authSuccess === true) {
      this.router.navigate(['/add-repositories']);
    }
  }

  onSubmit(): void {
    const username = this.authForm.value.usernameCtrl;
    const password = this.authForm.value.passwordCtrl;
    const repeatPassword = this.authForm.value.repeatPasswordCtrl;

    if ((this.isRegistering) && password !== repeatPassword) {
      Swal.fire({
        title: this.translocoService.translate('errors.error'),
        text: this.translocoService.translate('errors.password_match_error'),
        icon: 'error',
        confirmButtonText: this.translocoService.translate('buttons.try_again'),
        customClass: {
          confirmButton: 'custom-error-button'
        }
      });
      return;
    }

    this.formSubmitted.emit({ username, password, repeatPassword });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRepeatPasswordVisibility() {
    this.showRepeatPassword = !this.showRepeatPassword;
  }
}
