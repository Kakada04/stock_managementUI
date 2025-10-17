import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-usermanage',
  imports: [FormsModule,CommonModule],
  templateUrl: './usermanage.html',
  styleUrl: './usermanage.css'
})
export class Usermanage {
  users: any[] = [];
  loading = false;
  
  // Modal state
  showCreateModal = false;
  
  // Form data
  createForm = {
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'admin'
  };

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Failed to load users');
        this.loading = false;
      }
    });
  }

  // Create User Modal
  openCreateModal(): void {
    this.createForm = { name: '', email: '', password: '', role: 'customer' };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    if (!this.createForm.name || !this.createForm.email || !this.createForm.password) return;
    
    this.loading = true;
    this.userService.createUser(this.createForm).subscribe({
      next: (response) => {
        this.toastr.success('User created successfully!');
        this.loadUsers(); // Refresh list
        this.closeCreateModal();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to create user');
        this.loading = false;
      }
    });
  }

  // Delete User
  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading = true;
      this.userService.deleteUser(userId).subscribe({
        next: (response) => {
          this.toastr.success('User deleted successfully!');
          this.loadUsers(); // Refresh list
          this.loading = false;
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to delete user');
          this.loading = false;
        }
      });
    }
  }
}