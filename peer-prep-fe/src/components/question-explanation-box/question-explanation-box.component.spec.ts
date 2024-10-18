import { ComponentFixture, TestBed } from "@angular/core/testing"

import { QuestionExplanationBoxComponent } from "./question-explanation-box.component"

describe("QuestionExplanationBoxComponent", () => {
  let component: QuestionExplanationBoxComponent
  let fixture: ComponentFixture<QuestionExplanationBoxComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionExplanationBoxComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(QuestionExplanationBoxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
