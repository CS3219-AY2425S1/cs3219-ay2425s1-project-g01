import { Routes } from "@angular/router"

import { AddPageComponent } from "../add-page/add-page.component"
import { QuestionListComponent } from "../components/question-list/question-list.component"
import { EditPageComponent } from "../edit-page/edit-page.component"
import { AdminComponent } from "./admin/admin.component"
import { AppComponent } from "./app.component"
import { CreateAccountComponent } from "./create-account/create-account.component"
import { HomeComponent } from "./home/home.component"
import { LoginComponent } from "./login/login.component"
import {MatchModalComponent} from "../loading-screen/match-modal/match-modal.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "create-account", component: CreateAccountComponent },
  { path: "admin-controls", component: AdminComponent },
  { path: "add-question", component: AddPageComponent },
  { path: "edit-question", component: EditPageComponent },
  { path: "question-list", component: QuestionListComponent },
  { path: "loading-screen", component: MatchModalComponent }
]
