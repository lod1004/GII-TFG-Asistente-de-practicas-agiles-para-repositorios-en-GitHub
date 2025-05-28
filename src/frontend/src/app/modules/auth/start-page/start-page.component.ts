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

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent implements OnInit, OnChanges {
  @Input() isLogin = false;
  @Input() isRegistering = false;
  @Input() isChangingPassword = false;
  @Input() authSuccess: boolean = false;

  @Output() formSubmitted = new EventEmitter<{
    username: string;
    password: string;
    repeatPassword: string;
  }>();

  authForm!: FormGroup;

  constructor(public router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      usernameCtrl: ['', Validators.required],
      passwordCtrl: ['', Validators.required],
      repeatPasswordCtrl: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authSuccess'] && this.authSuccess === true) {
      this.router.navigate(['/add-repositories']);
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const username = this.authForm.value.usernameCtrl;
    const password = this.authForm.value.passwordCtrl;
    const repeatPassword = this.authForm.value.repeatPasswordCtrl;

    if ((this.isRegistering || this.isChangingPassword) && password !== repeatPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.formSubmitted.emit({ username, password, repeatPassword });
  }
}
