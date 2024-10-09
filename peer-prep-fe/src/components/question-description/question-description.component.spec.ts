import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionDescriptionComponent } from './question-description.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('QuestionDescriptionComponent', () => {
  let component: QuestionDescriptionComponent;
  let fixture: ComponentFixture<QuestionDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionDescriptionComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
