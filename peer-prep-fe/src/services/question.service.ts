import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { Question } from "../app/models/question.model"
import { Category } from "../app/models/category.model"
import { baseUrlProduction } from "../../constants"


@Injectable({
  providedIn: "root"
})
export class QuestionService {
  private baseUrl = this.isProduction() ? `${baseUrlProduction}/questions` : "http://localhost:8080/questions"
  constructor(private http: HttpClient) {}

  isProduction(): boolean {
    return window.location.hostname !== "localhost"
  }

  getAllQuestion(): Observable<Question[]> {
    return this.http.get<Question[]>(this.baseUrl)
  }

  getFilteredQuestions(
    filterBy?: string,
    filterValues?: string
  ): Observable<Question[]> {
    const url = filterBy
      ? `${this.baseUrl}?filterBy=${filterBy}&filterValues=${filterValues}`
      : this.baseUrl
    return this.http.get<Question[]>(url)
  }

  getSortedQuestions(
    filterBy?: string,
    filterValues?: string,
    sortBy?: string,
    orderBy?: string
  ): Observable<Question[]> {
    const url = `${this.baseUrl}?filterBy=${filterBy}&filterValues=${filterValues}&sortBy=${sortBy}&orderBy=${orderBy}`
    return this.http.get<Question[]>(url)
  }

  getQuestionCategories(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/categories`)
  }

  getQuestion(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`)
  }

  updateQuestion(id: string, updatedQuestion: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, updatedQuestion)
  }

  addQuestion(newQuestion: any): Observable<any> {
    return this.http.post(this.baseUrl, newQuestion)
  }

  searchQuestion(searchTerm: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?prefix=${searchTerm}`)
  }
  deleteQuestion(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }
  
}
