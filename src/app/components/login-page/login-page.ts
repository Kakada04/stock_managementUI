import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule,NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule,NgIf],
  templateUrl: './login-page.html'
})
export class LoginPage {
  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Call your actual backend API
    this.http.post<LoginResponse>('http://localhost:5000/api/auth/login', {
      email: this.credentials.email,
      password: this.credentials.password
    }).subscribe({
      next: (response) => {
        if (response.success && response.token) {
          // Store token in localStorage
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Redirect to inventory page
          this.router.navigate(['/inventory']);
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }
}

// Interface for the login response
interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
  };
}