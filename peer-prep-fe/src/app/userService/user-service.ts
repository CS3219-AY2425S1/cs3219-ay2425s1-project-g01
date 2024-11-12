import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { baseUrlProduction } from "../../../constants"


@Injectable({ providedIn: "root" })
export class UserService {
  // private baseUrl = "http://localhost:3001/users"
  private baseUrl = this.isProduction() ? `${baseUrlProduction}/users` : "http://localhost:3001/users";

  private isProduction(): boolean {
    return window.location.hostname !== "localhost";
  }
  
  constructor(private http: HttpClient) {}

  readonly userJson = sessionStorage.getItem("userData")
  readonly token = this.userJson !== null ? JSON.parse(this.userJson).data.accessToken : ""

  readonly headers: HttpHeaders = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  })


  getAllUsers(): Observable<any> {
    return this.http.get<any>(this.baseUrl, { headers: this.headers })
  }

  saveUser(body: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${body.id}`, body, { headers: this.headers })
  }

  updatePrivilege(user: any): Observable<any> {
    var body: {
      isAdmin: boolean
    }
    body = {
      isAdmin: user.isAdmin
    }
    return this.http.patch(`${this.baseUrl}/${user.id}/privilege`, body, {
      headers: this.headers
    })
  }

  getCurrUserId(): string {
    return sessionStorage.getItem("userData") !== null ? JSON.parse(sessionStorage.getItem("userData")!).data.id : "";
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.headers });
  }

}
