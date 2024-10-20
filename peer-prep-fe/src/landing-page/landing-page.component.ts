import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { QUEUE_NAMES, DIFFICULTY } from '../app/constants/queue-constants';
import { UserService } from '../app/userService/user-service';
import { MatchModalComponent } from '../loading-screen/match-modal/match-modal.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {
  @ViewChild(MatchModalComponent) matchModal!: MatchModalComponent;
  selectedDifficulty: string | null = null;
  selectedCategory: string | null = null;
  sendingPopup: boolean = false;
  question_categories = [
    { name: "Algorithms", selected: false },
    { name: "Arrays", selected: false },
    { name: "Bit Manipulation", selected: false },
    { name: "Brainteaser", selected: false },
    { name: "Databases", selected: false },
    { name: "Data Structures", selected: false },
    { name: "Recursion", selected: false },
    { name: "Strings", selected: false }
  ];

  categoryLines: any[] = [];
  errorMessage: string | null = null;
  matchButtonActive: boolean = false;

  constructor(
    private matchService: MatchService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryLines = this.distributeCategories();
  }


  // ===== LATER OPTIMISATION OF CATEGORIES ======

  // ngOnInit() {
  //   this.fetchCategoriesFromApi();
  // }

  // fetchCategoriesFromApi() {
  //   this.http.get<QuestionData>('/questions/categories')
  //     .subscribe(response => {
  //       const fetchedCategories = response.question_categories;

  //       this.question_categories.forEach(cat => {
  //         cat.selected = fetchedCategories.includes(cat.name);
  //       });

  //       // After updating the selected categories, distribute them
  //       this.categoryLines = this.distributeCategories(); // Distribute categories after fetching
  //     });
  // }

  // =================================================

  async findMatch() {
    // const selectedTopic = this.question_categories.filter(topic => topic.selected).map(topic => topic.name);
    const userData = {
      difficulty: this.selectedDifficulty || '',
      topic: this.selectedCategory || '',
      user_id: this.userService.getCurrUserId() || '', // not sure if it'l work
    };
    const queueName = this.getQueueName();
    console.log('queueName printing:', queueName);

    try {
      // const response = await this.matchService.sendMatchRequest(userData, queueName);
      // console.log('Match request successful:', response);
      // sleep for 3 seconds
      this.router.navigate(['/loading-screen'],  {
        queryParams: {
          queueName: queueName,
          difficulty: this.selectedDifficulty || '',
          category: this.selectedCategory || '',
          userId: userData.user_id
        }
      });
    } catch (error) {
      console.error('Match request failed:', error);
      this.displayError('Failed to find a match. Please try again.');
    }
    // this.matchService.sendMatchRequest(userData, queueName).subscribe(
    //   (error) => {
    //     console.error('Match request failed:', error);
    //     this.displayError('Failed to find a match. Please try again.');
    //   }
    // );
  }

  // findMatchDummy() {
  //   this.matchService.sendMatchRequest({difficulty: 'easy', topic: 'arrays', user_id: '1'}, 'easy_queue').subscribe(
  //     (error) => {
  //       console.error('Match request failed:', error);
  //       this.displayError('Failed to find a match. Please try again.');
  //     }
  //   )
  //   this.router.navigate(['/loading-screen']);
  // }

  getQueueName(): string {
    // change to same case
    const difficulty = this.selectedDifficulty?.toUpperCase();
    switch(difficulty) {
      case DIFFICULTY.EASY.toUpperCase(): return QUEUE_NAMES.EASY;
      case DIFFICULTY.MEDIUM.toUpperCase(): return QUEUE_NAMES.MEDIUM;
      case DIFFICULTY.HARD.toUpperCase(): return QUEUE_NAMES.HARD;
      default: return '';
    }
  }


  toggleCategory(category: any) {
    category.selected = !category.selected; // Toggle the selected state
    this.checkSelections();

  }

  imagePath: string = "../assets/ufo.png";
  xPosition: string = '0px';
  yPosition: string = '0px';

  rotation: string = '0deg';

  handleDifficulty(difficulty: string) {
    if (difficulty === DIFFICULTY.EASY) {
        this.rotation = '-50.39deg';
        this.xPosition = '140px'; // Initial X position
        this.yPosition = '-80px';
    } else if (difficulty === DIFFICULTY.MEDIUM) {
        this.rotation = '-20deg';
        this.xPosition = '360px'; // Initial X position
        this.yPosition = '-80px';
    } else if (difficulty === DIFFICULTY.HARD){
        this.rotation = '10.39deg';
        this.xPosition = '570px'; // Initial X position
        this.yPosition = '-80px';
    }
    this.selectedDifficulty = difficulty; // Update the selected difficulty
    this.checkSelections();

  }

  // only one category can be selected, click on another means give up current
  selectCategory(categoryName: string) {
    this.question_categories.forEach(category => {
      category.selected = category.name === categoryName;
    });

    this.selectedCategory = categoryName;
    this.checkSelections();
  }

  distributeCategories() {
    const lines = [];
    let currentLine = [];
    let count = 0;

    for (let j = 0; j < this.question_categories.length; j++) {
      currentLine.push(this.question_categories[j]);
      if ((count % 2 === 0 && currentLine.length === 4) || (count % 2 !== 0 && currentLine.length === 3)) {
        lines.push(currentLine);
        currentLine = [];
        count++;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    console.log(lines)
    return lines;
  }

  checkSelections() {
    const hasSelectedDifficulty = this.selectedDifficulty !== null;
    // const hasSelectedTopics = this.question_categories.some(topic => topic.selected);
    const hasSelectedTopics = this.selectedCategory !== null;
    this.matchButtonActive = hasSelectedDifficulty && hasSelectedTopics;
  }

  handleFindMatch() {
    this.errorMessage = null;
    const hasSelectedDifficulty = this.selectedDifficulty !== null;
    // const hasSelectedTopics = this.question_categories.some(topic => topic.selected);
    const hasSelectedTopics = this.selectedCategory !== null;
    this.matchButtonActive = hasSelectedDifficulty && hasSelectedTopics;

    if (!hasSelectedDifficulty && !hasSelectedTopics) {
      this.displayError("Please select one difficulty and at least one topic.");
    } else if (!hasSelectedDifficulty && hasSelectedTopics) {
      this.displayError("Please select a difficulty.");
    } else if (hasSelectedDifficulty && !hasSelectedTopics) {
      this.displayError("Please select at least one topic.");
    }
    else {
      this.errorMessage = null;
      this.matchButtonActive = true
    }

    if (this.matchButtonActive) {
      this.findMatch();
    }
  }

  displayError(message: string) {
    this.errorMessage = message;
  }
}
