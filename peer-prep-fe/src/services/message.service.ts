// message.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages: { userID: string; content: string; username: string  }[] = [];

  addMessage(message: { userID: string; content: string; username: string}) {
    this.messages.push(message);
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}