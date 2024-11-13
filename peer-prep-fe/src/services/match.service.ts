import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { lastValueFrom, Observable } from "rxjs"

import { baseUrlProduction } from "../../constants"
import { MatchRequest, MatchRequestCancel, MatchRequestCancelResponse, MatchResponse } from "../app/models/match.model"
import { CategoryService } from "../services/category.service"
import { UserData } from "../types/userdata"

@Injectable({
  providedIn: "root"
})
export class MatchService {
  private apiUrl = this.isProduction() ? `${baseUrlProduction}/match` : "http://localhost:3002/match"

  constructor(private http: HttpClient) {}

  isProduction(): boolean {
    return window.location.hostname !== "localhost"
  }

  // send user data and difficulty to rabbitMQ (match request)
  // this is a post request, which returns a response
  async sendMatchRequest(userData: UserData, queueName: string): Promise<MatchResponse> {
    const matchRequest: MatchRequest = {
      userData,
      key: queueName
    }
    // return lastValueFrom(this.http.post<MatchResponse>(`${this.apiUrl}`, matchRequest));
    const response = await this.http.post<MatchResponse>(`${this.apiUrl}`, matchRequest).toPromise()
    if (!response) {
      throw new Error("Match response is undefined")
    }
    return response
  }

  async cancelMatchRequest(user_id: string) {
    const cancelMatchRequest: MatchRequestCancel = {
      user_id
    }

    const response = await this.http.post<MatchRequestCancelResponse>(`${this.apiUrl}/cancel`, cancelMatchRequest).toPromise()
    if (!response) {
        throw new Error("Given user_id is invalid, request cancelled unsuccessfully")
    }
    return response;
  }
}
