import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { CollabPageComponent } from './collab-page.component';
import { CollabService } from '../services/collab.service';
import { WebSocketService } from '../code-editor/websocket.service';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { CollaborativeEditorComponent } from '../code-editor/collaborative-editor/collaborative-editor.component';

describe('CollabPageComponent', () => {
  let component: CollabPageComponent;
  let fixture: ComponentFixture<CollabPageComponent>;
  let webSocketServiceMock: any;
  let editor: CollaborativeEditorComponent

  beforeEach(async () => {
    const messageSubject = new Subject();

    webSocketServiceMock = jasmine.createSpyObj('WebSocketService', ['connect', 'disconnect', 'getMessages']);
    webSocketServiceMock.getMessages.and.returnValue(messageSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [CollabPageComponent, CollaborativeEditorComponent],
      providers: [
        {
          provide: NGX_MONACO_EDITOR_CONFIG,
          useValue: {
            baseUrl: 'assets/monaco',
            defaultOptions: { scrollBeyondLastLine: false }
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ sessionId: 'test-session' }),
            snapshot: { queryParamMap: { get: (key: string) => (key === 'userId' ? 'test-user' : null) } }
          }
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: CollabService, useValue: jasmine.createSpyObj('CollabService', ['getSession']) },
        { provide: WebSocketService, useValue: webSocketServiceMock },
        { provide: CollaborativeEditorComponent, useValue: editor}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollabPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
