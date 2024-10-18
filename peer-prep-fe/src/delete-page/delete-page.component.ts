import { HttpClientModule } from "@angular/common/http"
import { Component, EventEmitter, Inject, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

import { QuestionService } from "../services/question.service"

@Component({
  selector: "app-delete-page",
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: "./delete-page.component.html",
  styleUrl: "./delete-page.component.css"
})
export class DeletePageComponent {
  @Output() deleteComplete = new EventEmitter<void>()
  question_title: string = ""
  questionId: string = ""
  constructor(
    private questionService: QuestionService,
    private dialogRef: MatDialogRef<DeletePageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data?.questionId) {
      this.questionId = this.data.questionId
      this.loadQuestionData()
    }
  }

  loadQuestionData() {
    this.questionService.getQuestion(this.questionId).subscribe((data: any) => {
      const questionData = data.data.data
      this.question_title = questionData.question_title
    })
  }

  deleteQuestion() {
    this.questionService
      .deleteQuestion(this.questionId)
      .subscribe((response) => {
        alert("Question deleted successfully!")
        this.dialogRef.close()
        this.onDeleteComplete()
      })
  }
  navigateBack() {
    this.dialogRef.close()
  }

  onDeleteComplete() {
    this.deleteComplete.emit()
  }
}
