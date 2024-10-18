import {Component, Input, OnInit} from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { NgClass, NgIf } from "@angular/common";

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
  @Input() categories: string[] = ['bitwise', 'algorithm']
  @Input() difficulty: string = 'easy'

  isVisible: boolean = false;
  isCounting: boolean = false;
  matchFound: boolean = false;
  timeout: boolean = false;
  displayMessage: string = 'Finding Suitable Match...';
  countdownSubscription: Subscription | undefined;

  ngOnInit(): void {
    // Placeholder for component initialization if needed
  }

  findMatch() {
    this.isVisible = true;
    this.isCounting = true;
    this.matchFound = false;
    this.timeout = false;
    this.displayMessage = 'Finding Suitable Match...';

    const countdown$ = timer(3000); // 30 seconds timer

    this.countdownSubscription = countdown$.subscribe(() => {
      if (!this.matchFound) {
        this.timeout = true;
        this.isCounting = false;
        this.displayMessage = 'Time Out';
      }
    });

    // // Simulate match found before timeout (for testing purposes)
    setTimeout(() => {
      if (this.isCounting) {
        this.matchFound = true;
        this.isCounting = false;
        this.displayMessage = 'MATCH FOUND';
      }
    }, Math.random() * 1000); // Random time within 30 seconds
  }

  acceptMatch() {
    this.isVisible = false;
    // Logic to navigate to the next page
  }

  requeue() {
    this.isVisible = false;
    this.findMatch();
  }

  cancelMatch() {
    this.isVisible = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
}
