import {Component, Injectable, Input, OnInit} from '@angular/core';
import {interval, Subscription, take, timer} from 'rxjs';
import { NgClass, NgIf } from "@angular/common";
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchResponse } from '../../app/models/match.model';
import {UserService} from '../../app/userService/user-service';

@Component({
  selector: 'app-match-modal',
  templateUrl: './match-modal.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  styleUrls: ['./match-modal.component.css']
})

@Injectable({providedIn: 'root'})
export class MatchModalComponent implements OnInit {

  @Input() queueName: string = '';
  @Input() userId: string = '';
  @Input() category: string = '';
  @Input() difficulty: string = '';
  isVisible: boolean = true;
  isCounting: boolean = false;
  matchFound: boolean = false;
  timeout: boolean = false;
  displayMessage: string = 'Finding Suitable Match...';
  countdownSubscription: Subscription | undefined;
  matchCheckSubscription: Subscription | undefined;
  userData: any;
  myUsername: string = '';
  otherUsername: string = '';
  otherUserId: string = '';
  otherCategory: string = '';
  otherDifficulty: string = '';
  collabSessionId: string = '';

  countdownSeconds: number = 31;
  frontendTimeoutSubscription: Subscription | undefined;

  acceptCountdown: number = 10;
  acceptTimeoutSubscription: Subscription | undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private matchService: MatchService,
    private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    // Placeholder for component initialization if needed
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
      this.difficulty = params['difficulty'];
      this.userId = params['userId'];
      this.queueName = params['queueName'];
    });
    await this.setMyUsername();
    this.userData = {difficulty: this.difficulty, topic: this.category, user_id: this.userId, username: this.myUsername};
    console.log('userData', this.userData);
    this.findMatch();
  }

  async findMatch() {

    this.isVisible = true;
    this.isCounting = true;
    this.matchFound = false;
    this.timeout = false;
    this.displayMessage = 'Finding Suitable Match...';

    this.startFrontendCountdown();

    // response - MatchResponse structure, contains matchedUsers[2], sessionId, timeout
    const response = await this.matchService.sendMatchRequest(this.userData, this.queueName);


    console.log('RESPONSE FROM FINDMATCH ', response);
    console.log('TIMEOUT FROM FINDMATCH ', response.timeout);

    // TODO (in BE too): UI if matching process gets disrupted (e.g. rabbitmq server goes down) - avoid silent failures
    if (response.timeout) {
      this.clearFrontendTimeout();
      this.handleMatchResponseUi(response);
    } else {
      const isUser1 = response.matchedUsers[0].user_id === this.userId;
      this.otherCategory = isUser1 ? response.matchedUsers[1].topic : response.matchedUsers[0].topic;
      this.otherDifficulty = isUser1? response.matchedUsers[1].difficulty : response.matchedUsers[0].difficulty;
      this.otherUsername = isUser1 ? response.matchedUsers[1].username : response.matchedUsers[0].username;
      this.collabSessionId = response.sessionId;
      // console.log('otherUsername', this.otherUsername);
      this.clearFrontendTimeout();
      this.handleMatchResponseUi(response);
    }
  }

  startFrontendCountdown() {
    this.countdownSubscription = interval(1000)
      .pipe(take(this.countdownSeconds))
      .subscribe({
        next: () => this.countdownSeconds--,
        complete: () => this.onFrontendTimeout()
      });
    this.frontendTimeoutSubscription = timer(this.countdownSeconds * 1000).subscribe(() => {
      this.onFrontendTimeout();
    });
  }

  onFrontendTimeout() {
    if (!this.matchFound) {
      this.timeout = true;
      this.isCounting = false;
      this.displayMessage = 'No matches found';
      this.clearFrontendTimeout();
    }
  }

  clearFrontendTimeout() {
    if (this.frontendTimeoutSubscription) {
      this.frontendTimeoutSubscription.unsubscribe();
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.countdownSeconds = 31;
  }

  handleMatchResponseUi(response: MatchResponse) {
    console.log('response', response);
    // if (response.timeout || this.seconds === 0) {
    if (response.timeout) {
      this.timeout = true;
      this.isCounting = false;
      this.displayMessage = 'No matches found';
      console.log('response', response);
      console.log('response timeout boolean', response.timeout);
    } else if (response.matchedUsers && response.matchedUsers.length === 2) {
      console.log('im here, handleMatchResponse when match is found')
      this.matchFound = true;
      this.isCounting = false;
      this.otherUserId = response.matchedUsers[1].user_id;
      this.displayMessage = `BEST MATCH FOUND!`;
      this.startAcceptTimer();
    }
  }

  startAcceptTimer() {
    this.acceptCountdown = 10;
    this.acceptTimeoutSubscription = timer(this.acceptCountdown * 1000).subscribe(() => {
      if (!this.isVisible) return;
      this.timeout = true;
      this.isCounting = false;
      this.displayMessage = 'Did not accept in time :('
    });
    interval(1000)
      .pipe(take(this.acceptCountdown))
      .subscribe(() => this.acceptCountdown--);
  }

  async setMyUsername(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUser(this.userId).subscribe({
        next: (data: any) => {
          this.myUsername = data.data.username;
          console.log('data itself ', data);
          console.log('myUsername', this.myUsername);
          resolve();
        },
        error: (e) => {
          console.error("Error fetching: ", e);
          reject(e);
        },
        complete: () => console.info("fetched my username!")
      });
    });
  }

  acceptMatch() {
    this.isVisible = false;
    // Logic to navigate to the next page
    const navigationExtras: NavigationExtras = {
      queryParams: {
        userId: this.userId,
      }
    };
    this.router.navigate(['collab', this.collabSessionId], navigationExtras);
  }

  async requeue() {
    this.isVisible = true;
    this.findMatch();
  }

  // TODO: HANDLE CANCEL MATCH - SYNC W MATCHING SVC BE PEEPS @KERVYN @IVAN
  cancelMatch() {
    this.isVisible = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.acceptTimeoutSubscription) {
      this.acceptTimeoutSubscription.unsubscribe();
    }
    // navigate back to /landing
    this.router.navigate(['/landing']);
  }
}

