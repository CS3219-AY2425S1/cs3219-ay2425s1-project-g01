import { Component } from '@angular/core';
import { authService } from '../authService/authService';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from "@angular/common/http"
import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {FormsModule} from '@angular/forms';
import { UserService } from '../userService/user-service';
import { baseUrlProduction } from '../../../constants';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, MonacoEditorModule, FormsModule, HttpClientModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  id: string = ''
  userName: string | null = null
  email: string | null = null
  matches: {
    question_id: string,
    question_title: string,
    question_complexity: string,
    question_description: string,
    question_categories: string[],
    dateTime: string,
    IdInSessionDB: string
  }[] = []

  constructor(private authService: authService, private http: HttpClient, private userService: UserService) {}

  editorOptions = {
    readOnly: true,
    theme: 'vs-dark',
    language: 'javascript',
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs/'
    },
    minimap: {
      enabled: false
    },
  };
  
  code: string = ''

  //Check if username is logged in, set this.userName
  ngOnInit(): void {
    this.authService.currentUserValue.subscribe((user) => {
      if (user) {
        const {username, email, id, matches} = user.data;
        this.userName = username
        this.email = email
        this.id = id
      }
    })
    this.userService.getUser(this.id).subscribe({
      next: (data: any) => {
        this.matches= data.data.matches
      },
      error: (e) => {
        console.error(e)
      },
      complete: () => {}
    })
  }

  viewCode(id: string): void {
    const apiUrl: string = this.isProduction() ? `${baseUrlProduction}/collab/code/${id}` : `http://localhost:4003/collab/code/${id}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data: any) => {
        console.log(data)
        this.code = data.code
      },
      error: (e) => {
        console.error(e)
      },
      complete: () =>{}
    })
  }

  isProduction(): boolean {
    return window.location.hostname !== "localhost";
  }

}
