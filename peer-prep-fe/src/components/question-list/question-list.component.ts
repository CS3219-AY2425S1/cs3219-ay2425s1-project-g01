import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"

import { Question } from "../../app/models/question.model"
import { QuestionService } from "../../services/question.service"
import { QuestionBoxComponent } from "../question-box/question-box.component"
import { SearchAndFilterComponent } from "../search-and-filter/search-and-filter.component"

@Component({
  selector: "app-question-list",
  standalone: true,
  imports: [
    CommonModule,
    SearchAndFilterComponent,
    QuestionBoxComponent,
    HttpClientModule
  ],
  templateUrl: "./question-list.component.html",
  styleUrl: "./question-list.component.css"
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = []

  // Tracks current states
  currentFilterBy: string = ""
  currentFilterValues: string = ""
  currentSortBy: string = "question_title" // Note: fields added for future extension of sorting, current MVP uses default as hardcoded
  currentOrderBy: string = "asc"

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions()
  }

  // GET DEFAULT QUESTIONS

  loadQuestions() {
    // gets default ordering of questions
    this.questionService.getAllQuestion().subscribe(
      (data: any) => {
        this.questions = data.data.data
      },
      (error) => {
        console.error("Error fetching: ", error)
      }
    )
  }

  refreshQuestions() {
    this.loadQuestions()
  }

  // FILTER QUESTIONS

  loadFilteredQuestions(filterBy?: string, filterValues?: string) {
    this.currentFilterBy = filterBy ? filterBy : ""
    this.currentFilterValues = filterValues ? filterValues : ""
    this.questionService
      .getFilteredQuestions(this.currentFilterBy, this.currentFilterValues)
      .subscribe(
        (data: any) => {
          this.questions = data.data.data
          // this.filteredQuestions = data.data.data;
        },
        (error) => {
          console.error("Error fetching: ", error)
        }
      )
  }

  applyFilter(event: { filterBy: string; filterValues: string }) {
    this.loadFilteredQuestions(event.filterBy, event.filterValues)
    console.log("Filtering by:", event.filterBy, event.filterValues)
  }

  // SORT QUESTIONS

  // Keeps track of filtered state, if none, sort default list
  loadFilteredAndSortedQuestions() {
    // uses default sorting by question_title, asc
    this.questionService
      .getSortedQuestions(
        this.currentFilterBy,
        this.currentFilterValues,
        this.currentSortBy,
        this.currentOrderBy
      )
      .subscribe(
        (data: any) => {
          this.questions = data.data.data
        },
        (error) => {
          console.error("Error fetching: ", error)
        }
      )
  }

  applyFilterWithSort() {
    this.loadFilteredAndSortedQuestions()
  }

  // SEARCH QUESTIONS

  loadSearchedQuestions(searchTerm?: string) {
    if (searchTerm) {
      this.questionService.searchQuestion(searchTerm).subscribe(
        (data: any) => {
          this.questions = data.data.data
        },
        (error) => {
          console.error("Error fetching: ", error)
        }
      )
    } else {
      // gets default ordering of questions
      this.questionService.getAllQuestion().subscribe(
        (data: any) => {
          this.questions = data.data.data
        },
        (error) => {
          console.error("Error fetching: ", error)
        }
      )
    }
  }

  refreshQuestionsSearch(searchTerm?: string) {
    this.loadSearchedQuestions(searchTerm)
  }
}
