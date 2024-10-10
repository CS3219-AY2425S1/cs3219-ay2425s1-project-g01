import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

import { EditPageComponent } from "./edit-page.component"

class MatDialogRefMock {
  close() {}
}

const mockDialogData = {
  someProperty: "someValue"
}

describe("EditPageComponent", () => {
  let component: EditPageComponent
  let fixture: ComponentFixture<EditPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPageComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(EditPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
