import { Component, Input } from "@angular/core"

@Component({
  selector: "app-question-categories",
  standalone: true,
  imports: [],
  templateUrl: "./question-categories.component.html",
  styleUrl: "./question-categories.component.css"
})
export class QuestionCategoriesComponent {
  @Input() questionCategory!: string
}
