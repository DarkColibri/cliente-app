import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// INTERCEPTA UNA PETICION HTTP RESPONSE (A diferencia del 'TokenInterceptor', Aquí recivimos una RESPONSE)
// Ya automáticamente será llamado den cada REQUEST que realicemos
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  
  // INTERCEPT RESPONSE
  intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {

    // Cuando recibimos 'next.handle' VALIDAMOS los códigos HTTP 401 (unAuthorited) y 403 (token expired)
    // OBTENEMOS EL ERROR DE LA RESPONSE
    return next.handle(req).pipe(
      catchError(e => {
        if (e.status == 401) {
          if (this.authService.isAuthenticated()) {
            this.authService.logout();
          }
          this.router.navigate(['/login']);
        }

        if (e.status == 403) {
          swal('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
          this.router.navigate(['/clientes']);
        }
        return throwError(e);
      })
    );
  }
}
