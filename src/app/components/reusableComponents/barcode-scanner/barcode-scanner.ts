import { Component, EventEmitter, Output, OnDestroy, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, Result, Exception } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barcode-scanner.html',
  styleUrl: './barcode-scanner.css'
})
export class BarcodeScanner implements OnInit, OnDestroy {
  @Output() scanSuccess = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('scannerContainer') scannerContainer!: ElementRef<HTMLDivElement>;

  private codeReader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;

  hasPermission: boolean | null = null;
  isScanning = false;
  torchEnabled = false;
  torchAvailable = false;
  currentDevice: MediaDeviceInfo | undefined;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  isLoading = true;
  scanAttempts = 0;
  scanResult: string | null = null;

  constructor(private cdRef: ChangeDetectorRef) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  async ngOnInit() {
    await this.startScanner();
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  private async startScanner() {
    try {
      this.isLoading = true;
      this.isScanning = true;
      this.cdRef.detectChanges();

      // First, get camera permission
      await this.requestCameraPermission();

      // List available devices using the static method
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      console.log('All video devices:', devices);

      this.availableDevices = devices;
      
      if (devices.length === 0) {
        throw new Error('No cameras found');
      }

      this.hasPermission = true;
      
      // Filter out virtual cameras and prioritize real ones
      const realCameras = devices.filter(device => 
        device.label && 
        device.label.trim() !== '' &&
        !device.label.toLowerCase().includes('obs') &&
        !device.label.toLowerCase().includes('snap') &&
        !device.label.toLowerCase().includes('virtual') &&
        !device.label.toLowerCase().includes('kakada')
      );

      // If we have real cameras, use them, otherwise use all available
      const camerasToUse = realCameras.length > 0 ? realCameras : devices;
      
      // Prioritize Iriun if available
      const iriunCamera = camerasToUse.find(device => 
        device.label.toLowerCase().includes('iriun')
      );

      this.currentDevice = iriunCamera || camerasToUse[0];
      this.selectedDeviceId = this.currentDevice.deviceId;

      console.log('Using camera:', this.currentDevice.label);

      // Start decoding
      await this.startDecoding();

    } catch (error: any) {
      console.error('Scanner initialization failed:', error);
      this.hasPermission = false;
      this.scanError.emit(error.message || 'Failed to initialize scanner');
    } finally {
      this.isLoading = false;
      this.cdRef.detectChanges();
    }
  }

  private async requestCameraPermission(): Promise<void> {
    try {
      // Request camera access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Camera permission granted');
    } catch (error) {
      console.error('Camera permission denied:', error);
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  }

  private async startDecoding() {
    if (!this.currentDevice || !this.videoElement?.nativeElement) {
      console.error('No device or video element available');
      return;
    }

    try {
      // Stop any existing scanning
      if (this.controls) {
        this.controls.stop();
      }

      console.log('Starting decoding with device:', this.currentDevice.label);

      this.controls = await this.codeReader.decodeFromVideoDevice(
        this.currentDevice.deviceId,
        this.videoElement.nativeElement,
        (result: Result | undefined, error: Exception | undefined) => {
          if (result) {
            this.onScanSuccess(result.getText());
          }
          
          if (error && !this.isIgnorableError(error)) {
            console.warn('Scan error:', error);
          }
        }
      );

      console.log('Scanner started successfully');

    } catch (error) {
      console.error('Failed to start scanner:', error);
      this.scanError.emit('Failed to start camera. Please try another camera source.');
    }
  }

  private isIgnorableError(error: Exception): boolean {
    const ignorableErrors = [
      'NotFoundException',
      'ChecksumException',
      'FormatException'
    ];
    return ignorableErrors.some(ignorable => error.name.includes(ignorable));
  }

  onScanSuccess(result: string) {
    this.scanAttempts++;
    this.scanResult = result;
    console.log(`Barcode scanned successfully (attempt ${this.scanAttempts}):`, result);
    
    this.scanSuccess.emit(result);
    this.cdRef.detectChanges();

    // Auto-close after successful scan
    setTimeout(() => {
      this.closeScanner();
    }, 1000);
  }

  async onDeviceSelectChange(deviceId: string) {
    const device = this.availableDevices.find(d => d.deviceId === deviceId);
    if (device) {
      this.currentDevice = device;
      this.selectedDeviceId = deviceId;
      console.log('Switched to camera:', device.label);
      
      // Restart scanning with new device
      await this.startDecoding();
      this.cdRef.detectChanges();
    }
  }

  stopScanner() {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
    this.isScanning = false;
  }

  async refreshCameras() {
    this.isLoading = true;
    this.stopScanner();
    this.availableDevices = [];
    this.currentDevice = undefined;
    this.selectedDeviceId = '';
    this.cdRef.detectChanges();

    setTimeout(async () => {
      await this.startScanner();
    }, 500);
  }

  closeScanner() {
    this.stopScanner();
    this.close.emit();
  }

  async retryPermission() {
    this.hasPermission = null;
    this.isLoading = true;
    this.stopScanner();
    this.availableDevices = [];
    this.currentDevice = undefined;
    this.cdRef.detectChanges();

    setTimeout(async () => {
      await this.startScanner();
    }, 500);
  }

  // Get device display name
  getDeviceName(device: MediaDeviceInfo): string {
    if (!device.label || device.label.trim() === '') {
      return `Camera ${this.availableDevices.indexOf(device) + 1}`;
    }
    
    let cleanLabel = device.label;
    
    // Detect Iriun Webcam
    if (cleanLabel.toLowerCase().includes('iriun')) {
      return '📱 Iriun Webcam (Phone)';
    }
    
    // Detect virtual cameras
    if (cleanLabel.toLowerCase().includes('virtual') || 
        cleanLabel.toLowerCase().includes('obs') ||
        cleanLabel.toLowerCase().includes('snap')) {
      return '🖥️ Virtual Camera';
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

  // Check if device is virtual
  isVirtualCamera(device: MediaDeviceInfo): boolean {
    return device.label.toLowerCase().includes('virtual') ||
           device.label.toLowerCase().includes('obs') ||
           device.label.toLowerCase().includes('snap');
  }
}