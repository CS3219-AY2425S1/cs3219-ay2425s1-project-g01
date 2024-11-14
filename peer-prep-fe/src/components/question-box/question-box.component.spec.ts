import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

import { authService } from "../../app/authService/authService" // Adjust import path as needed
import { Question } from "../../app/models/question.model"
import { QuestionBoxComponent } from "./question-box.component"

// Create a mock version of the authService
class MockAuthService {
  isAdmin() {
    return true // Or false, depending on the scenario you want to test
  }
}

describe("QuestionBoxComponent", () => {
  let component: QuestionBoxComponent
  let fixture: ComponentFixture<QuestionBoxComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionBoxComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            question_id: "123",
            question_title: "Mock Title",
            question_complexity: "Easy",
            question_description: "Test Description",
            question_categories: []
          }
        },
        { provide: MatDialogRef, useValue: {} },
        // Provide the mock authService
        { provide: authService, useClass: MockAuthService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QuestionBoxComponent)
    component = fixture.componentInstance

    component.question = {
      question_id: "123",
      question_title: "Mock Title",
      question_complexity: "Easy",
      question_description: "Test Description",
      question_categories: [],
      examples: [],
      constraints: []
    } as Question
    component.index = 0

    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
