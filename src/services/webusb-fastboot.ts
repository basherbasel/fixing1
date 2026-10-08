/**
 * Sentinel Mobile Studio - Real WebUSB Fastboot & USB Bulk Controller
 * Implements Google Fastboot wire protocol directly over WebUSB endpoints.
 * Standard Fastboot endpoints: Interface Class 0xFF (Vendor Specific), Subclass 0x42, Protocol 0x03.
 * Includes descriptor listeners & polling-retry logic for OS-level USB handshake timeouts.
 */

export interface FastbootResponse {
  type: 'OKAY' | 'INFO' | 'FAIL' | 'DATA';
  data: string;
  rawPayload?: Uint8Array;
}

export interface FastbootRetryConfig {
  maxRetries?: number;
  delayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, maxRetries: number, error: Error) => void;
}

export class RealWebUsbFastboot {
  private device: USBDevice | null = null;
  private interfaceNumber: number = 0;
  private endpointIn: number = 0;
  private endpointOut: number = 0;
  private isConnected: boolean = false;
  private listenerActive: boolean = false;
  private onConnectCallback?: (device: USBDevice) => void;
  private onDisconnectCallback?: (device: USBDevice) => void;

  get connected(): boolean {
    return this.isConnected && this.device !== null;
  }

  get usbDevice(): USBDevice | null {
    return this.device;
  }

  /**
   * Helper utility: Promise wrapper with custom timeout to catch stalled USB descriptors
   */
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`[USB-TIMEOUT] ${errorMessage} (exceeded ${timeoutMs}ms)`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Helper utility: Sleep for ms
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Initialize Global WebUSB Device Descriptor Listener
   * Automatically intercepts connection / insertion events even if initial handshake timed out.
   */
  public startDeviceDescriptorListener(
    onConnect?: (device: USBDevice) => void,
    onDisconnect?: (device: USBDevice) => void
  ): void {
    if (!navigator.usb) {
      console.warn('[WebUSB-Fastboot] navigator.usb unavailable for descriptor listener');
      return;
    }

    this.onConnectCallback = onConnect;
    this.onDisconnectCallback = onDisconnect;

    if (this.listenerActive) return;

    const usb = navigator.usb as any;
    usb.addEventListener('connect', this.handleUsbConnect);
    usb.addEventListener('disconnect', this.handleUsbDisconnect);
    this.listenerActive = true;
    console.log('[+] [WebUSB-Fastboot] Device Descriptor Listener active. Watching for USB hotplug events...');
  }

  public stopDeviceDescriptorListener(): void {
    if (navigator.usb && this.listenerActive) {
      const usb = navigator.usb as any;
      usb.removeEventListener('connect', this.handleUsbConnect);
      usb.removeEventListener('disconnect', this.handleUsbDisconnect);
      this.listenerActive = false;
    }
  }

  private handleUsbConnect = async (event: any) => {
    const dev: USBDevice = event.device;
    console.log('[+] [WebUSB-Fastboot] USB Device Descriptor attached:', dev?.productName || 'Unknown Fastboot Target');
    if (this.onConnectCallback && dev) {
      this.onConnectCallback(dev);
    }
  };

  private handleUsbDisconnect = (event: any) => {
    const dev: USBDevice = event.device;
    console.log('[-] [WebUSB-Fastboot] USB Device Descriptor detached:', dev?.productName || 'Device');
    if (this.device === dev) {
      this.isConnected = false;
      this.device = null;
    }
    if (this.onDisconnectCallback && dev) {
      this.onDisconnectCallback(dev);
    }
  };

  /**
   * Request native browser WebUSB prompt for user permission
   */
  async requestDevice(): Promise<USBDevice> {
    if (!navigator.usb) {
      throw new Error('WebUSB API is not supported in this browser. Please use Chrome, Edge, or Opera.');
    }

    const device = await navigator.usb.requestDevice({
      filters: [
        { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x03 }, // Android Fastboot standard
        { vendorId: 0x18D1 }, // Google / Pixel
        { vendorId: 0x05C6 }, // Qualcomm
        { vendorId: 0x0E8D }, // MediaTek
        { vendorId: 0x04E8 }, // Samsung
        { vendorId: 0x2717 }, // Xiaomi
        { vendorId: 0x1782 }, // Unisoc
        { vendorId: 0x22D9 }, // Oppo / Realme / OnePlus
        { vendorId: 0x2A70 }, // OnePlus
      ]
    });

    return device;
  }

