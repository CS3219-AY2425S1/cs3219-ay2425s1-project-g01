import { TestBed } from "@angular/core/testing"
import { Router } from "@angular/router"

import { authService } from "./authService"

describe("authService", () => {
  let router: Router

  beforeEach(() => {
    router = TestBed.inject(Router)
  })

  it("should create an instance", () => {
    expect(new authService(router)).toBeTruthy()
  })
})
