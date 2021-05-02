import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

// INTERCEPTA HTTP para obtyener TOKEN
// Ya automáticamente Será llamado den cada REQUEST que realicemos.
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    // OBTENEMOS EL TOKEN
    let token = this.authService.token;

    if (token != null) {
      // AÑADIMOS TOKEN A LA CABECERA HTTP REQUEST
      const authReq = req.clone({ // Clonamos porque es un observable y es inmutable. Por eso se clona
        headers: req.headers.set('Authorization', 'Bearer ' + token)
      });

      // PRÓXIMO INTERCEPTOR dentro del stack o conjunto de interceptores que tengamos hasta llegar al último.
      // Le pasamos nuestra REQUEST 
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
