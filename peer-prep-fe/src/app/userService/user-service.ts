import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

const userJson = sessionStorage.getItem("userData")
const token = userJson !== null ? JSON.parse(userJson).data.accessToken : ""
const headers = new HttpHeaders({
  Authorization: `Bearer ${token}`
})

@Injectable({ providedIn: "root" })
export class UserService {
  private baseUrl = "http://localhost:3001/users"
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.http.get<any>(this.baseUrl, { headers })
  }

  saveUser(body: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${body.id}`, body, { headers })
  }

  updatePrivilege(user: any): Observable<any> {
    var body: {
      isAdmin: boolean
    }
    body = {
      isAdmin: user.isAdmin
    }
    return this.http.patch(`${this.baseUrl}/${user.id}/privilege`, body, {
      headers
    })
  }

  getCurrUserId(): string {
    return userJson !== null ? JSON.parse(userJson).data.id : "";
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers });
  }
}
