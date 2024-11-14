import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { Router } from "@angular/router"

import { authService } from "../authService/authService"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css"
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: authService
  ) {}

  goToLoginPage() {
    this.router.navigate(["/login"])
  }

  goToCreateAccountPage() {
    this.router.navigate(["/create-account"])
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated()
  }
}
