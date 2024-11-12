import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { baseUrlProduction } from "../../../constants"

import { authService } from "../authService/authService"

const MODULES: any[] = [
  FormsModule,
  ReactiveFormsModule,
  CommonModule,
  RouterLink
]

@Component({
  selector: "app-login",
  standalone: true,
  imports: [MODULES],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss"
})
export class LoginComponent {
  constructor(
    private router: Router,
    private authService: authService
  ) {}

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(6)
    ])
  })

  isProduction(): boolean {
    return window.location.hostname !== "localhost"
  }

  loginAccount() {
    let apiUrl: string = this.isProduction() ? `${baseUrlProduction}/auth/login` : "http://localhost:3001/auth/login"

    if (this.loginForm.invalid) {
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.loginForm.value)
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            alert("Incorrect email or password.")
          }
        }
        if (response.ok) {
          return response.json() // Parse the JSON from the response
        }
        throw new Error("Login failed")
        // return response.json(); // Parse the JSON from the response
      })
      .then((data) => {
        this.authService.login(data)
        //this.router.navigate(["/landing"]) // Redirect to homepage when succesfully created account
        console.log(data) // Handle the response data
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        )
      })
  }
}
