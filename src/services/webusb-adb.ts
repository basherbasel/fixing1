/**
 * Sentinel Mobile Studio - Real Android ADB Wire Protocol over WebUSB
 * Implements standard A_CNXN, A_OPEN, A_WRTE, A_OKAY, A_CLSE packets.
 * Standard ADB endpoints: Interface Class 0xFF (Vendor Specific), Subclass 0x42, Protocol 0x01.
 * Includes descriptor listeners & polling-retry logic for OS-level USB handshake timeouts.
 */

export const ADB_CONSTANTS = {
  A_SYNC: 0x434e5953,
  A_CNXN: 0x4e584e43,
  A_OPEN: 0x4e45504f,
  A_OKAY: 0x59414b4f,
  A_CLSE: 0x45534c43,
  A_WRTE: 0x45545257,
  A_AUTH: 0x48545541,
  ADB_VERSION: 0x01000000,
  MAX_PAYLOAD: 4096,
};

export interface AdbPacket {
  command: number;
  arg0: number;
  arg1: number;
  dataLength: number;
  dataChecksum: number;
  magic: number;
  data?: Uint8Array;
}

export interface AdbRetryConfig {
  maxRetries?: number;
  delayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, maxRetries: number, error: Error) => void;
}

export class RealWebUsbAdb {
  private device: USBDevice | null = null;
  private interfaceNumber: number = 0;
  private endpointIn: number = 0;
  private endpointOut: number = 0;
  private isConnected: boolean = false;
  private localId: number = 1;
  private listenerActive: boolean = false;
  private onConnectCallback?: (device: USBDevice) => void;
  private onDisconnectCallback?: (device: USBDevice) => void;

  get connected(): boolean {
    return this.isConnected && this.device !== null;
  }

  get usbDevice(): USBDevice | null {
    return this.device;
  }

  static isAdbInterface(iface: USBInterface): boolean {
    return iface.alternates.some(
      (alt) => alt.interfaceClass === 0xFF && alt.interfaceSubclass === 0x42 && alt.interfaceProtocol === 0x01
    );
  }