  /**
   * Open device connection with robust Polling-Retry logic
   * Handles OS-level handshake timeouts, endpoint stalls, and delayed driver initialization.
   */
  async connectWithRetry(device: USBDevice, retryConfig?: FastbootRetryConfig): Promise<string> {
    const maxRetries = retryConfig?.maxRetries ?? 5;
    const delayMs = retryConfig?.delayMs ?? 600;
    const timeoutMs = retryConfig?.timeoutMs ?? 4000;
    const onRetry = retryConfig?.onRetry;

    this.device = device;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[WebUSB-Fastboot] Connection attempt ${attempt}/${maxRetries} for ${device.productName || 'USB Target'}...`);

        // Step 1: Open USB Device (with timeout protection)
        if (!this.device.opened) {
          await RealWebUsbFastboot.withTimeout(
            this.device.open(),
            timeoutMs,
            'OS USB device open handshake timed out'
          );
        }

        // Step 2: Select USB Configuration
        if (this.device.configuration === null) {
          await RealWebUsbFastboot.withTimeout(
            this.device.selectConfiguration(1),
            timeoutMs,
            'OS USB configuration selection timed out'
          );
        }

        // Step 3: Discover Fastboot / Bulk Endpoints
        let matchedInterface: USBInterface | null = null;
        let foundIn = 0;
        let foundOut = 0;

        for (const iface of this.device.configuration?.interfaces || []) {
          for (const alt of iface.alternates) {
            const hasBulkIn = alt.endpoints.some(e => e.direction === 'in' && e.type === 'bulk');
            const hasBulkOut = alt.endpoints.some(e => e.direction === 'out' && e.type === 'bulk');

            if (hasBulkIn && hasBulkOut) {
              matchedInterface = iface;
              const epIn = alt.endpoints.find(e => e.direction === 'in' && e.type === 'bulk');
              const epOut = alt.endpoints.find(e => e.direction === 'out' && e.type === 'bulk');
              if (epIn && epOut) {
                foundIn = epIn.endpointNumber;
                foundOut = epOut.endpointNumber;
                break;
              }
            }
          }
          if (matchedInterface) break;
        }

        if (!matchedInterface) {
          throw new Error('No bulk transfer endpoints discovered on target mobile hardware.');
        }

        this.interfaceNumber = matchedInterface.interfaceNumber;
        this.endpointIn = foundIn;
        this.endpointOut = foundOut;

        // Step 4: Claim USB Interface (with timeout)
        await RealWebUsbFastboot.withTimeout(
          this.device.claimInterface(this.interfaceNumber),
          timeoutMs,
          'OS USB claimInterface handshake timed out'
        );

        this.isConnected = true;
        console.log(`[+] [WebUSB-Fastboot] Fastboot Connection Established on attempt ${attempt}!`);
        return `Claimed USB Interface #${this.interfaceNumber} (EP IN: ${this.endpointIn}, EP OUT: ${this.endpointOut}) [Attempts: ${attempt}]`;

      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[!] [WebUSB-Fastboot] Connection attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

        if (onRetry) {
          onRetry(attempt, maxRetries, lastError);
        }

        // Attempt soft recovery reset before next retry
        try {
          if (this.device && this.device.opened) {
            await this.device.close().catch(() => {});
          }
        } catch (_) {}

        if (attempt < maxRetries) {
          const backoff = delayMs * Math.pow(1.2, attempt - 1);
          console.log(`[WebUSB-Fastboot] Polling retry delay ${Math.round(backoff)}ms before attempt ${attempt + 1}...`);
          await RealWebUsbFastboot.delay(backoff);
        }
      }
    }

    this.isConnected = false;
    throw new Error(`Fastboot USB connection failed after ${maxRetries} polling retries. Last error: ${lastError?.message || 'Handshake timeout'}`);
  }

  /**
   * Connect to device (backward compatible wrapper with default retries)
   */
  async connect(device: USBDevice): Promise<string> {
    return this.connectWithRetry(device, { maxRetries: 4, delayMs: 500, timeoutMs: 3500 });
  }

  /**
   * Execute real raw Fastboot command sequence with timeout protection
   */
  async sendCommand(command: string, onInfo?: (msg: string) => void): Promise<string> {
    if (!this.connected || !this.device) {
      throw new Error('Hardware connection is closed.');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const data = encoder.encode(command);

    // Send ASCII command
    await RealWebUsbFastboot.withTimeout(
      this.device.transferOut(this.endpointOut, data),
      4000,
      `Fastboot command Out Transfer (${command}) timed out`
    );

    let finalResponse = '';

    // Fastboot protocol response loop
    while (true) {
      const result = await RealWebUsbFastboot.withTimeout(
        this.device.transferIn(this.endpointIn, 512),
        4000,
        `Fastboot command In Response (${command}) timed out`
      );

      if (!result.data || result.data.byteLength === 0) {
        break;
      }

      const text = decoder.decode(result.data);
      const prefix = text.substring(0, 4);
      const payload = text.substring(4);

      if (prefix === 'INFO') {
        if (onInfo) onInfo(payload);
        finalResponse += (payload ? `\n${payload}` : '');
      } else if (prefix === 'OKAY') {
        finalResponse += (payload ? `\n${payload}` : '');
        break;
      } else if (prefix === 'FAIL') {
        throw new Error(`Device rejected command '${command}': ${payload || 'Operation Failed'}`);
      } else if (prefix === 'DATA') {
        finalResponse += `\n[DATA_CHUNK: ${payload}]`;
        break;
      } else {
        finalResponse += text;
        break;
      }
    }

    return finalResponse.trim();
  }

  /**
   * Query device variables (getvar)
   */
  async getVar(variable: string): Promise<string> {
    return this.sendCommand(`getvar:${variable}`);
  }

  /**
   * Real Partition Flashing via fastboot download:size + bulk payload stream + flash:partition
   */
  async flashPartition(
    partition: string,
    imageBytes: Uint8Array,
    onProgress?: (percent: number, transferred: number, total: number) => void,
    onLog?: (msg: string) => void
  ): Promise<string> {
    if (!this.connected || !this.device) {
      throw new Error('Hardware connection is closed.');
    }

    const totalBytes = imageBytes.byteLength;
    const hexSize = totalBytes.toString(16).padStart(8, '0');

    if (onLog) onLog(`[FLASH] Requesting fastboot download slot for ${totalBytes} bytes (0x${hexSize})...`);

    const downloadCmd = `download:${hexSize}`;
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    await RealWebUsbFastboot.withTimeout(
      this.device.transferOut(this.endpointOut, enc.encode(downloadCmd)),
      5000,
      'Fastboot download initialization transfer timed out'
    );

    const prepResult = await RealWebUsbFastboot.withTimeout(
      this.device.transferIn(this.endpointIn, 512),
      5000,
      'Fastboot download ACK response timed out'
    );

    if (!prepResult.data || prepResult.data.byteLength === 0) {
      throw new Error('Device did not acknowledge download readiness.');
    }

    const prepText = dec.decode(prepResult.data);
    if (!prepText.startsWith('DATA')) {
      throw new Error(`Device rejected image staging: ${prepText}`);
    }

    if (onLog) onLog(`[FLASH] Device ready. Streaming image data over Bulk Out EP #${this.endpointOut}...`);

    const CHUNK_SIZE = 64 * 1024;
    let offset = 0;

    while (offset < totalBytes) {
      const chunk = imageBytes.subarray(offset, Math.min(offset + CHUNK_SIZE, totalBytes));
      await this.device.transferOut(this.endpointOut, chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer);
      offset += chunk.length;

      const pct = Math.round((offset / totalBytes) * 100);
      if (onProgress) onProgress(pct, offset, totalBytes);
    }

    const downAck = await RealWebUsbFastboot.withTimeout(
      this.device.transferIn(this.endpointIn, 512),
      5000,
      'Fastboot payload stream completion ACK timed out'
    );

    if (downAck.data) {
      const ackText = dec.decode(downAck.data);
      if (onLog) onLog(`[FLASH] Staging status: ${ackText.trim()}`);
    }

    if (onLog) onLog(`[FLASH] Committing image to target partition '${partition}'...`);
    const flashCmd = `flash:${partition}`;
    const flashResult = await this.sendCommand(flashCmd, (info) => {
      if (onLog) onLog(`[FLASH-INFO] ${info}`);
    });

    return flashResult || 'Partition Flashed Successfully (OKAY)';
  }

  /**
   * Safe disconnect
   */
  async disconnect(): Promise<void> {
    if (this.device && this.isConnected) {
      try {
        await this.device.releaseInterface(this.interfaceNumber);
        await this.device.close();
      } catch (err) {
        console.warn('Error during USB disconnect release:', err);
      }
    }
    this.isConnected = false;
    this.device = null;
  }
}
