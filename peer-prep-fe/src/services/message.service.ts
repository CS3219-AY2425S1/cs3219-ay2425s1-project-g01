import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messages: { userID: string; content: string; }[] = [];

  constructor() {
    const storedMessages = localStorage.getItem('chatMessages');
    this.messages = storedMessages ? JSON.parse(storedMessages) : [];
  }

  addMessage(message: { userID: string; content: string; }) {
    this.messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
    localStorage.removeItem('chatMessages');
  }
}
