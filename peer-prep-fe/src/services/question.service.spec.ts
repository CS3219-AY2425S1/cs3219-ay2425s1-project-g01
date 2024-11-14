import { HttpClientModule } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"

import { QuestionService } from "./question.service"

describe("QuestionService", () => {
  let service: QuestionService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [QuestionService]
    })
    service = TestBed.inject(QuestionService)
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })
})
