import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {NgIf, NgFor} from "@angular/common";

interface Category {
  _id?: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule,NgIf,NgFor],
  templateUrl: './category-management.html',
  styleUrl: './category-management.css'
})
export class CategoryManagement implements OnInit {
  categories: Category[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;

  categoryForm = {
    _id: '',
    name: '',
    description: ''
  };

  constructor(private http: HttpClient,private cdr :ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.http.get<Category[]>('http://localhost:5000/api/categories')
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.loading = false;
          alert('Failed to load categories');
        }
      });
  }

  openAddModal() {
    this.isEditMode = false;
    this.categoryForm = {
      _id: '',
      name: '',
      description: ''
    };
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.isEditMode = true;
    this.categoryForm = {
      _id: category._id || '',
      name: category.name,
      description: category.description || ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  submitCategory() {
    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory() {
  // Validate
  if (!this.categoryForm.name.trim()) {
    alert('Category name is required');
    return;
  }

  // Send only necessary fields
  const payload = {
    name: this.categoryForm.name.trim(),
    description: this.categoryForm.description?.trim() || ''
  };

  this.http.post<Category>('http://localhost:5000/api/categories', payload)
    .subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
      },
      error: (error) => {
        console.error('Create category error:', error);
        const msg = error.error?.message || 'Unknown error creating category';
        alert(`Error: ${msg}`);
      }
    });
}

  updateCategory() {
    this.http.put<Category>(`http://localhost:5000/api/categories/${this.categoryForm._id}`, this.categoryForm)
      .subscribe({
        next: (category) => {
          this.loadCategories();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          alert(error.error?.message || 'Error updating category');
        }
      });
  }

  deleteCategory(categoryId: string) {
    if (confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      this.http.delete(`http://localhost:5000/api/categories/${categoryId}`)
        .subscribe({
          next: () => {
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            alert(error.error?.message || 'Error deleting category');
          }
        });
    }
  }
}