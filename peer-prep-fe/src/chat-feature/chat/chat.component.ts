import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/chat-websocket.service'; 
import { MessageService } from '../../services/message.service';

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule, NgClass],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() sessionId!: string;
  @Input() userId!: string;
  @Input() matchedUser!: string;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: { userID: string; content: string; username: string}[] = [];
  newMessage: string = '';
  private messageSubscription!: Subscription;
  myUsername: string = '';
  otherUsername: string = '';
  
  // Load the ping sound
  private pingSound = new Audio('../assets/ping.mp3');
  private hasUserInteracted = false;

  constructor(
    private cdr: ChangeDetectorRef, 
    private webSocketService: WebSocketService,
    private messageService: MessageService
  ) {
    // Preload the ping sound so it's ready to play when needed
    this.pingSound.load();
  }

  ngOnInit(): void {
    console.log('INIT')
    this.messages = this.messageService.getMessages().slice();
    this.setMyUsername()
    this.webSocketService.connect(this.sessionId, this.userId);

    // Subscribe to incoming messages
    this.messageSubscription = this.webSocketService.getMessages().subscribe((message) => {
      if (message.type === 'chat') {
        const newMessage = { userID: message.userID, content: message.content, username: this.matchedUser };
        this.messages.push(newMessage);
        this.messageService.addMessage(newMessage);

        // Play the sound if the message is from another user
        if (message.userID !== this.userId) {
          this.playPingSound();
        }

        // Scroll to the bottom of the chat 
        this.scrollToBottom();

        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message = {
        type: 'chat',
        userID: this.userId,
        content: this.newMessage.trim(),
        username: this.myUsername
      };

      this.messages.push({ userID: this.userId, content: this.newMessage, username: this.myUsername});
      this.messageService.addMessage({ userID: this.userId, content: this.newMessage, username: this.myUsername});
 
      this.webSocketService.sendMessage(message);
      this.newMessage = ''; // Clear the input field
      
      this.cdr.detectChanges();
      this.scrollToBottom();
      
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
        try {
            this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error("Scroll error:", err);
        }
    }, 0); // Adding a short delay to allow rendering to complete
}


  private playPingSound(): void {
      this.pingSound.play().catch(error => console.error("Error playing sound:", error));
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  // Track user interaction
  onUserInteraction(): void {
    this.hasUserInteracted = true;
  }

  setMyUsername(): void {
    const userData = (sessionStorage.getItem("userData") || '') as string
    if ( userData !== '') {
      this.myUsername = JSON.parse(userData).data.username
    }
  }
}
