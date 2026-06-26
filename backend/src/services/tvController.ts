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
      const tv = this.connection.getTV();
      if (tv && tv.connection) {
        tv.getSocket('ssap://com.webos.service.networkinput/getPointerInputSocket', (err: any, sock: any) => {
          if (err) {
            console.error('Fallback getSocket error:', err);
          } else {
            this.connection.pointerSocket = sock;
            sock.send(cmd);
          }
        });
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

  // ─── Volume ───────────────────────────────────────────────
  public setVolume(volume: number) {
    this.request('ssap://audio/setVolume', { volume: Math.max(0, Math.min(100, volume)) });
  }

  public volumeUp() {
    this.request('ssap://audio/volumeUp');
  }

  public volumeDown() {
    this.request('ssap://audio/volumeDown');
  }

  public setMute(mute: boolean) {
    this.request('ssap://audio/setMute', { mute });
  }

  // ─── Apps ─────────────────────────────────────────────────
  public launchApp(appId: string) {
    this.request('ssap://system.launcher/launch', { id: appId });
  }

  public async getInstalledApps(): Promise<any[]> {
    try {
      const res = await this.request('ssap://com.webos.applicationManager/listLaunchPoints');
      const apps = res.launchPoints || [];
      // Sort alphabetically, filter out system apps without titles
      return apps
        .filter((a: any) => a.title && a.title.trim())
        .sort((a: any, b: any) => a.title.localeCompare(b.title));
    } catch (e) {
      console.error('getInstalledApps error:', e);
      return [];
    }
  }

  // ─── Inputs ───────────────────────────────────────────────
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

  // ─── Power ────────────────────────────────────────────────
  public turnOff() {
    this.request('ssap://system/turnOff');
  }

  // ─── Screen ───────────────────────────────────────────────
  public screenOff() {
    this.request('ssap://com.webos.service.tvpower/power/turnOffScreen', { standbyMode: 'active' });
  }

  // ─── Picture Settings ─────────────────────────────────────
  public async getPictureSettings(): Promise<any> {
    try {
      const res = await this.request('ssap://settings/getSystemSettings', {
        category: 'picture',
        keys: ['pictureMode', 'backlight', 'brightness', 'contrast', 'sharpness', 'color']
      });
      return res.settings || {};
    } catch (e) {
      return {};
    }
  }

  public setPictureMode(mode: string) {
    this.request('ssap://settings/setSystemSettings', {
      category: 'picture',
      settings: { pictureMode: mode }
    });
  }

  public setBacklight(value: number) {
    this.request('ssap://settings/setSystemSettings', {
      category: 'picture',
      settings: { backlight: String(value) }
    });
  }

  // ─── Sound Settings ───────────────────────────────────────
  public async getSoundSettings(): Promise<any> {
    try {
      const res = await this.request('ssap://settings/getSystemSettings', {
        category: 'sound',
        keys: ['soundMode']
      });
      return res.settings || {};
    } catch (e) {
      return {};
    }
  }

  public setSoundMode(mode: string) {
    this.request('ssap://settings/setSystemSettings', {
      category: 'sound',
      settings: { soundMode: mode }
    });
  }

  // ─── Caption / Subtitles ──────────────────────────────────
  public toggleCaption() {
    // Toggle via CC button
    this.sendButton('CC');
  }

  // ─── Channel / TV Info ────────────────────────────────────
  public async getCurrentChannel(): Promise<any> {
    try {
      return await this.request('ssap://tv/getCurrentChannel');
    } catch (e) {
      return {};
    }
  }

  public openChannelMenu() {
    this.sendButton('LIST');
  }

  // ─── Media Info ───────────────────────────────────────────
  public async getMediaInfo(): Promise<any> {
    try {
      return await this.request('ssap://media.controls/getMediaMetaData');
    } catch (e) {
      return {};
    }
  }

  // ─── 3D ───────────────────────────────────────────────────
  public toggle3D() {
    this.sendButton('3D_MODE');
  }

  // ─── Color buttons ────────────────────────────────────────
  public colorButton(color: 'RED' | 'GREEN' | 'YELLOW' | 'BLUE') {
    this.sendButton(color);
  }

  // ─── TV Guide ─────────────────────────────────────────────
  public openGuide() {
    this.sendButton('GUIDE');
  }

  // ─── Aspect Ratio ─────────────────────────────────────────
  public cycleAspectRatio() {
    this.sendButton('RATIO');
  }

  // ─── Energy Saving ────────────────────────────────────────
  public openEnergySaving() {
    this.request('ssap://settings/getSystemSettings', {
      category: 'picture',
      keys: ['energySaving']
    });
  }

  // ─── Notifications ────────────────────────────────────────
  public showToast(message: string) {
    this.request('ssap://system.notifications/createToast', { message });
  }

  // ─── Magic Remote / Pointer sensitivity ───────────────────
  public setPointerVisibility(visible: boolean) {
    this.request('ssap://com.webos.service.networkinput/setCurrentMousePointerVisible', { visible });
  }
}
