import {Injectable} from "@angular/core";
import {WebSocketSubject} from "rxjs/webSocket";
import {Observable, Subject} from "rxjs";

interface WebSocketMessage {
  type: string;
  sessionId: string;
  canceledBy?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private bothAcceptedSubject = new Subject<void>();
  private userCanceledSubject = new Subject<string>();

  connect(sessionId: string, userId: string): void {
    if (this.socket$ && !this.socket$.closed) {
      console.warn("WebSocket already connected. Disconnecting and reconnecting.");
      this.disconnect(); // Ensure any previous connection is cleared
    }

    this.socket$ = new WebSocketSubject(`ws://localhost:8083`);
    this.socket$.subscribe(
      (message) => {
        console.log('Message received from server:', message);
        this.handleMessage(message);
      },
      (err) => console.error('WebSocket error:', err),
      () => console.log('WebSocket connection closed')
    );

    console.log(`WebSocket connection opened for session: ${sessionId}, user: ${userId}`);
  }

  sendAccept(sessionId: string, userId: string) {
    if (this.socket$) {
      console.log('Sending accept message:', { type: 'accept', sessionId, userId });
      this.socket$.next({type: 'accept', sessionId, userId });
    }
  }

  sendCancel(sessionId: string, userId: string) {
    if (this.socket$) {
      console.log('Sending cancel message:', { type: 'cancel', sessionId, userId });
      this.socket$.next({type: 'cancel', sessionId, userId});
    }
  }

  onBothAccepted(): Observable<void> {
    return this.bothAcceptedSubject.asObservable();
  }

  onUserCanceled(): Observable<string> {
    return this.userCanceledSubject.asObservable();
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'bothAccepted':
        console.log("handled Accepted");
        this.bothAcceptedSubject.next();
        break;
      case 'userCanceled':
        this.userCanceledSubject.next(message.canceledBy || '');
        break;
      default:
        console.log('Unknown message type:', message);
    }
  }

  disconnect(): void {
    if (this.socket$) {
      console.log('Disconnecting WebSocket');
      this.socket$.complete();
    }
    this.bothAcceptedSubject = new Subject<void>();
    this.userCanceledSubject = new Subject<string>();
  }
}
