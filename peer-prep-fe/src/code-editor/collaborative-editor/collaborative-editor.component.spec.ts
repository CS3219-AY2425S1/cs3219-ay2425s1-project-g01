import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CollaborativeEditorComponent } from './collaborative-editor.component';

describe('CollaborativeEditorComponent', () => {
  let component: CollaborativeEditorComponent;
  let fixture: ComponentFixture<CollaborativeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaborativeEditorComponent],
      providers: [
        {
          provide: NGX_MONACO_EDITOR_CONFIG,
          useValue: {
            baseUrl: 'assets/monaco',
            defaultOptions: { scrollBeyondLastLine: false },
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ sessionId: 'test-session', userId: 'test-user' }),
            snapshot: { params: { sessionId: 'test-session', userId: 'test-user' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollaborativeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
