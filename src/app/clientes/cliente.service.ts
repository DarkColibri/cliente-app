import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { Router } from '@angular/router';
import swal from 'sweetalert2';

// 
@Injectable()
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  constructor(
    private http: HttpClient, 
    private router: Router
  ) { }

  // GET REGIONES
  // GET http://localhost:8080/api/clientes/regiones
  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }

  // GET CLIENTE
  // GET http://localhost:8080/api/clientes/{id}
  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      // Tap() es void, no retorna nada. No modifica datos. No se modifica el flujo de datos.
      // response: Object
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
      }),
      // MAPEO
      // response: Object
      // Modificamos la response a Cliente[]
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          return cliente;
        });
        return response;
      }),
      // El response es un Cliente[], porque ha pasado por el map
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
      }));
  }

  // CREATE CLIENTE
  // POST http://localhost:8080/api/clientes/{id}
  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente)
      .pipe(
        // Obtiene respuesta del tipo <any> para hacerlo mas robuto
        map((response: any) => response.cliente as Cliente),
        catchError(e => {
          swal('Error al crear', e.error.mensaje, 'error')
          // ERROR DEL BACKEND
          if (e.status == 400) {
            return throwError(e);
          }
          if (e.error.mensaje) {
            console.error(e.error.mensaje);
          }
          return throwError(e);
        }));
  }

  // GET http://localhost:8080/api/clientes/{id}
  // Mostrar datos al formulario para editar.
  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      // COMPROBAMOS ERROR
      catchError(e => {
        console.log('===== ERROR ====');
        console.log(e);
        swal('Error al obtener el cliente', e.error.mensaje, 'error')
        if (e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  // PUT http://localhost:8080/api/clientes/{id}
  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      catchError(e => {

        if (e.status == 400) {
          return throwError(e);
        }
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  // DELETE http://localhost:8080/api/clientes/{id}
  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        swal('Error al borrar', e.error.mensaje, 'error')
        if (e.error.mensaje) {
          console.error(e.error.mensaje);
        }
        return throwError(e);
      }));
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }
}
