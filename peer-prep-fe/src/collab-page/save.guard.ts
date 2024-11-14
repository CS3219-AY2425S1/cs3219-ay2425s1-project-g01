import { CanDeactivateFn, GuardResult, MaybeAsync } from '@angular/router';
import { CollabPageComponent } from './collab-page.component';

export const saveGuard: CanDeactivateFn<CollabPageComponent> = (component, currentRoute, currentState, nextState) => {
  return component.canDeactivate()
};
