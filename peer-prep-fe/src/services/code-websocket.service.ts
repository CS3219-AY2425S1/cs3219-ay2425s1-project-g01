import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;

  constructor() {}

  isProduction(): boolean {
    return window.location.hostname !== 'localhost';
  }

  connect(sessionId: string, userId: string): void {
    if (this.socket$) {
      this.disconnect();
    }

    this.socket$ = this.isProduction() 
    ? webSocket(`wss://peer-prep-gateway-1093398872288.asia-southeast1.run.app/websocket/${sessionId}?userID=${userId}`)
    : webSocket(`ws://localhost:8081/${sessionId}?userID=${userId}`);

  }

  sendMessage(message: any): void {
    this.socket$.next(message);
  }

  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
