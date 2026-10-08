import { DeviceModelProfile } from './model-database';

export interface LoaderFile {
  name: string;
  size: string;
  type: 'Firehose' | 'DA' | 'Scatter' | 'Cert';
  hwid: string;
  url: string;
}

class CloudLoaderService {
  private apiLatency: number = 42;

  async fetchLoadersForModel(hwid: string): Promise<LoaderFile[]> {
    // Simulate API call to global loader repository
    await new Promise(r => setTimeout(r, 600));
    
    // Mock data based on common HWIDs
    const loaders: LoaderFile[] = [
      {
        name: `prog_firehose_ddr_${hwid}.elf`,
        size: '840 KB',
        type: 'Firehose',
        hwid,
        url: '#'
      },
      {
        name: `MTK_AllInOne_DA_${hwid}.bin`,
        size: '2.4 MB',
        type: 'DA',
        hwid,
        url: '#'
      },
      {
        name: `auth_sv5_${hwid}.auth`,
        size: '12 KB',
        type: 'Cert',
        hwid,
        url: '#'
      }
    ];

    return loaders;
  }

  getLatency(): string {
    return `${this.apiLatency + Math.floor(Math.random() * 10)}ms`;
  }

  async verifyAuthToken(token: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 1200));
    return token.length > 10;
  }
}

export const cloudLoader = new CloudLoaderService();
