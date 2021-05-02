import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from './models/mensaje';
import { AuthService } from '../usuarios/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  // Es privado porque solo se va a usar el el chat, y no en las vistas
  private client: Client;
  conectado: boolean = false;
  username: string;
  mensaje: Mensaje = new Mensaje();
  mensajes: Mensaje[] = [];
  escribiendo: string;
  clienteId: string;

  constructor(private authService: AuthService) {
    this.clienteId = 'id-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2);
    this.username = authService.usuario.username;
    console.log(this.username)
  }

  ngOnInit() {
    this.client = new Client();

    this.client.webSocketFactory = () => {
      console.log('webSocketFactory')
      return new SockJS("http://localhost:8080/chat-websocket");
    }
    // EVENTO CUANDO SE CONECTA
    this.client.onConnect = (frame) => {
      console.log('Conectados: ' + this.client.connected + ' : ' + frame);
      this.conectado = true;
      // Nombre de evento donde envia los mensajes, 
      // e > donde vamos a estar escuchando, el evento.
      this.client.subscribe('/chat/mensaje', e => {
        let mensaje: Mensaje = JSON.parse(e.body) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha);

        if (!this.mensaje.color && mensaje.tipo == 'NUEVO_USUARIO' &&
          this.mensaje.username == this.username) {
          this.mensaje.color = mensaje.color;
        }

        this.mensajes.push(mensaje);
        console.log(mensaje);
      });

      this.client.subscribe('/chat/escribiendo', e => {
        this.escribiendo = e.body;
        setTimeout(() => this.escribiendo = '', 3000)
      });

      console.log(this.clienteId);
      this.client.subscribe('/chat/historial/' + this.clienteId, e => {
        const historial = JSON.parse(e.body) as Mensaje[];
        this.mensajes = historial.map(m => {
          m.fecha = new Date(m.fecha);
          return m;
        }).reverse();
      });

     this.client.publish({ destination: '/api/historial', body: this.clienteId });

      this.mensaje.tipo = 'NUEVO_USUARIO';
      this.client.publish({ destination: '/api/mensaje', body: JSON.stringify(this.mensaje) });
    }

    this.client.onDisconnect = (frame) => {
      console.log('Desconectados: ' + !this.client.connected + ' : ' + frame);
      this.conectado = false;
      this.mensaje = new Mensaje();
      this.mensajes = [];
    }
  }

  conectar(): void {
    this.client.activate();
  }

  desconectar(): void {
    this.client.deactivate();
  }

  enviarMensaje(): void {
    this.mensaje.tipo = 'MENSAJE';
    this.mensaje.username = this.username
    this.client.publish({ destination: '/api/mensaje', body: JSON.stringify(this.mensaje) });
    this.mensaje.texto = '';
  }

  escribiendoEvento(): void {
    this.client.publish({ destination: '/api/escribiendo', body: this.mensaje.username });
  }
}
