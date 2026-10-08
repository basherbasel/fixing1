/**
 * Sentinel Mobile Studio - Real Web Serial Port Controller
 * Direct hardware serial interrogation for Qualcomm COM / MediaTek Preloader / Modem Diag
 */

export interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

export class RealWebSerialController {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private isConnected: boolean = false;

  get connected(): boolean {
    return this.isConnected && this.port !== null;
  }

  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  async requestPort(): Promise<any> {
    if (!RealWebSerialController.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser environment. Requires Chrome/Edge desktop.');
    }
    const nav: any = navigator;
    const port = await nav.serial.requestPort({
      filters: [
        { usbVendorId: 0x05C6 }, // Qualcomm
        { usbVendorId: 0x0E8D }, // MediaTek
        { usbVendorId: 0x1782 }, // Unisoc
        { usbVendorId: 0x04E8 }, // Samsung ACM
      ]
    });
    return port;
  }

  async connect(baudRate: number = 115200): Promise<{ vid?: number; pid?: number }> {
    const nav: any = navigator;
    if (!this.port) {
      this.port = await this.requestPort();
    }

    await this.port.open({ baudRate });
    this.isConnected = true;

    const info = this.port.getInfo() as SerialPortInfo;
    return {
      vid: info.usbVendorId,
      pid: info.usbProductId
    };
  }

  async writeCommand(command: string): Promise<void> {
    if (!this.connected || !this.port) {
      throw new Error('Serial port is not open.');
    }
    const encoder = new TextEncoder();
    const writer = this.port.writable.getWriter();
    try {
      await writer.write(encoder.encode(command + '\r\n'));
    } finally {
      writer.releaseLock();
    }
  }

  async readChunk(timeoutMs: number = 3000): Promise<string> {
    if (!this.connected || !this.port) {
      throw new Error('Serial port is not open.');
    }
    const reader = this.port.readable.getReader();
    const decoder = new TextDecoder();
    try {
      const readPromise = reader.read();
      const timeoutPromise = new Promise<{ value: undefined; done: true }>((resolve) =>
        setTimeout(() => resolve({ value: undefined, done: true }), timeoutMs)
      );

      const res = await Promise.race([readPromise, timeoutPromise]);
      if (res && res.value) {
        return decoder.decode(res.value);
      }
      return '';
    } finally {
      reader.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    if (this.port && this.isConnected) {
      try {
        await this.port.close();
      } catch (e) {
        console.warn('Serial port close error:', e);
      }
    }
    this.isConnected = false;
    this.port = null;
  }
}
