/**
 * Sentinel Mobile Studio - Real Qualcomm Sahara Protocol Engine
 * Implements the Sahara state machine for communicating with Qualcomm devices in EDL mode.
 */

export enum SaharaCommand {
  HELLO_REQ = 0x01,
  HELLO_RESP = 0x02,
  READ_DATA = 0x03,
  END_TRANSFER = 0x04,
  DONE = 0x05,
  DONE_RESP = 0x06,
  RESET = 0x07,
  RESET_RESP = 0x08,
  MEMORY_DEBUG = 0x09,
  MEMORY_READ = 0x0A,
  READY_REQ = 0x0B,
  READY_RESP = 0x0C,
}

export interface SaharaHelloPacket {
  command: number;
  length: number;
  version: number;
  minVersion: number;
  maxPacketSize: number;
  mode: number;
  reserved: number[];
}

export class RealQualcommSahara {
  private device: USBDevice | null = null;
  private endpointIn: number = 0;
  private endpointOut: number = 0;

  constructor(device: USBDevice, epIn: number, epOut: number) {
    this.device = device;
    this.endpointIn = epIn;
    this.endpointOut = epOut;
  }

  /**
   * Pack a Sahara packet into a Uint8Array (Little Endian)
   */
  private pack(data: number[]): Uint8Array {
    const buffer = new Uint8Array(data.length * 4);
    const view = new DataView(buffer.buffer);
    for (let i = 0; i < data.length; i++) {
      view.setUint32(i * 4, data[i], true);
    }
    return buffer;
  }

  /**
   * Unpack a Sahara packet from a DataView
   */
  private unpack(view: DataView): number[] {
    const data: number[] = [];
    for (let i = 0; i < view.byteLength; i += 4) {
      data.push(view.getUint32(i, true));
    }
    return data;
  }

  /**
   * Perform initial Sahara handshake
   */
  async connect(): Promise<SaharaHelloPacket> {
    if (!this.device) throw new Error('USB Device not assigned');

    // 1. Read HELLO_REQ from device
    const result = await this.device.transferIn(this.endpointIn, 1024);
    if (!result.data || result.data.byteLength < 48) {
      throw new Error('Invalid or missing Sahara HELLO_REQ from device.');
    }

    const view = new DataView(result.data.buffer);
    const cmd = view.getUint32(0, true);

    if (cmd !== SaharaCommand.HELLO_REQ) {
      throw new Error(`Unexpected Sahara command: 0x${cmd.toString(16)}. Expected HELLO_REQ (0x01).`);
    }

    const hello: SaharaHelloPacket = {
      command: cmd,
      length: view.getUint32(4, true),
      version: view.getUint32(8, true),
      minVersion: view.getUint32(12, true),
      maxPacketSize: view.getUint32(16, true),
      mode: view.getUint32(20, true),
      reserved: [view.getUint32(24, true), view.getUint32(28, true), view.getUint32(32, true), view.getUint32(36, true), view.getUint32(40, true), view.getUint32(44, true)],
    };

    // 2. Send HELLO_RESP
    const resp = this.pack([
      SaharaCommand.HELLO_RESP,
      48, // Length
      2,  // Version
      1,  // Min Version
      0,  // Status (Success)
      hello.mode,
      0, 0, 0, 0, 0, 0 // Reserved
    ]);

    await this.device.transferOut(this.endpointOut, resp as any);

    return hello;
  }

  /**
   * Execute Firehose Loader transfer
   */
  async uploadLoader(loaderBytes: Uint8Array, onProgress?: (pct: number) => void): Promise<void> {
    if (!this.device) throw new Error('USB Device not assigned');

    let isDone = false;
    while (!isDone) {
      const result = await this.device.transferIn(this.endpointIn, 1024);
      if (!result.data) break;

      const view = new DataView(result.data.buffer);
      const cmd = view.getUint32(0, true);

      if (cmd === SaharaCommand.READ_DATA) {
        const offset = view.getUint32(8, true);
        const length = view.getUint32(12, true);
        
        const chunk = loaderBytes.slice(offset, offset + length);
        await this.device.transferOut(this.endpointOut, chunk as any);
        
        if (onProgress) onProgress(Math.round((offset / loaderBytes.byteLength) * 100));
      } else if (cmd === SaharaCommand.END_TRANSFER) {
        const status = view.getUint32(8, true);
        if (status !== 0x00) {
          throw new Error(`Sahara loader transfer failed with status: 0x${status.toString(16)}`);
        }
        isDone = true;
      } else {
        throw new Error(`Unexpected Sahara state during upload: 0x${cmd.toString(16)}`);
      }
    }

    // Finalize
    await this.device.transferOut(this.endpointOut, this.pack([SaharaCommand.DONE, 12]) as any);
    const final = await this.device.transferIn(this.endpointIn, 1024);
    // Device should now be running the Firehose loader and waiting for XML commands
  }
}
