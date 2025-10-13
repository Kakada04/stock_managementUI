import { Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './barcode-scanner.html',
  styleUrl: './barcode-scanner.css'
})
export class BarcodeScanner implements OnInit, OnDestroy {
  @Output() scanSuccess = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  hasPermission: boolean | null = null;
  isScanning = false;
  torchEnabled = false;
  torchAvailable = false;
  currentDevice: MediaDeviceInfo | undefined;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  isLoading = true;
  scanAttempts = 0;

  // Allowed barcode formats
  allowedFormats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.QR_CODE
  ];

  ngOnInit() {
    this.startScanner();
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  startScanner() {
    this.isScanning = true;
    this.isLoading = true;
    this.scanAttempts = 0;
  }

  stopScanner() {
    this.isScanning = false;
    this.isLoading = false;
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    console.log('Cameras found:', devices);
    this.availableDevices = devices;
    this.isLoading = false;
    
    if (devices && devices.length > 0) {
      // Prioritize Iriun Webcam or virtual cameras
      const iriunCamera = devices.find(device => 
        device.label.toLowerCase().includes('iriun') ||
        device.label.toLowerCase().includes('virtual') ||
        device.label.toLowerCase().includes('webcam') ||
        device.label.toLowerCase().includes('phone')
      );
      
      this.currentDevice = iriunCamera || devices[0];
      this.selectedDeviceId = this.currentDevice.deviceId;
      
      console.log('Selected camera:', this.currentDevice.label);
    } else {
      console.warn('No cameras found');
    }
  }

  onDeviceSelectChange(deviceId: string) {
    const device = this.availableDevices.find(d => d.deviceId === deviceId);
    if (device) {
      this.currentDevice = device;
      this.selectedDeviceId = deviceId;
      console.log('Switched to camera:', device.label);
    }
  }

  // The `zxing-scanner` output sometimes emits a boolean or an Event (CustomEvent with detail boolean)
  // Accept both and coerce to a boolean safely to avoid template type errors.
  onHasPermission(has: boolean | Event | CustomEvent): void {
    let resolved: boolean | null = null;

    if (typeof has === 'boolean') {
      resolved = has;
    } else if ((has as CustomEvent)?.detail !== undefined) {
      // CustomEvent.detail often contains the boolean permission value
      resolved = Boolean((has as CustomEvent).detail);
    } else {
      // Fallback: if an Event object was passed without detail, leave as null
      resolved = null;
    }

    this.hasPermission = resolved;
    console.log('Camera permission:', resolved);

    if (resolved === false) {
      this.scanError.emit('Camera permission denied. Please allow camera access in your browser settings.');
      this.isLoading = false;
    }
  }

  onScanSuccess(result: string) {
    this.scanAttempts++;
    console.log(`Barcode scanned successfully (attempt ${this.scanAttempts}):`, result);
    this.scanSuccess.emit(result);
    // Auto-close after successful scan
    setTimeout(() => {
      this.closeScanner();
    }, 1000);
  }

  onScanError(error: any) {
    // Ignore common scanning errors that happen during normal operation
    if (error && error.message) {
      const ignorableErrors = [
        'No MultiFormat Readers able to read',
        'NotFoundException',
        'checksum error'
      ];
      
      const isIgnorable = ignorableErrors.some(ignorable => 
        error.message.includes(ignorable)
      );
      
      if (!isIgnorable) {
        console.warn('Scan error:', error.message);
      }
    }
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable = isCompatible;
  }

  toggleTorch() {
    this.torchEnabled = !this.torchEnabled;
  }

  retryPermission() {
    this.hasPermission = null;
    this.isLoading = true;
    setTimeout(() => {
      this.startScanner();
    }, 500);
  }

  refreshCameras() {
    this.isLoading = true;
    this.availableDevices = [];
    this.currentDevice = undefined;
    this.selectedDeviceId = '';
    
    setTimeout(() => {
      this.startScanner();
    }, 1000);
  }

  closeScanner() {
    this.stopScanner();
    this.close.emit();
  }

  // Get device display name
  getDeviceName(device: MediaDeviceInfo): string {
    if (!device.label) return `Camera ${this.availableDevices.indexOf(device) + 1}`;
    
    let cleanLabel = device.label;
    
    // Detect Iriun Webcam
    if (cleanLabel.toLowerCase().includes('iriun')) {
      return '📱 Iriun Webcam (Phone)';
    }
    
    // Detect virtual cameras
    if (cleanLabel.toLowerCase().includes('virtual') || cleanLabel.toLowerCase().includes('webcam')) {
      return '🖥️ ' + cleanLabel.replace(/\([^)]*\)/g, '').replace(/^.*?:\s*/, '').trim();
    }
    
    // Clean up other labels
    cleanLabel = cleanLabel
      .replace(/\([^)]*\)/g, '')
      .replace(/^.*?:\s*/, '')
      .trim();
    
    return cleanLabel || `Camera ${this.availableDevices.indexOf(device) + 1}`;
  }

  // Check if device is Iriun
  isIriunCamera(device: MediaDeviceInfo): boolean {
    return device.label.toLowerCase().includes('iriun');
  }
}