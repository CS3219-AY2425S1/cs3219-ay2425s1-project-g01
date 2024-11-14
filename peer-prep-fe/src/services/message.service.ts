import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages: { userID: string; content: string; username: string  }[] = [];

  constructor() {
    const storedMessages = sessionStorage.getItem('chatMessages');
    this.messages = storedMessages ? JSON.parse(storedMessages) : [];
  }
  addMessage(message: { userID: string; content: string; username: string}) {
    this.messages.push(message);
    sessionStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
    sessionStorage.removeItem('chatMessages');
  }
}
