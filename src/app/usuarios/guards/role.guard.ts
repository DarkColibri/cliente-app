import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
// ===============
// GUARD POR ROLE
// ===============
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    // OBTIENE ROL a través del objeto ActivatedRouteSnapshot que recibimos como argumento.
    // Nos devuelve un objeto 'data' con un arreglo con parámetros, entre ellos el 'role'.
    let role = next.data['role'] as string;
    console.log('===== STATE ====')
    console.log(state);
    console.log('===== NEXT ====')
    console.log(next);
    console.log('ROLE = ' + role);
    // VALIDAMOS el ROL
    if (this.authService.hasRole(role)) {
      return true;
    }
    swal('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
    this.router.navigate(['/clientes']);
    return false;
  }
}
