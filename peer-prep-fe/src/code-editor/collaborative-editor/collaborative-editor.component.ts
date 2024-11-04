import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {WebSocketService} from '../websocket.service';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {Subscription} from 'rxjs';
import * as monaco from 'monaco-editor';
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import {format} from "prettier";
import {ActivatedRoute} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";


@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule, NgForOf, NgIf],
  templateUrl: './collaborative-editor.component.html',
  styleUrls: ['./collaborative-editor.component.css']
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {

  @Input() sessionId!: string;
  @Input() userId!: string;

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs/'
    }
  };
  code: string = '';
  line: number = 1;
  column: number = 1;
  notifications: string[] = [];
  private messageSubscription!: Subscription;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  constructor(
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Connect to WebSocket and subscribe to messages
    this.webSocketService.connect(this.sessionId, this.userId);

    this.messageSubscription = this.webSocketService.getMessages().subscribe((message) => {
      if (message) {
        if (message.type === 'initialCode') {
          this.code = message.content;
        } else if (message.type === 'code') {
          this.code = message.content;
        } else if (message.type === 'userConnected') {
          this.addNotification(`User ${message.userID} connected`);
        } else if (message.type === 'userDisconnected') {
          this.addNotification(`User ${message.userID} disconnected`);
        }
      }
    });
  }

  addNotification(message: string) {
    this.notifications.push(message);
    // Auto-remove notification after a few seconds
    setTimeout(() => {
      this.notifications.shift();
      this.cdr.detectChanges();
    }, 3000);
  }


  onEditorChange(content: string) {
    // Send updated content to the WebSocket server
    this.webSocketService.sendMessage({ type: 'code', content });
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;

    const updateCursorPosition = () => {
      const position = this.editor.getPosition();
      if (position) {
        this.line = position.lineNumber;
        this.column = position.column;
        this.cdr.detectChanges();
        console.log(`Updated Position - Line: ${this.line}, Column: ${this.column}`);
      }
    };

    // Listen to both cursor movement and content changes
    editor.onDidChangeCursorPosition(updateCursorPosition);
    editor.onDidChangeModelContent(updateCursorPosition);

    updateCursorPosition();
  }

  async formatCode() {
    if (this.editor) {
      try {
        this.code = await format(this.code, {
          parser: 'babel',
          plugins: [babelPlugin, estreePlugin],
          singleQuote: true,
          semi: true
        });
      } catch (error) {
        console.error('Error formatting code:', error);
      }
    }
  }

  ngOnDestroy(): void {
      if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
      }
      this.webSocketService.disconnect();
  }
}
