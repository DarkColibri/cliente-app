import { Injectable, EventEmitter } from '@angular/core';

// SERVICIO PARA MOSTRAR EL MODAL

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  modal: boolean = false;

  // EVENTOS
  // _ Para diferenciar el GET
  private _notificarUpload = new EventEmitter<any>();

  constructor() { }

  // GET FUCTION
  get notificarUpload(): EventEmitter<any> {
    return this._notificarUpload;
  }

  abrirModal() {
    this.modal = true;
  }

  cerrarModal() {
    this.modal = false;
  }
}
