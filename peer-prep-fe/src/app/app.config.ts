import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient
} from "@angular/common/http"
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection
} from "@angular/core"
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async"
import { provideRouter, withComponentInputBinding } from "@angular/router"
import { provideOAuthClient } from "angular-oauth2-oidc"

import { routes } from "./app.routes"
import { AuthInterceptor } from "./authService/auth-interceptor.service"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    importProvidersFrom(HttpClientModule),
    HttpClientModule,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
}
