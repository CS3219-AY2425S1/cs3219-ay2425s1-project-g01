import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CollaborativeEditorComponent } from "../code-editor/collaborative-editor/collaborative-editor.component";
import { CollabService } from '../services/collab.service';
import { WebSocketService as EditorWebSocketService } from '../services/code-websocket.service';  // WebSocket service for the editor
import { WebSocketService as ChatWebSocketService } from '../services/chat-websocket.service';  // WebSocket service for the chat
import { Question } from '../app/models/question.model';
import { SessionResponse } from '../app/models/session.model';
import { Subscription } from 'rxjs';
import { ChatComponent } from '../chat-feature/chat/chat.component';

@Component({
  selector: 'app-collab-page',
  standalone: true,
  imports: [SidebarComponent, CollaborativeEditorComponent, ChatComponent, CommonModule],
  templateUrl: './collab-page.component.html',
  styleUrl: './collab-page.component.css'
})
export class CollabPageComponent implements OnInit, OnDestroy {
  sessionId!: string;
  userId!: string;
  currentUser!: string;
  question!: Question;
  username!: string;
  pairedUsername!: string;
  docId!: string;
  private routeSubscription!: Subscription;
  private sessionSubscription!: Subscription;
  showChat: boolean = false;



  @ViewChild(CollaborativeEditorComponent) editor!: CollaborativeEditorComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private collabService: CollabService,
    private editorWebSocketService: EditorWebSocketService,  // Inject WebSocketService for code editor
    private chatWebSocketService: ChatWebSocketService  // Inject WebSocketService for chat
  ) {}

  ngOnInit(): void {
    // Get session ID from route parameters
    this.routeSubscription = this.route.params.subscribe(params => {
      this.sessionId = params['sessionId'];

      this.getCurrUser();

      this.userId = this.route.snapshot.queryParamMap.get('userId') || '';

      console.log('Entering editor');
      // Connect to the code editor WebSocket service
      this.fetchSessionData().then(() => {
        this.editorWebSocketService.connect(this.sessionId, this.userId, this.currentUser);  // Connect editor WebSocket here
        this.listenForEditorMessages();
      });


      console.log('Entering chat');
      // Connect to the chat WebSocket service
      this.chatWebSocketService.connect(this.sessionId, this.userId);
    });
  }

  private listenForEditorMessages(): void {
    this.editorWebSocketService.getMessages().subscribe(message => {
      if (message && this.editor) {
        this.editor.handleWebSocketMessage(message);  // Pass messages to the editor component
      }
    });
  }


  fetchSessionData(): Promise<void> {
    console.log("CURRENTLY AT BEFORE FETCHING QUESTION");
    return new Promise((resolve, reject) => {
      this.sessionSubscription = this.collabService.getSession(this.sessionId).subscribe(
        (session: SessionResponse) => {
          console.log("SESSION: ", session);
          if (session && session.question) {
            this.question = session.question;
            console.log("Fetched session question", this.question);
          }
          this.username = session.users.username1;
          this.pairedUsername = session.users.username2;

          this.docId = session.docId
          resolve(); // Resolve the promise when data is fetched
        },
        error => {
          console.error("Failed to fetch session data", error);
          reject(error); // Reject the promise on error
        }
      );
    });
  }

  canDeactivate(): boolean {
    if(confirm("You are about to leave page, are you sure?\n\nYour code will be saved.")) {
      this.editor.save()
      return true
    } else {
      return false
    }
  }

  openChat(): void {
    console.log('toggle chat')
    this.showChat = !this.showChat;  // Toggle chat visibility
  }

  // navigates back to landing page and disconnects websocket session
  endSession(): void {
    // Disconnect both WebSocket services
    this.editorWebSocketService.disconnect();
    this.chatWebSocketService.disconnect();
    this.router.navigate(['landing']);
  }

  getCurrUser() {
    const userData = (sessionStorage.getItem("userData") || '') as string
    if ( userData !== '') {
      this.currentUser = JSON.parse(userData).data.username
    }
  }

  getCurrUserReturn() {
    const userData = (sessionStorage.getItem("userData") || '') as string
    if ( userData !== '') {
      return this.currentUser = JSON.parse(userData).data.username
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from route and session subscriptions
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }

    // Disconnect both WebSocket services
    this.editorWebSocketService.disconnect();
    this.chatWebSocketService.disconnect();
  }
}
