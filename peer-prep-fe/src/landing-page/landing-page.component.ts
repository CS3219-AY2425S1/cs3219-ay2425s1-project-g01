import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {
  selectedDifficulty: string | null = null;
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

  constructor() {}

  ngOnInit() {
    this.categoryLines = this.distributeCategories();
  }


  // constructor(private http: HttpClient) {}

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

  
  toggleCategory(category: any) {
    category.selected = !category.selected; // Toggle the selected state
    this.checkSelections();
    
  }

  imagePath: string = "assets/ufo.png";
  xPosition: string = '0px'; 
  yPosition: string = '0px';

  rotation: string = '0deg';

  showImage(difficulty: string) {
    if (difficulty === 'EASY') {
        this.rotation = '-50.39deg'; 
        this.xPosition = '140px'; // Initial X position
        this.yPosition = '-80px';
    } else if (difficulty === 'MEDIUM') {
        this.rotation = '-20deg'; 
        this.xPosition = '360px'; // Initial X position
        this.yPosition = '-80px';
    } else if (difficulty === 'HARD') {
        this.rotation = '10.39deg'; 
        this.xPosition = '570px'; // Initial X position
        this.yPosition = '-80px';
    }
    this.selectedDifficulty = difficulty; // Update the selected difficulty
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
  const hasSelectedTopics = this.question_categories.some(topic => topic.selected);
  
  this.matchButtonActive = hasSelectedDifficulty && hasSelectedTopics;
  
}

isMatchButtonActive() {
  this.errorMessage = null;
  const hasSelectedDifficulty = this.selectedDifficulty !== null;
  const hasSelectedTopics = this.question_categories.some(topic => topic.selected);
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
  }

displayError(message: string) {
  this.errorMessage = message; 
  }
}