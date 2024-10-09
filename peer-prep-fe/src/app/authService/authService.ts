import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class authService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: any;

  constructor(private router: Router) {
    const userData = sessionStorage.getItem('userData');
    this.currentUserSubject = new BehaviorSubject<any>(
      userData ? JSON.parse(userData) : null,
    );
  }

  get currentUserValue() {
    return this.currentUserSubject.asObservable();
  }

  login(userData: any): void {
    sessionStorage.setItem('userData', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
    this.currentUser = userData;
    console.log(this.currentUser);
    this.router.navigate(['/']);
  }

  logout(): void {
    sessionStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    this.currentUser = null;
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('userData');
  }

  isAdmin(): boolean {
    if (!this.currentUser) {
      return false;
    }
    return this.currentUser.data.isAdmin;
  }

  getToken(): string | null {
    const userJson: any = sessionStorage.getItem('userData');
    const userToken = JSON.parse(userJson).data.accessToken;
    return userToken;
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  handleTokenExpiry() {
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
  }
}
