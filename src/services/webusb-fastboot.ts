/**
 * Sentinel Mobile Studio - Real WebUSB Fastboot & USB Bulk Controller
 * Implements Google Fastboot wire protocol directly over WebUSB endpoints.
 * Standard Fastboot endpoints: Interface Class 0xFF (Vendor Specific), Subclass 0x42, Protocol 0x03.
 */

export interface FastbootResponse {
  type: 'OKAY' | 'INFO' | 'FAIL' | 'DATA';
  data: string;
  rawPayload?: Uint8Array;
}

export class RealWebUsbFastboot {
  private device: USBDevice | null = null;
  private interfaceNumber: number = 0;
  private endpointIn: number = 0;
  private endpointOut: number = 0;
  private isConnected: boolean = false;

  get connected(): boolean {
    return this.isConnected && this.device !== null;
  }

  get usbDevice(): USBDevice | null {
    return this.device;
  }

  /**
   * Request native browser WebUSB prompt for user permission
   */
  async requestDevice(): Promise<USBDevice> {
    if (!navigator.usb) {
      throw new Error('WebUSB API is not supported in this browser. Please use Chrome, Edge, or Opera.');
    }

    // Request device with any Fastboot class or known mobile vendor IDs
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
   * Open device connection, claim interface and identify bulk endpoints
   */
  async connect(device: USBDevice): Promise<string> {
    this.device = device;
    await this.device.open();

    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    // Locate the Fastboot or Vendor interface
    let matchedInterface: USBInterface | null = null;
    let foundIn = 0;
    let foundOut = 0;

    for (const iface of this.device.configuration?.interfaces || []) {
      for (const alt of iface.alternates) {
        // Fastboot standard is 255/66/3 or vendor bulk in/out
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

    await this.device.claimInterface(this.interfaceNumber);
    this.isConnected = true;

    return `Claimed USB Interface #${this.interfaceNumber} (EP IN: ${this.endpointIn}, EP OUT: ${this.endpointOut})`;
  }

  /**
   * Execute real raw Fastboot command sequence
   */
  async sendCommand(command: string, onInfo?: (msg: string) => void): Promise<string> {
    if (!this.connected || !this.device) {
      throw new Error('Hardware connection is closed.');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const data = encoder.encode(command);

    // Send ASCII command
    await this.device.transferOut(this.endpointOut, data);

    let finalResponse = '';

    // Fastboot protocol response loop
    while (true) {
      const result = await this.device.transferIn(this.endpointIn, 512);
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
        // Raw stream fallback
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

    // 1. Send download command
    const downloadCmd = `download:${hexSize}`;
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    await this.device.transferOut(this.endpointOut, enc.encode(downloadCmd));

    // Read download readiness (Expecting DATA<hexSize>)
    const prepResult = await this.device.transferIn(this.endpointIn, 512);
    if (!prepResult.data || prepResult.data.byteLength === 0) {
      throw new Error('Device did not acknowledge download readiness.');
    }

    const prepText = dec.decode(prepResult.data);
    if (!prepText.startsWith('DATA')) {
      throw new Error(`Device rejected image staging: ${prepText}`);
    }

    if (onLog) onLog(`[FLASH] Device ready. Streaming image data over Bulk Out EP #${this.endpointOut}...`);

    // 2. Stream chunk by chunk (64KB chunks)
    const CHUNK_SIZE = 64 * 1024;
    let offset = 0;

    while (offset < totalBytes) {
      const chunk = imageBytes.subarray(offset, Math.min(offset + CHUNK_SIZE, totalBytes));
      await this.device.transferOut(this.endpointOut, chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer);
      offset += chunk.length;

      const pct = Math.round((offset / totalBytes) * 100);
      if (onProgress) onProgress(pct, offset, totalBytes);
    }

    // Read OKAY response for download
    const downAck = await this.device.transferIn(this.endpointIn, 512);
    if (downAck.data) {
      const ackText = dec.decode(downAck.data);
      if (onLog) onLog(`[FLASH] Staging status: ${ackText.trim()}`);
    }

    // 3. Trigger write to NAND partition
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
