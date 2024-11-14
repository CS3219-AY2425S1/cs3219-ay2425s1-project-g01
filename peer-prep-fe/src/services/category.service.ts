import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { Category } from "../app/models/category.model"

@Injectable({
  providedIn: "root"
})
export class CategoryService {
  private baseUrl = "http://localhost:8080/categories"

  constructor(private http: HttpClient) {}

  // Fetch categories from the API
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl)
  }

}
