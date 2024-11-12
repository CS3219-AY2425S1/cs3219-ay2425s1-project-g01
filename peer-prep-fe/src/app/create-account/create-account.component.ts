import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms"
import { Router } from "@angular/router"
import { baseUrlProduction } from "../../../constants"

import { authService } from "../authService/authService"

const MODULES: any[] = [FormsModule, ReactiveFormsModule, CommonModule]

@Component({
  selector: "app-create-account",
  standalone: true,
  imports: [MODULES],
  templateUrl: "./create-account.component.html",
  styleUrl: "./create-account.component.css"
})
export class CreateAccountComponent {
  constructor(
    private router: Router,
    private authService: authService
  ) {}

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get("password")
    const confirmPassword = control.get("confirmPassword")

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true }
    }
    return null
  }

  createAccountForm: FormGroup = new FormGroup(
    {
      username: new FormControl("", [Validators.required]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl("", [
        Validators.required,
        this.passwordMatchValidator
      ])
    },
    { validators: this.passwordMatchValidator }
  )

  // signInWithGoogle() {
  //   this.authService.login();
  // }
  isProduction(): boolean {
    return window.location.hostname !== "localhost"
  }

  createAccount() {
    let apiUrl: string = this.isProduction() ? `${baseUrlProduction}/users` : "http://localhost:3001/users"

    if (this.createAccountForm.invalid) {
      return
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.createAccountForm.value)
    })
      .then((response) => {
        if (!response.ok) {
          console.log(">> Account Creation: ", response)
          if (response.status === 409) {
            alert("Email/Username already exists.")
          }
          alert(
            "Error encountered when creating account. Please try again soon."
          )
          throw new Error("Account creation failed")
        } else {
          alert("Successfully created account")
          this.router.navigate(["/login"]) // Redirect to homepage when succesfully created account.
          return response.json() // Parse the JSON from the response
        }
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        )
      })
  }
}
