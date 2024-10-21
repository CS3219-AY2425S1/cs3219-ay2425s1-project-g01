import { CommonModule } from "@angular/common"
import { Component, Inject, Input } from "@angular/core"
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog"

import { QuestionCategoriesComponent } from "../question-categories/question-categories.component"
import { QuestionExplanationBoxComponent } from "../question-explanation-box/question-explanation-box.component"

@Component({
  selector: "app-question-description",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    QuestionExplanationBoxComponent,
    QuestionCategoriesComponent
  ],
  templateUrl: "./question-description.component.html",
  styleUrl: "./question-description.component.css"
})
export class QuestionDescriptionComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      questionTitle: string
      questionDescription: string
      questionCategories: string[]
      questionDifficulty: string
    }
  ) {}
}
