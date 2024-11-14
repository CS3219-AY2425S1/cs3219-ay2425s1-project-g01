import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Used to mock observable data
import { MatchModalComponent } from './match-modal.component';
import { MatchService } from '../../services/match.service'; // Ensure the service is imported
import { HttpClientTestingModule } from '@angular/common/http/testing'; // To mock HttpClient

describe('MatchModalComponent', () => {
  let component: MatchModalComponent;
  let fixture: ComponentFixture<MatchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchModalComponent, HttpClientTestingModule], // Add HttpClientTestingModule
      providers: [
        {
          provide: ActivatedRoute, 
          useValue: { queryParams: of({ category: 'testCategory', difficulty: 'easy', userId: 'testUserId' }) }
        },
        MatchService // Provide the service
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});