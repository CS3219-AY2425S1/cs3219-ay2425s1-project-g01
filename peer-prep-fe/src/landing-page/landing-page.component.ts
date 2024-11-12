import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { QUEUE_NAMES, DIFFICULTY } from '../app/constants/queue-constants';
import { UserService } from '../app/userService/user-service';
import { MatchModalComponent } from '../loading-screen/match-modal/match-modal.component';
import { QuestionService } from "../services/question.service"; 
import { CategoryService } from '../services/category.service';
// import { Category } from "../app/models/category.model"
import { Question } from "../app/models/question.model"

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {
  @ViewChild(MatchModalComponent) matchModal!: MatchModalComponent;
  selectedDifficulty: string = '';
  selectedCategory: string | null = null;
  question_categories: string[] = [];
  questions: Question[] = []; 
  sendingPopup: boolean = false;
  categoriesToDisplay: string[][] = [];
  // question_categories = [
  //   { name: "Algorithms", selected: false },
  //   { name: "Arrays", selected: false },
  //   { name: "Bit Manipulation", selected: false },
  //   { name: "Brainteaser", selected: false },
  //   { name: "Databases", selected: false },
  //   { name: "Data Structures", selected: false },
  //   { name: "Recursion", selected: false },
  //   { name: "Strings", selected: false }
  // ];

  categoryLines: any[] = []; 
  errorMessage: string | null = null;
  matchButtonActive: boolean = false;

  constructor(
    private matchService: MatchService, 
    private userService: UserService,
    private router: Router,
    private questionService: QuestionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    //this.categoryLines = this.distributeCategoriesIntoLines();
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
    // const selectedTopic = this.question_categories.filter(topic => topic.selected).map(topic => topic.name);)
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

  toggleCategory(category: string) {
    this.selectedCategory = category
    console.log("selectedCategory", this.selectedCategory)
    //console.log(category.category_name)
    this.checkSelections();
    
  }

  imagePath: string = "../assets/ufo.png";
  xPosition: string = '0px'; 
  yPosition: string = '0px';

  rotation: string = '0deg';

  handleDifficulty(difficulty: string) {
    if (difficulty === DIFFICULTY.EASY) {
        this.rotation = '10deg'; 
        this.xPosition = '16%'; // Initial X position
        this.yPosition = '-5%';
    } else if (difficulty === DIFFICULTY.MEDIUM) {
        this.rotation = '-20deg'; 
        this.xPosition = '22%'; // Initial X position
        this.yPosition = '-4%';
    } else if (difficulty === DIFFICULTY.HARD){
        this.rotation = '-50deg'; 
        this.xPosition = '30%'; // Initial X position
        this.yPosition = '-5%';
    }
    this.selectedDifficulty = difficulty; // Update the selected difficulty
    //this.showCategories();
    console.log(this.selectedDifficulty)
    this.checkSelections();
  
  }

  onDifficultySelected(difficulty: string): void {
    difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    console.log(difficulty);
    this.selectedDifficulty = difficulty;
  
    // Fetch questions filtered by the selected difficulty
    this.questionService.getFilteredQuestions('question_complexity', difficulty)
      .subscribe((response: any) => {
        const questionsData = response?.data?.data; // Access the nested data
        console.log('questionsData:', questionsData);
  
        // Check if questionsData is an array
        if (Array.isArray(questionsData)) {
          this.questions = questionsData;
          console.log('questions:', this.questions);
  
          // Extract unique categories from the filtered questions
          const categories = new Set<string>();
          this.questions.forEach(question => {
            question.question_categories.forEach(category => categories.add(category));
          });
          this.question_categories = Array.from(categories).map(name => name);
          
          console.log(this.question_categories);
          this.showCategories();
        } else {
          console.error('Unexpected data format or empty result:', response);
        }
      });
  }
  
  showCategories(): void {
    if (this.selectedDifficulty) {
      // Distribute categories into lines for display
      this.categoryLines = this.distributeCategoriesIntoLines();
    } else {
      this.categoryLines = [];
    }
  }
  
  distributeCategoriesIntoLines(): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let count = 0;
    console.log('question_categories', this.question_categories);

    for (const category of this.question_categories) {
        currentLine.push(category);

        // Adjust line length based on line count
        if ((count % 2 === 0 && currentLine.length === 4) || (count % 2 !== 0 && currentLine.length === 3)) {
            lines.push([...currentLine]);
            currentLine = [];
            count++;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}
  


  checkSelections() {
    const hasSelectedDifficulty = this.selectedDifficulty !== null;
    console.log("hasSelectedDifficulty", hasSelectedDifficulty)
    // const hasSelectedTopics = this.question_categories.some(topic => topic.selected);
    const hasSelectedTopics = this.selectedCategory !== null;
    console.log("hasSelectedTopics", hasSelectedTopics)
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
      this.displayError("Please select a difficulty before selecting a topic.");
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