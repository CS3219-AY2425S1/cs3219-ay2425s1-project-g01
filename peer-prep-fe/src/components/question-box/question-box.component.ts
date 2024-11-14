import { CommonModule } from "@angular/common"
import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from "@angular/material/dialog"
import { Router } from "@angular/router"

import { authService } from "../../app/authService/authService"
import { Question } from "../../app/models/question.model"
import { DeletePageComponent } from "../../delete-page/delete-page.component"
import { EditPageComponent } from "../../edit-page/edit-page.component"
import { QuestionDescriptionComponent } from "../question-description/question-description.component"

@Component({
  selector: "app-question-box",
  standalone: true,
  imports: [CommonModule, QuestionDescriptionComponent, MatDialogModule],
  templateUrl: "./question-box.component.html",
  styleUrls: ["./question-box.component.css"]
})
export class QuestionBoxComponent {
  @Input() question!: Question
  @Input() index!: number
  @Output() refresh = new EventEmitter<void>()

  constructor(
    private dialog: MatDialog,
    private authService: authService
  ) {}

  isAdmin(): boolean {
    return this.authService.isAdmin()
  }

  openModal() {
    this.dialog.open(QuestionDescriptionComponent, {
      data: {
        questionTitle: this.question.question_title,
        questionCategories: this.question.question_categories,
        questionDifficulty: this.question.question_complexity,
        questionDescription: this.question.question_description
      },
      panelClass: "custom-modalbox",
      width: "400px"
    })
  }

  openEditModal() {
    const dialogRef = this.dialog.open(EditPageComponent, {
      data: {
        questionId: this.question.question_id
      },
      panelClass: "custom-modalbox",
      width: "800px",
      height: "400px",
      position: {
        top: "200px"
      },
      disableClose: true
    })

    dialogRef.componentInstance.editComplete.subscribe(() => {
      this.refresh.emit()
    })
  }

  openDeleteModal() {
    const dialogRef = this.dialog.open(DeletePageComponent, {
      data: {
        questionId: this.question.question_id
      },
      panelClass: "custom-modalbox",
      width: "400px",
      height: "300px",
      disableClose: true
    })

    dialogRef.componentInstance.deleteComplete.subscribe(() => {
      this.refresh.emit()
    })
  }
}
