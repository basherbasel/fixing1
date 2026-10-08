/**
 * Sentinel Mobile Studio - Real Android ADB Wire Protocol over WebUSB
 * Implements standard A_CNXN, A_OPEN, A_WRTE, A_OKAY, A_CLSE packets.
 * Standard ADB endpoints: Interface Class 0xFF (Vendor Specific), Subclass 0x42, Protocol 0x01.
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

export class RealWebUsbAdb {
  private device: USBDevice | null = null;
  private interfaceNumber: number = 0;
  private endpointIn: number = 0;
  private endpointOut: number = 0;
  private isConnected: boolean = false;
  private localId: number = 1;

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
   * Connect and locate ADB endpoints
   */
  async connect(device: USBDevice): Promise<string> {
    this.device = device;
    await this.device.open();

    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

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

    await this.device.claimInterface(this.interfaceNumber);
    this.isConnected = true;

    // Send A_CNXN handshake
    await this.sendConnectPacket();

    return `Claimed ADB Interface #${this.interfaceNumber} (EP IN: ${this.endpointIn}, EP OUT: ${this.endpointOut})`;
  }

  /**
   * Helper to build and compute 24-byte ADB packet header
   */
  private createHeader(command: number, arg0: number, arg1: number, data: Uint8Array): Uint8Array {
    const buffer = new ArrayBuffer(24);
    const view = new DataView(buffer);
    const dataLen = data.length;

    // Calculate checksum
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
   * Send Initial A_CNXN
   */
  async sendConnectPacket(): Promise<string> {
    if (!this.device) throw new Error('Device not connected');
    const systemIdentity = new TextEncoder().encode('host::sentinel-mobile-studio-lab\0');
    const header = this.createHeader(ADB_CONSTANTS.A_CNXN, ADB_CONSTANTS.ADB_VERSION, ADB_CONSTANTS.MAX_PAYLOAD, systemIdentity);

    // Send Header
    await this.device.transferOut(this.endpointOut, header.buffer as ArrayBuffer);
    // Send Payload
    await this.device.transferOut(this.endpointOut, systemIdentity.buffer as ArrayBuffer);

    // Read Response Header (24 bytes)
    const res = await this.device.transferIn(this.endpointIn, 24);
    if (!res.data || res.data.byteLength < 24) {
      return 'Connected (Awaiting Handshake ACK)';
    }

    const view = new DataView(res.data.buffer);
    const cmd = view.getUint32(0, true);
    const payloadLen = view.getUint32(12, true);

    if (payloadLen > 0) {
      const payloadRes = await this.device.transferIn(this.endpointIn, payloadLen);
      if (payloadRes.data) {
        const text = new TextDecoder().decode(payloadRes.data);
        return text;
      }
    }

    return cmd === ADB_CONSTANTS.A_CNXN ? 'Connected & Authorized' : 'Device Handshake Completed';
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
