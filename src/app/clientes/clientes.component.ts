import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { ModalService } from './detalle/modal.service';
import swal from 'sweetalert2';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginador: any;
  // Esto es para el MODAL
  clienteSeleccionado: Cliente;

  constructor(
    private clienteService: ClienteService,
    private modalService: ModalService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // OBSERVABLE
    // paramMap: Crea el observable, para que esté pendiente del cambio del objeto
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');

      if (!page) {
        page = 0;
      }

      // OBSERVABLE
      this.clienteService.getClientes(page)
        .pipe(
          tap(response => {
            console.log('ClientesComponent: tap 3');
            (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
          })
        // Metodo que hace que un Observable se ejecute.
        // Sin el subscribe, el observable no se va a ejecutar
        ).subscribe(response => {
          this.clientes = response.content as Cliente[];
          // PAGINADOR
          this.paginador = response;
        });
    });

    // OBSERVABLE
    // Pone a escuchar el EVENTO que obtiene el CLIENTE modificado.
    this.modalService.notificarUpload
    .subscribe(cliente => {
      // this.clientes.map() => Recorre la lista de clientes actual (la que tenemos).
      // y por cada clienteOriginal lo compara con el cliente del evento.
      // Si son iguales, lo cambia.
      // Y como hemos modificado la lista de clientes, lo asignamos tenemos que asignar otra vez.
      this.clientes = this.clientes.map(clienteOriginal => {
        if (cliente.id == clienteOriginal.id) {
          clienteOriginal.foto = cliente.foto;
        }
        return clienteOriginal;
      })
    })
  }

  delete(cliente: Cliente): void {
    swal({
      title: 'Está seguro?',
      text: `¿Seguro que desea eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.clienteService.delete(cliente.id).subscribe(
          () => {
            this.clientes = this.clientes.filter(cli => cli !== cliente)
            swal(
              'Cliente Eliminado!',
              `Cliente ${cliente.nombre} eliminado con éxito.`,
              'success'
            )
          }
        )

      }
    });
  }

  // ABRE MODAL CON EL CLIENTE SELECT
  // Cliente: es el cliente seleccionado
  abrirModal(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
  }

}
