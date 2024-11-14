import { NgClass, NgForOf, NgIf } from "@angular/common"
import { HttpClient, HttpClientModule } from "@angular/common/http"
import {
  Component,
  EventEmitter,
  Inject,
  NgModule,
  Output
} from "@angular/core"
import {
  FormBuilder,
  FormControl,
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

import { EditPageComponent } from "../edit-page/edit-page.component"
import { QuestionService } from "../services/question.service"

@Component({
  selector: "app-add-page",
  templateUrl: "./add-page.component.html",
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    NgClass,
    NgIf,
    ReactiveFormsModule,
    HttpClientModule
  ],
  styleUrl: "./add-page.component.css"
})
export class AddPageComponent {
  @Output() addComplete = new EventEmitter<void>()

  question_title: string = ""
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
  question_complexity: string = "Easy"
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

  setDifficulty(level: string) {
    this.question_complexity = level
  }

  saveQuestion() {
    if (!this.questionForm.valid) {
      this.questionForm.markAllAsTouched()
      return
    }

    const selectedCategories = this.question_categories.filter(cat => cat.selected);
    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    const newQuestion = {
      Question_title: this.questionForm.value.question_title,
      Question_description: this.questionForm.value.question_description,
      Question_categories: this.question_categories
        .filter((cat) => cat.selected)
        .map((cat) => cat.name),
      Question_complexity: this.question_complexity
    }
    this.questionService.addQuestion(newQuestion).subscribe(
      (response) => {
        alert("Question added successfully!")
        this.dialogRef.close()
        this.onAddComplete()
      },
      (error) => {
        alert("Question with the same title already exists, duplicate questions aren’t allowed!")
      }
    )
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen
  }

  navigateBack() {
    this.dialogRef.close()
  }

  onAddComplete() {
    this.addComplete.emit()
  }
}
