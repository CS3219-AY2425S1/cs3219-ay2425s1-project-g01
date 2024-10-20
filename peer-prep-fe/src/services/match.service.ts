import { CategoryService } from '../services/category.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable} from '@angular/core';
import {MatchRequest, MatchResponse} from '../app/models/match.model';
import { UserData } from '../../../message-queue/src/types';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MatchService {
  private apiUrl = 'http://localhost:3002/match';

  constructor(private http: HttpClient) {}

  // send user data and difficulty to rabbitMQ (match request)
  async sendMatchRequest(userData: UserData, queueName: string): Promise<MatchResponse> {
    const matchRequest: MatchRequest = {
      userData,
      key: queueName
    }
    return lastValueFrom(this.http.post<MatchResponse>(`${this.apiUrl}`, matchRequest));
  }

  async sendMatchResponse(userId: string, key: boolean): Promise<void> {
    const matchResponse = {
      userConfirmation: {
        user_id: userId
      },
      key: key
    };
    return lastValueFrom(this.http.post<void>(`${this.apiUrl}/response`, matchResponse));
  }
}

