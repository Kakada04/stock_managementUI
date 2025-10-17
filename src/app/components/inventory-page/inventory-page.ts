import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BarcodeScanner } from '../reusableComponents/barcode-scanner/barcode-scanner';

interface Product {
  _id?: string;
  name: string;
  categoryId: {
    _id: string;
    name: string;
  };
  price: number;
  quantity: number;
  minStockThreshold: number;
  barcode: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  total: number;
}

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BarcodeScanner],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css'
})
export class InventoryPage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  totalItems = 0;

  productForm = {
    _id: '',
    name: '',
    categoryId: '',
    price: 0,
    quantity: 0,
    minStockThreshold: 5,
    barcode: '',
    description: ''
  };

  // Add to component properties
showBarcodeScanner = false;
scannedBarcode = '';

  constructor(private http: HttpClient,private cdr : ChangeDetectorRef) {}
// Add methods
openBarcodeScanner() {
  this.showBarcodeScanner = true;
}

onBarcodeScanned(barcode: string) {
  this.scannedBarcode = barcode;
  this.productForm.barcode = barcode;
  this.showBarcodeScanner = false;
}

onScanError(error: string) {
  console.error('Barcode scan error:', error);
  alert('Scan failed: ' + error);
}

closeBarcodeScanner() {
  this.showBarcodeScanner = false;
}
  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.itemsPerPage.toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    if (this.selectedCategory) {
      params = params.set('category', this.selectedCategory);
    }

    this.http.get<ProductsResponse>('http://localhost:5000/api/products', { params })
      .subscribe({
        next: (response) => {
          this.products = response.products;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.totalItems = response.total;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      });
  }

  loadCategories() {
    this.http.get<Category[]>('http://localhost:5000/api/categories')
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  openAddModal() {
    this.isEditMode = false;
    this.productForm = {
      _id: '',
      name: '',
      categoryId: '',
      price: 0,
      quantity: 0,
      minStockThreshold: 5,
      barcode: '',
      description: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditMode = true;
    this.productForm = {
      _id: product._id || '',
      name: product.name,
      categoryId: product.categoryId._id,
      price: product.price,
      quantity: product.quantity,
      minStockThreshold: product.minStockThreshold,
      barcode: product.barcode,
      description: product.description || ''
    };
    this.imagePreview = product.image || null;
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submitProduct() {
    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    const formData = new FormData();
    
    // Append product data
    Object.entries(this.productForm).forEach(([key, value]) => {
      if (key !== '_id') {
        formData.append(key, value.toString());
      }
    });

    // Append image if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http.post<Product>('http://localhost:5000/api/products', formData)
      .subscribe({
        next: (product) => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          alert(error.error?.message || 'Error creating product');
        }
      });
  }

  updateProduct() {
    const formData = new FormData();
    
    // Append product data
    Object.entries(this.productForm).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Append image if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http.put<Product>(`http://localhost:5000/api/products/${this.productForm._id}`, formData)
      .subscribe({
        next: (product) => {
          this.loadProducts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating product:', error);
          alert(error.error?.message || 'Error updating product');
        }
      });
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`http://localhost:5000/api/products/${productId}`)
        .subscribe({
          next: () => {
            this.loadProducts();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert(error.error?.message || 'Error deleting product');
          }
        });
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}