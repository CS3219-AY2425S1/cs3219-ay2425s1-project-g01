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

  // parse the question description 
  getFormattedDescription(): string {
    if (this.questionDescription) {
      return (
        '<p>' +
        this.questionDescription
            .replace(/\n\n/g, '</p><p>')                
            .replace(/\n/g, '<br>')                      
            .replace(/(\d+\.)\s/g, '<div class="numbered-item"><b>$1</b> ') 
            .replace(/(<br>)+/g, '<br>') +               
        '</p>'
      );
    } 
    return "";
  }
}
