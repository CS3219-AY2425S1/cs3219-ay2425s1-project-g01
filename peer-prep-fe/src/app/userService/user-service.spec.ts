import { HttpClient } from "@angular/common/http"
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing"
import { TestBed } from "@angular/core/testing"

import { UserService } from "./user-service"

describe("UserService", () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })

    httpClient = TestBed.get(HttpClient)
    httpTestingController = TestBed.get(HttpTestingController)
  })

  it("should create an instance", () => {
    expect(new UserService(httpClient)).toBeTruthy()
  })
})
