import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { saveGuard } from './save.guard';
import { CollaborativeEditorComponent } from '../code-editor/collaborative-editor/collaborative-editor.component';
import { CollabPageComponent } from './collab-page.component';


describe('saveGuard', () => {
  const executeGuard: CanDeactivateFn<CollabPageComponent> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => saveGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
