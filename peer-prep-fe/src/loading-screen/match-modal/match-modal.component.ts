import {Component, Input, OnInit} from '@angular/core';
import {interval, Subscription, take} from 'rxjs';
import { NgClass, NgIf } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchResponse } from '../../app/models/match.model';

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
export class MatchModalComponent implements OnInit {

  @Input() queueName: string = '';
  @Input() userId: string = '';
  @Input() category: string = '';
  @Input() difficulty: string = '';
  isVisible: boolean = false;
  isCounting: boolean = false;
  matchFound: boolean = false;
  timeout: boolean = false;
  displayMessage: string = 'Finding Suitable Match...';
  countdownSubscription: Subscription | undefined;
  matchCheckSubscription: Subscription | undefined;
  userData: any;
  timeLeft: number = 10;

  constructor(private router: Router, private route: ActivatedRoute, private matchService: MatchService) { }

  ngOnInit(): void {
    // Placeholder for component initialization if needed
    this.route.queryParams.subscribe(params => {
      this.category = params['category'];
      this.difficulty = params['difficulty'];
      this.userId = params['userId'];
      this.queueName = params['queueName'];
    });
    this.userData = {difficulty: this.difficulty, topic: this.category, user_id: this.userId};

    this.findMatch();
  }

  async findMatch() {
    this.isVisible = true;
    this.isCounting = true;
    this.matchFound = false;
    this.timeout = false;
    this.displayMessage = 'Finding Suitable Match...';
    const response = await this.matchService.sendMatchRequest(this.userData,this.queueName);
    // const response = await this.matchService.checkMatchResponse(this.queueName);
    this.handleMatchResponse(response);
  }

  handleMatchResponse(response: MatchResponse) {
    if (response.timeout) {
      this.timeout = true;
      this.isCounting = false;
      this.displayMessage = 'No matches found';
      console.log('response', response);
      console.log('response timeout boolean', response.timeout);
    } else if (response.matchedUsers && response.matchedUsers.length === 2) {
      this.matchFound = true;
      this.isCounting = false;
      this.displayMessage = `MATCH FOUND: Matched with ${response.matchedUsers[1].user_id}`;
      this.startCountDown();
    }
  }

  startCountDown() {
    this.timeLeft = 10;
    this.countdownSubscription = interval(1000).pipe(
      take(this.timeLeft)
    ).subscribe({
      next: (value) => this.timeLeft--,
      complete: () => this.onTimeout()
    });
  }

  onTimeout() {
    if(!this.matchFound) return;
    this.timeout = true;
    this.displayMessage = 'Timeout: oh no!'
  }

  acceptMatch() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.isVisible = false;
    // Logic to navigate to the next page
  }

  async requeue() {
    this.isVisible = true;
    const userData = {
      difficulty: this.difficulty,
      topic: this.category,
      user_id: this.userId,
    }
    this.findMatch();
  }

  cancelMatch() {
    this.isVisible = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    // navigate back to /landing
    this.router.navigate(['/landing']);
  }
}

