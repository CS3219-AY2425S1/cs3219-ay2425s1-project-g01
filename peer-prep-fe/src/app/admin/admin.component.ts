import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { FormsModule } from "@angular/forms"

import { User } from "../models/user.model"
import { UserService } from "../userService/user-service"

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin.component.html",
  styleUrl: "./admin.component.css"
})
export class AdminComponent {
  users: User[] = []

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.data
      },
      error: (e) => {
        console.error("Error fetching: ", e)
      },
      complete: () => console.info("fetched all users")
    })
  }

  editUser(user: any): void {
    user.isEditing = true
  }

  cancelEdit(user: any) {
    user.isEditing = false
    this.loadUsers()
  }

  saveUser(user: any) {
    this.userService.saveUser(user).subscribe({
      next: (data: any) => {},
      error: (e) => {
        if (e.status === 400) {
          alert("Username/Email is required.")
        } else if (e.status === 409) {
          alert("Username/Email already exists.")
        } else {
          alert("Error:" + e.status)
        }
      },
      complete: () => this.cancelEdit(user)
    })

    this.updateAdmin(user)
  }

  updateAdmin(user: any) {
    this.userService.updatePrivilege(user).subscribe({
      next: (data: any) => {
        console.log(data)
      },
      error: (e) => {
        alert("Error updating admin: " + e.status)
      },
      complete: () => {}
    })
  }
}
