import { CommonModule } from "@angular/common"
import { Component, Input } from "@angular/core"

@Component({
  selector: "app-question-explanation-box",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./question-explanation-box.component.html",
  styleUrl: "./question-explanation-box.component.css"
})
export class QuestionExplanationBoxComponent {
  @Input() questionDescription!: string
}
