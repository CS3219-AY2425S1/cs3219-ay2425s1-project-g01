import { ComponentFixture, TestBed } from "@angular/core/testing"

import { QuestionCategoriesComponent } from "./question-categories.component"

describe("QuestionCategoriesComponent", () => {
  let component: QuestionCategoriesComponent
  let fixture: ComponentFixture<QuestionCategoriesComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCategoriesComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(QuestionCategoriesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