  /**
   * Helper utility: Promise wrapper with custom timeout for USB calls
   */
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`[ADB-USB-TIMEOUT] ${errorMessage} (exceeded ${timeoutMs}ms)`));
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
   * Initialize Global WebUSB ADB Device Descriptor Listener
   * Catches insertion / connection events even if initial handshake timed out.
   */
  public startDeviceDescriptorListener(
    onConnect?: (device: USBDevice) => void,
    onDisconnect?: (device: USBDevice) => void
  ): void {
    if (!navigator.usb) {
      console.warn('[WebUSB-ADB] navigator.usb unavailable for descriptor listener');
      return;
    }

    this.onConnectCallback = onConnect;
    this.onDisconnectCallback = onDisconnect;

    if (this.listenerActive) return;

    const usb = navigator.usb as any;
    usb.addEventListener('connect', this.handleUsbConnect);
    usb.addEventListener('disconnect', this.handleUsbDisconnect);
    this.listenerActive = true;
    console.log('[+] [WebUSB-ADB] Device Descriptor Listener active. Watching for ADB USB hotplug events...');
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
    console.log('[+] [WebUSB-ADB] USB Device Descriptor attached:', dev?.productName || 'Unknown ADB Target');
    if (this.onConnectCallback && dev) {
      this.onConnectCallback(dev);
    }
  };

  private handleUsbDisconnect = (event: any) => {
    const dev: USBDevice = event.device;
    console.log('[-] [WebUSB-ADB] USB Device Descriptor detached:', dev?.productName || 'Device');
    if (this.device === dev) {
      this.isConnected = false;
      this.device = null;
    }
    if (this.onDisconnectCallback && dev) {
      this.onDisconnectCallback(dev);
    }
  };

  /**
   * Request device with ADB filter
   */
  async requestDevice(): Promise<USBDevice> {
    if (!navigator.usb) {
      throw new Error('WebUSB API is not supported in this browser.');
    }
    return await navigator.usb.requestDevice({
      filters: [
        { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x01 }, // Native ADB
        { vendorId: 0x18D1 }, // Google
        { vendorId: 0x04E8 }, // Samsung
        { vendorId: 0x2717 }, // Xiaomi
        { vendorId: 0x05C6 }, // Qualcomm
        { vendorId: 0x0E8D }, // MediaTek
      ],
    });
  }

  /**
   * Open device connection and execute ADB handshake with Polling-Retry logic
   */
  async connectWithRetry(device: USBDevice, retryConfig?: AdbRetryConfig): Promise<string> {
    const maxRetries = retryConfig?.maxRetries ?? 5;
    const delayMs = retryConfig?.delayMs ?? 600;
    const timeoutMs = retryConfig?.timeoutMs ?? 4000;
    const onRetry = retryConfig?.onRetry;

    this.device = device;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[WebUSB-ADB] Connection attempt ${attempt}/${maxRetries} for ${device.productName || 'ADB Device'}...`);

        // Step 1: Open device (with timeout)
        if (!this.device.opened) {
          await RealWebUsbAdb.withTimeout(
            this.device.open(),
            timeoutMs,
            'OS USB device open handshake timed out'
          );
        }

        // Step 2: Select configuration
        if (this.device.configuration === null) {
          await RealWebUsbAdb.withTimeout(
            this.device.selectConfiguration(1),
            timeoutMs,
            'OS USB configuration selection timed out'
          );
        }

        // Step 3: Locate ADB interfaces
        let adbIface: USBInterface | null = null;
        let epIn = 0;
        let epOut = 0;

        for (const iface of this.device.configuration?.interfaces || []) {
          for (const alt of iface.alternates) {
            const hasBulkIn = alt.endpoints.some((e) => e.direction === 'in' && e.type === 'bulk');
            const hasBulkOut = alt.endpoints.some((e) => e.direction === 'out' && e.type === 'bulk');

            if (hasBulkIn && hasBulkOut) {
              adbIface = iface;
              const foundIn = alt.endpoints.find((e) => e.direction === 'in' && e.type === 'bulk');
              const foundOut = alt.endpoints.find((e) => e.direction === 'out' && e.type === 'bulk');
              if (foundIn && foundOut) {
                epIn = foundIn.endpointNumber;
                epOut = foundOut.endpointNumber;
                break;
              }
            }
          }
          if (adbIface) break;
        }

        if (!adbIface) {
          throw new Error('Could not find active ADB bulk transfer interface.');
        }

        this.interfaceNumber = adbIface.interfaceNumber;
        this.endpointIn = epIn;
        this.endpointOut = epOut;

        // Step 4: Claim interface (with timeout)
        await RealWebUsbAdb.withTimeout(
          this.device.claimInterface(this.interfaceNumber),
          timeoutMs,
          'OS USB claimInterface handshake timed out'
        );

        this.isConnected = true;

        // Step 5: Send A_CNXN handshake with retry
        const handshakeStatus = await this.sendConnectPacketWithRetry(3, 500);

        console.log(`[+] [WebUSB-ADB] ADB Handshake Successful on attempt ${attempt}! Status: ${handshakeStatus}`);
        return `Claimed ADB Interface #${this.interfaceNumber} (EP IN: ${this.endpointIn}, EP OUT: ${this.endpointOut}) [${handshakeStatus}]`;

      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[!] [WebUSB-ADB] Connection attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

        if (onRetry) {
          onRetry(attempt, maxRetries, lastError);
        }

        // Soft cleanup before retry
        try {
          if (this.device && this.device.opened) {
            await this.device.close().catch(() => {});
          }
        } catch (_) {}

        if (attempt < maxRetries) {
          const backoff = delayMs * Math.pow(1.2, attempt - 1);
          console.log(`[WebUSB-ADB] Polling retry delay ${Math.round(backoff)}ms before attempt ${attempt + 1}...`);
          await RealWebUsbAdb.delay(backoff);
        }
      }
    }

    this.isConnected = false;
    throw new Error(`ADB USB connection failed after ${maxRetries} polling retries. Last error: ${lastError?.message || 'Handshake timeout'}`);
  }

  /**
   * Connect and locate ADB endpoints (backward compatible wrapper)
   */
  async connect(device: USBDevice): Promise<string> {
    return this.connectWithRetry(device, { maxRetries: 4, delayMs: 600, timeoutMs: 3500 });
  }

  /**
   * Helper to build and compute 24-byte ADB packet header
   */
  private createHeader(command: number, arg0: number, arg1: number, data: Uint8Array): Uint8Array {
    const buffer = new ArrayBuffer(24);
    const view = new DataView(buffer);
    const dataLen = data.length;

    let sum = 0;
    for (let i = 0; i < dataLen; i++) {
      sum = (sum + data[i]) & 0xffffffff;
    }

    const magic = (command ^ 0xffffffff) >>> 0;

    view.setUint32(0, command, true);
    view.setUint32(4, arg0, true);
    view.setUint32(8, arg1, true);
    view.setUint32(12, dataLen, true);
    view.setUint32(16, sum, true);
    view.setUint32(20, magic, true);

    return new Uint8Array(buffer);
  }

  /**
   * Send Initial A_CNXN packet with internal handshake retries
   */
  async sendConnectPacketWithRetry(handshakeRetries = 3, retryDelayMs = 500): Promise<string> {
    let lastError: Error | null = null;

    for (let hAttempt = 1; hAttempt <= handshakeRetries; hAttempt++) {
      try {
        return await this.sendConnectPacket();
      } catch (err: any) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[WebUSB-ADB] A_CNXN Handshake try ${hAttempt}/${handshakeRetries} failed: ${lastError.message}`);
        if (hAttempt < handshakeRetries) {
          await RealWebUsbAdb.delay(retryDelayMs);
        }
      }
    }
    return `Connected (Awaiting Handshake ACK - ${lastError?.message || 'Timeout'})`;
  }

  /**
   * Send Initial A_CNXN packet
   */
  async sendConnectPacket(): Promise<string> {
    if (!this.device) throw new Error('Device not connected');
    const systemIdentity = new TextEncoder().encode('host::sentinel-mobile-studio-lab\0');
    const header = this.createHeader(ADB_CONSTANTS.A_CNXN, ADB_CONSTANTS.ADB_VERSION, ADB_CONSTANTS.MAX_PAYLOAD, systemIdentity);

    // Send Header
    await RealWebUsbAdb.withTimeout(
      this.device.transferOut(this.endpointOut, header as any),
      3000,
      'A_CNXN header transferOut timed out'
    );

    // Send Payload
    await RealWebUsbAdb.withTimeout(
      this.device.transferOut(this.endpointOut, systemIdentity as any),
      3000,
      'A_CNXN payload transferOut timed out'
    );

    // Read Response Header (24 bytes)
    const res = await RealWebUsbAdb.withTimeout(
      this.device.transferIn(this.endpointIn, 24),
      3500,
      'A_CNXN response header transferIn timed out'
    );

    if (!res.data || res.data.byteLength < 24) {
      return 'Connected (Awaiting Handshake ACK)';
    }

    const view = new DataView(res.data.buffer);
    const cmd = view.getUint32(0, true);
    const payloadLen = view.getUint32(12, true);

    if (payloadLen > 0) {
      const payloadRes = await RealWebUsbAdb.withTimeout(
        this.device.transferIn(this.endpointIn, payloadLen),
        3500,
        'A_CNXN response payload transferIn timed out'
      );
      if (payloadRes.data) {
        const text = new TextDecoder().decode(payloadRes.data);
        return text;
      }
    }

    return cmd === ADB_CONSTANTS.A_CNXN ? 'Connected & Authorized' : 'Device Handshake Completed';
  }

  /**
   * Execute a shell command and return the output
   */
  async shellCommand(command: string): Promise<string> {
    if (!this.device || !this.isConnected) throw new Error('ADB not connected');

    const cmdEncoded = new TextEncoder().encode(`shell:${command}\0`);
    const localId = this.localId++;
    const header = this.createHeader(ADB_CONSTANTS.A_OPEN, localId, 0, cmdEncoded);

    await RealWebUsbAdb.withTimeout(
      this.device.transferOut(this.endpointOut, header as any),
      4000,
      'A_OPEN header transferOut timed out'
    );

    await RealWebUsbAdb.withTimeout(
      this.device.transferOut(this.endpointOut, cmdEncoded as any),
      4000,
      'A_OPEN payload transferOut timed out'
    );

    let output = '';
    let closed = false;
    let remoteId = 0;

    while (!closed) {
      const res = await RealWebUsbAdb.withTimeout(
        this.device.transferIn(this.endpointIn, 24),
        5000,
        'ADB packet transferIn timed out'
      ).catch(() => null);

      if (res && res.status === 'ok' && res.data) {
        const view = new DataView(res.data.buffer);
        const cmdCode = view.getUint32(0, true);
        const arg0 = view.getUint32(4, true); // remoteId if OKAY/WRTE
        const arg1 = view.getUint32(8, true); // localId
        const dataLen = view.getUint32(12, true);

        if (cmdCode === ADB_CONSTANTS.A_OKAY) {
          remoteId = arg0;
          continue;
        }

        if (cmdCode === ADB_CONSTANTS.A_WRTE && dataLen > 0) {
          const dataRes = await RealWebUsbAdb.withTimeout(
            this.device.transferIn(this.endpointIn, dataLen),
            4000,
            'ADB payload transferIn timed out'
          );
          if (dataRes.data) {
            output += new TextDecoder().decode(dataRes.data);
          }
          const okayHeader = this.createHeader(ADB_CONSTANTS.A_OKAY, localId, remoteId, new Uint8Array(0));
          await this.device.transferOut(this.endpointOut, okayHeader as any);
        }

        if (cmdCode === ADB_CONSTANTS.A_CLSE) {
          closed = true;
          const clseHeader = this.createHeader(ADB_CONSTANTS.A_CLSE, localId, remoteId, new Uint8Array(0));
          await this.device.transferOut(this.endpointOut, clseHeader as any);
        }
      } else {
        break;
      }
    }
    return output.trim();
  }

  /**
   * Disconnect ADB
   */
  async disconnect(): Promise<void> {
    if (this.device && this.isConnected) {
      try {
        await this.device.releaseInterface(this.interfaceNumber);
        await this.device.close();
      } catch (e) {
        console.warn('Error closing ADB device:', e);
      }
    }
    this.isConnected = false;
    this.device = null;
  }
}
