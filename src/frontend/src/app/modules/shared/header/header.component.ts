import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../material.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  username: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('loggedUser');
  }

  logout(): void {
    Swal.fire({
      title: "¿Seguro que quieres cerrar sesión?",
      showDenyButton: true,
      denyButtonText: `No, volver`,
      confirmButtonText: "Sí, cerrar sesion",
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
}
