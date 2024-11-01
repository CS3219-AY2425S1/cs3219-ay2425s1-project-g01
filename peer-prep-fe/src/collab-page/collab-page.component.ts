import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import {CollaborativeEditorComponent} from "../code-editor/collaborative-editor/collaborative-editor.component";
import { CollabService } from '../services/collab.service';
import { WebSocketService } from '../code-editor/websocket.service';
import { Question } from '../app/models/question.model';
import { Session } from '../app/models/session.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collab-page',
  standalone: true,
  imports: [SidebarComponent, CollaborativeEditorComponent],
  templateUrl: './collab-page.component.html',
  styleUrl: './collab-page.component.css'
})
export class CollabPageComponent implements OnInit, OnDestroy {
  sessionId!: string;
  question!: Question;
  private routeSubscription!: Subscription;
  private sessionSubscription!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private collabService: CollabService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void { 
    // Get session ID from route parameters
    this.routeSubscription = this.route.params.subscribe(params => {
      this.sessionId = params['sessionId'];
      this.fetchSessionData();

      // Connect to editor
      this.webSocketService.connect(this.sessionId);
    })
  }


  fetchSessionData(): void {
    console.log("CURRENTLY AT BEFORE FETCHING QUESTION");
    this.sessionSubscription = this.collabService.getSession(this.sessionId).subscribe(
      (session: Session) => {
        if (session && session.question) {
          this.question = session.question;
          console.log("Fetched session question", this.question);
        }
      },
      error => {
        console.error("Failed to fetch session data", error);
        // this.endSession()
      }
    )
  }

  // navigates back to landing page and disconnects websocket session
  endSession(): void {
    this.webSocketService.disconnect();
    this.router.navigate(['landing']);
  }

  // endCollab(): void {
  //   this.collabService.endSession(this.sessionId).subscribe(
  // }

  ngOnDestroy(): void {
    // this.endSession();
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    } 
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

}

