import {Component, Inject, Injectable, Input, OnInit} from '@angular/core';
import { interval, Subscription, take } from 'rxjs';
import { NgClass, NgIf } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchResponse } from '../../app/models/match.model';
import {UserService} from '../../app/userService/user-service';
import { CommonModule } from '@angular/common';

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
  timeout: boolean = true;
  displayMessage: string = 'Finding Suitable Match...';
  countdownSubscription: Subscription | undefined;
  matchCheckSubscription: Subscription | undefined;
  userData: any;
  myUsername: string = '';
  otherUsername: string = '';
  otherUserId: string = '';
  otherCategory: string = '';
  otherDifficulty: string = '';
  // seconds: number = 30;

  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private matchService: MatchService, 
    private userService: UserService) {}

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

  // startCountDown() {
  //   this.seconds = 30;
  //   this.countdownSubscription = interval(1000).pipe(
  //     take(this.seconds)
  //   ).subscribe({
  //     next: (value) => this.seconds--,
  //     complete: () => this.onTimeout()
  //   });
  // }
  // onTimeout() {
  //   if(!this.matchFound) return;
  //   this.timeout = true;
  //   this.displayMessage = 'Timeout: oh no!'
  // }

  async findMatch() {
    // start timer for 30 seconds
    // this.startCountDown();
    this.isVisible = true;
    this.isCounting = true;
    this.matchFound = false;
    this.timeout = false;
    this.displayMessage = 'Finding Suitable Match...';
    const response = await this.matchService.sendMatchRequest(this.userData, this.queueName);
    console.log('RESPONSE FROM FINDMATCH ', response);
    console.log('TIMEOUT FROM FINDMATCH ', response.timeout);
    // set other user's category & difficulty based on matched results
    if (response.timeout) {
      this.handleMatchResponse(response);
    } else {
      const isUser1 = response.matchedUsers[0].user_id === this.userId;
      this.otherCategory = isUser1 ? response.matchedUsers[1].topic : response.matchedUsers[0].topic;
      this.otherDifficulty = isUser1? response.matchedUsers[1].difficulty : response.matchedUsers[0].difficulty;
      this.handleMatchResponse(response);
    }
  }
  
  handleMatchResponse(response: MatchResponse) {
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
      console.log(' setting usernames now');
      this.setUsernames();
      console.log('usernames set');
      this.displayMessage = `BEST MATCH FOUND!`;

    }
  }

  setUsernames() {
    this.userService.getUser(this.userId).subscribe({
      next: (data: any) => {
        this.myUsername = data.data.username;
        console.log('data itself ', data);
        console.log('myUsername', this.myUsername);
      },
      error: (e) => {
        console.error("Error fetching: ", e);
      },
      complete: () => console.info("fetched all users")
    });
    this.userService.getUser(this.otherUserId).subscribe({
      next: (data: any) => {
        this.otherUsername = data.data.username;
        console.log('data itself ', data);
        console.log('otherUsername', this.myUsername);
      },
      error: (e) => {
        console.error("Error fetching: ", e);
      },
      complete: () => console.info("fetched all users")
    });
  }

  acceptMatch() {
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

