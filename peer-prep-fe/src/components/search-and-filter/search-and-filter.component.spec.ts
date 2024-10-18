import { HttpClientTestingModule } from "@angular/common/http/testing" // Import this to handle HttpClient
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ReactiveFormsModule } from "@angular/forms"

import { authService } from "../../app/authService/authService" // Adjust path accordingly
import { SearchAndFilterComponent } from "./search-and-filter.component"

// Create a mock version of authService
class MockAuthService {
  isAdmin() {
    return true // Simulate an admin user; change to false for non-admin tests
  }
}

describe("SearchAndFilterComponent", () => {
  let component: SearchAndFilterComponent
  let fixture: ComponentFixture<SearchAndFilterComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        SearchAndFilterComponent
      ],
      providers: [
        // Provide the mock authService
        { provide: authService, useClass: MockAuthService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(SearchAndFilterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
