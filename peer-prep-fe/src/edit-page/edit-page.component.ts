import { NgClass, NgForOf, NgIf } from "@angular/common"
import { HttpClient, HttpClientModule } from "@angular/common/http"
import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms"
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from "@angular/material/dialog"

import { QuestionService } from "../services/question.service"

@Component({
  selector: "app-edit-page",
  templateUrl: "./edit-page.component.html",
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgForOf,
    HttpClientModule,
    ReactiveFormsModule,
    NgIf,
    MatDialogModule
  ],
  styleUrls: ["./edit-page.component.css"]
})
export class EditPageComponent implements OnInit {
  @Output() editComplete = new EventEmitter<void>()

  question_title: string = ""
  questionId: string = ""
  question_description: string = ""
  question_categories = [
    { name: "Algorithms", selected: false },
    { name: "Arrays", selected: false },
    { name: "Bit Manipulation", selected: false },
    { name: "Brainteaser", selected: false },
    { name: "Databases", selected: false },
    { name: "Data Structures", selected: false },
    { name: "Recursion", selected: false },
    { name: "Strings", selected: false }
  ]
  question_complexity: string = ""
  dropdownOpen: boolean = false

  questionForm: FormGroup

  constructor(
    private questionService: QuestionService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.questionForm = this.fb.group({
      question_title: ["", Validators.required],
      question_description: ["", Validators.required]
    })
  }

  ngOnInit() {
    if (this.data?.questionId) {
      this.questionId = this.data.questionId
      this.loadQuestionData()
    }
  }

  loadQuestionData() {
    if (!this.questionForm.valid) {
      this.questionForm.markAllAsTouched()
    }

    this.questionService.getQuestion(this.questionId).subscribe((data: any) => {
      const questionData = data.data.data
      this.question_title = questionData.question_title
      this.question_description = questionData.question_description
      const categoriesFromApi = questionData.question_categories || [] // Default to an empty array
      this.question_categories.forEach((cat) => {
        cat.selected = categoriesFromApi.includes(cat.name)
      })

      this.question_complexity = questionData.question_complexity
    })
  }

  setDifficulty(level: string) {
    this.question_complexity = level
  }

  saveQuestion() {
    const selectedCategories = this.question_categories.filter(cat => cat.selected);
    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    const updatedQuestion = {
      question_title: this.question_title,
      question_description: this.question_description,
      question_categories: this.question_categories
        .filter((cat) => cat.selected)
        .map((cat) => cat.name),
      question_complexity: this.question_complexity
    }
    this.questionService
      .updateQuestion(this.questionId, updatedQuestion)
      .subscribe(
        (response) => {
          alert("Question updated successfully!")
          this.dialogRef.close()
          this.onEditComplete()
        },
        (error) => {
          alert("Question already exist! Check question title.")
        }
      )
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen
  }

  navigateBack() {
    this.dialogRef.close()
  }

  onEditComplete() {
    this.editComplete.emit()
  }
}
