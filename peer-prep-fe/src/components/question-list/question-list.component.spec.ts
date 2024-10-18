import { ComponentFixture, TestBed } from "@angular/core/testing"

import { authService } from "../../app/authService/authService" // Adjust the path as needed
import { QuestionBoxComponent } from "../question-box/question-box.component"
import { QuestionListComponent } from "./question-list.component"

// Create a mock version of the authService
class MockAuthService {
  isAdmin() {
    return true // Simulate an admin user; change to false for non-admin tests
  }
}

describe("QuestionListComponent", () => {
  let component: QuestionListComponent
  let fixture: ComponentFixture<QuestionListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListComponent, QuestionBoxComponent],
      providers: [
        // Provide the mock authService
        { provide: authService, useClass: MockAuthService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QuestionListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
