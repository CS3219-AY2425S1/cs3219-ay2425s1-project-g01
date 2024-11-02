import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../websocket.service';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  templateUrl: './collaborative-editor.component.html',
  styleUrls: ['./collaborative-editor.component.css']
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {

  @Input() sessionId!: string;
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    paths: {
      vs: '/assets/monaco/min/vs' // Use the local path for Monaco assets
    }
  };
  code: string = '';
  private messageSubcription!: Subscription;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // Subscribe to messages from the WebSocket and update code in real-time

    this.webSocketService.connect(this.sessionId);

    this.webSocketService.getMessages().subscribe((message) => {
      if (message && message.type === 'code') {
        this.code = message.content; // Update the editor content with the received message
      }
    });
  }

  onEditorChange(content: string) {
    // Send updated content to the WebSocket server
    this.webSocketService.sendMessage({ type: 'code', content });
  }

  ngOnDestroy(): void {
      if (this.messageSubcription) {
          this.messageSubcription.unsubscribe();
      }
      this.webSocketService.disconnect();
  }
}
