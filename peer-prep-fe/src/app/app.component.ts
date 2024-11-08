import { CommonModule } from "@angular/common"
import { HttpClientModule } from "@angular/common/http"
import { Component } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink, RouterOutlet } from "@angular/router"
import { Router, NavigationEnd } from '@angular/router';

import { QuestionListComponent } from "../components/question-list/question-list.component"
import { AdminComponent } from "./admin/admin.component"
import { authService } from "./authService/authService"
import { HomeComponent } from "./home/home.component"
import { LoginComponent } from "./login/login.component"
import { CollabService } from "../services/collab.service"

const MODULES = [
  CommonModule,
  RouterOutlet,
  HomeComponent,
  LoginComponent,
  RouterLink,
  FormsModule,
  QuestionListComponent,
  CommonModule,
  AdminComponent,
  HttpClientModule
]

@Component({
  selector: "app-root",
  standalone: true,
  imports: [MODULES],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css"
})
export class AppComponent {
  title = "peer-prep-fe"
  userName: string | null = null
  hideNavbar = false

  constructor(private authService: authService, private router: Router, private collabService: CollabService) {}

  //Check if username is logged in, set this.userName
  ngOnInit(): void {
    this.authService.currentUserValue.subscribe((user) => {
      if (user) {
        this.userName = user.data.username
      } else {
        this.userName = null
      }
    })

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideNavbar = event.url === '/collab'; 
      }
    });
  }

  //For logout button
  logout(): void {
    this.authService.logout()
  }

  //For navbar username display
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated()
  }

  // Is Admin
  isAdmin(): boolean {
    return this.authService.isAdmin()
  }

  isInSession(): boolean {
    return this.collabService.isInSession()
  }
}
