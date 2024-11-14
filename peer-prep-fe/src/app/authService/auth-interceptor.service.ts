import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { authService } from "./authService"

@Injectable({
  providedIn: "root"
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: authService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken()

    if (token && this.authService.isTokenExpired(token)) {
      this.authService.handleTokenExpiry()
    } else if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set("Authorization", `Bearer ${token}`)
      })
      return next.handle(clonedReq)
    }

    return next.handle(req)
  }
}
