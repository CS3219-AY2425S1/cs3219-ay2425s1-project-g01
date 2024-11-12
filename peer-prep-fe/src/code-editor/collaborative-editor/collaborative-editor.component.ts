import {ChangeDetectorRef, Component, Injectable, Input, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {WebSocketService} from '../../services/code-websocket.service';
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {Subscription} from 'rxjs';
import * as monaco from 'monaco-editor';
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import {format} from "prettier";
import {ActivatedRoute} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import { CollabService } from '../../services/collab.service';
import { HttpClientModule } from '@angular/common/http';

@Injectable({
  providedIn: "root"
})
@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule, NgForOf, NgIf, HttpClientModule],
  templateUrl: './collaborative-editor.component.html',
  styleUrls: ['./collaborative-editor.component.css']
})
export class CollaborativeEditorComponent implements OnDestroy {

  @Input() sessionId!: string;
  @Input() userId!: string;
  @Input() docId!: string;

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs/'
    },
    readOnly: false,
  };
  code: string = '';
  line: number = 1;
  column: number = 1;
  notifications: string[] = [];
  private messageSubscription!: Subscription;

  private editor!: monaco.editor.IStandaloneCodeEditor;

  isLocked: boolean = false;
  private typingTimeout: any;

  constructor(
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private collabService: CollabService
  ) {}

  public handleWebSocketMessage(message: any): void {
    if (message.type === 'initialCode') {
      this.code = message.content;
    } else if (message.type === 'code') {
      this.code = message.content;
    } else if (message.type === 'userConnected') {
      this.addNotification(`User ${message.userID} connected`);
    } else if (message.type === 'userDisconnected') {
      this.addNotification(`User ${message.userID} disconnected`);
    } else if (message.type === 'typingStarted') {
      if (message.userID !== this.userId) {
        this.addNotification(`User ${message.userID} is typing...`);
        this.isLocked = true;
        this.updateEditorLock();
      }
    } else if (message.type === 'typingEnded') {
      if (message.userID !== this.userId) {
        this.isLocked = false;
        this.updateEditorLock();
        this.clearNotification();
      }
    }
  }
  

  updateEditorLock() {
    this.editorOptions = { ...this.editorOptions, readOnly: this.isLocked };
    this.cdr.detectChanges();
  }

  addNotification(message: string) {
    this.notifications = [message];
    this.cdr.detectChanges();
  }

  clearNotification() {
    this.notifications = [];
    this.cdr.detectChanges();
  }

  onEditorChange(content: string) {
    if (!this.isLocked) {
      this.webSocketService.sendMessage({ type: 'code', content });

      // Send typing status messages
      this.webSocketService.sendMessage({ type: 'typingStarted', userID: this.userId });
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.webSocketService.sendMessage({ type: 'typingEnded', userID: this.userId });
      }, 2000); // Adjust the timeout as necessary
    }
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

  save(): void {
    this.collabService.saveSession(this.docId , this.code).subscribe((message) => console.log(message))
  }


  ngOnDestroy(): void {
      if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
      }
      clearTimeout(this.typingTimeout);
      this.webSocketService.disconnect();
  }
}
