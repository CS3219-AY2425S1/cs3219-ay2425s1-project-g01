import { Routes } from "@angular/router"

import { AddPageComponent } from "../add-page/add-page.component"
import { QuestionListComponent } from "../components/question-list/question-list.component"
import { EditPageComponent } from "../edit-page/edit-page.component"
import { AdminComponent } from "./admin/admin.component"
import { AppComponent } from "./app.component"
import { CreateAccountComponent } from "./create-account/create-account.component"
import { HomeComponent } from "./home/home.component"
import { LoginComponent } from "./login/login.component"
import { LandingPageComponent } from "../landing-page/landing-page.component"
import {MatchModalComponent} from "../loading-screen/match-modal/match-modal.component";
import { authGuard } from "./authService/auth.guard"
import { adminGuard } from "./authService/admin.guard"
import {CollaborativeEditorComponent} from "../code-editor/collaborative-editor/collaborative-editor.component";
import {CollabPageComponent} from "../collab-page/collab-page.component";
import {loginGuard} from "./authService/login.guard";
import { ProfilePageComponent } from "./profile-page/profile-page.component"
import { saveGuard } from "../collab-page/save.guard"
import { ChatComponent } from "../chat-feature/chat/chat.component"

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent, canActivate: [loginGuard]},
  { path: "create-account", component: CreateAccountComponent },
  { path: "profile", component: ProfilePageComponent, canActivate: [authGuard]},
  { path: "admin-controls", component: AdminComponent, canActivate: [adminGuard] },
  { path: "add-question", component: AddPageComponent },
  { path: "edit-question", component: EditPageComponent },
  { path: "question-list", component: QuestionListComponent, canActivate: [authGuard] },
  { path: "loading-screen", component: MatchModalComponent },
  { path: "landing", component: LandingPageComponent, canActivate: [authGuard]},
  {
    path: "collab/:sessionId",
    component: CollabPageComponent,
    children: [
      { path: "editor", component: CollaborativeEditorComponent },
      { path: "chat", component: ChatComponent }
    ],
    canDeactivate: [saveGuard]
  },
  { path: "code-editor", component: CollaborativeEditorComponent }
];
