import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

import { DeletePageComponent } from "./delete-page.component"

class MatDialogRefMock {
  close() {}
}

const mockDialogData = {
  someProperty: "someValue"
}

describe("DeletePageComponent", () => {
  let component: DeletePageComponent
  let fixture: ComponentFixture<DeletePageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePageComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(DeletePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
