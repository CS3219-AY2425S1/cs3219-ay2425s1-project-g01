import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"

import { AddPageComponent } from "./add-page.component"

class MatDialogRefMock {
  close() {}
}

const mockDialogData = {
  someProperty: "someValue"
}

describe("AddPageComponent", () => {
  let component: AddPageComponent
  let fixture: ComponentFixture<AddPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPageComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(AddPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
