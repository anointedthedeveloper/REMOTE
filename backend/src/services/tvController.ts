import { TVConnection } from './tvConnection';

export class TVController {
  private connection: TVConnection;

  constructor(connection: TVConnection) {
    this.connection = connection;
  }

  private sendPointerCommand(cmd: string) {
    const socket = this.connection.pointerSocket;
    if (socket) {
      socket.send(cmd);
    } else {
      console.warn('Pointer socket not ready yet, queuing command:', cmd.trim().split('\n')[0]);
      // If we really want, we could queue it. For now, let's just attempt to get it.
      const tv = this.connection.getTV();
      if (tv && tv.connection) {
        tv.getSocket('ssap://com.webos.service.networkinput/getPointerInputSocket', (err: any, sock: any) => {
          if (err) {
            console.error('Fallback getSocket error:', err);
          } else {
            console.log('Fallback pointer socket established');
            this.connection.pointerSocket = sock;
            sock.send(cmd);
          }
        });
      } else {
        console.warn('TV connection not active, cannot get pointer socket');
      }
    }
  }

  public sendButton(buttonName: string) {
    this.sendPointerCommand(`button\nname:${buttonName}\n\n`);
  }

  public sendMouseClick() {
    this.sendPointerCommand('click\n\n');
  }

  public sendMouseMove(dx: number, dy: number, isDrag: boolean = false) {
    this.sendPointerCommand(`move\ndx:${dx}\ndy:${dy}\ndown:${isDrag ? 1 : 0}\n\n`);
  }

  public sendMouseScroll(dx: number, dy: number) {
    this.sendPointerCommand(`scroll\ndx:${dx}\ndy:${dy}\n\n`);
  }

  public sendKeyboardInput(text: string) {
    // Some LG TVs accept this payload structure
    this.request('ssap://com.webos.service.ime/insertText', { text, replace: 0 });
  }

  public sendEnterKey() {
    this.request('ssap://com.webos.service.ime/sendEnterKey');
  }

  public request(uri: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const tv = this.connection.getTV();
      if (tv) {
        tv.request(uri, payload || {}, (err: any, res: any) => {
          if (err) {
            console.error(`Error requesting ${uri}:`, err);
            reject(err);
          } else {
            resolve(res);
          }
        });
      } else {
        reject(new Error('TV not connected'));
      }
    });
  }

  public launchApp(appId: string) {
    this.request('ssap://system.launcher/launch', { id: appId });
  }

  public async getInstalledApps(): Promise<any[]> {
    try {
      const res = await this.request('ssap://com.webos.applicationManager/listLaunchPoints');
      return res.launchPoints || [];
    } catch (e) {
      return [];
    }
  }

  public async getInputs(): Promise<any[]> {
    try {
      const res = await this.request('ssap://tv/getExternalInputList');
      return res.devices || [];
    } catch (e) {
      return [];
    }
  }

  public switchInput(inputId: string) {
    this.request('ssap://tv/switchInput', { inputId });
  }

  public async turnOff() {
    this.request('ssap://system/turnOff');
  }
}
