import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CollaborativeEditorComponent } from "../code-editor/collaborative-editor/collaborative-editor.component";
import { CollabService } from '../services/collab.service';
import { WebSocketService as EditorWebSocketService } from '../code-editor/websocket.service';  // WebSocket service for the editor
import { WebSocketService as ChatWebSocketService } from '../chat-feature/websocket.service';  // WebSocket service for the chat
import { Question } from '../app/models/question.model';
import { Session } from '../app/models/session.model';
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
  userName!: string;
  question!: Question;
  username!: string;
  pairedUsername!: string;
  private routeSubscription!: Subscription;
  private sessionSubscription!: Subscription;
  showChat: boolean = false;

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

      this.userId = this.route.snapshot.queryParamMap.get('userId') || '';

      this.fetchSessionData();
      console.log('Entering code')

      // Connect to the code editor WebSocket service
      this.editorWebSocketService.connect(this.sessionId, this.userId);

      console.log('Entering chat')
      // Connect to the chat WebSocket service
      this.chatWebSocketService.connect(this.sessionId, this.userId);
    });
  }

  openChat(): void {
    console.log('toggle chat')
    this.showChat = !this.showChat;  // Toggle chat visibility
  }

  fetchSessionData(): void {
    console.log("CURRENTLY AT BEFORE FETCHING QUESTION");
    this.sessionSubscription = this.collabService.getSession(this.sessionId).subscribe(
      (session: Session) => {
        console.log("SESSION: ", session);
        this.question = session.question;
        console.log("Fetched session question", session.question);
        this.username = session.users.username1;
        console.log("username 1: ", this.username);
        this.pairedUsername = session.users.username2;
        console.log("username 2: ", this.pairedUsername);
      },
      error => {
        console.error("Failed to fetch session data", error);
        // this.endSession()
      }
    );
  }



  // navigates back to landing page and disconnects websocket session
  endSession(): void {
    // Disconnect both WebSocket services
    this.editorWebSocketService.disconnect();
    this.chatWebSocketService.disconnect();
    this.router.navigate(['landing']);
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
