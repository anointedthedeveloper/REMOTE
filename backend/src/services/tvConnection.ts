import fs from 'fs';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
// @ts-ignore
import lgtv2 from 'lgtv2';
import { LGPairingSession } from './tvPairing';

export class TVConnection {
  private tv: any = null;
  private io: SocketIOServer;
  private currentIp: string | null = null;
  public pointerSocket: any = null;
  private keysFilePath = path.join(__dirname, '..', '..', 'keys.json');
  private pairingSession: LGPairingSession | null = null;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  public async connect(ip: string) {
    // Clean up any existing connection
    if (this.tv) {
      this.tv.disconnect();
      this.tv = null;
    }
    if (this.pairingSession) {
      this.pairingSession.close();
      this.pairingSession = null;
    }

    this.currentIp = ip;
    console.log(`Attempting to connect to TV at ${ip}...`);

    // Check if we already have a saved client key for this TV
    const savedKey = this.getSavedKey();
    if (savedKey) {
      console.log('Found saved client key. Connecting directly...');
      this.connectWithKey(ip, savedKey);
    } else {
      console.log('No saved key. Starting PIN pairing session...');
      this.io.emit('tv:status', { status: 'connecting', ip });
      this.startPairing(ip);
    }
  }

  private startPairing(ip: string) {
    this.pairingSession = new LGPairingSession(ip, this.io, this.keysFilePath);

    this.pairingSession.start()
      .then((clientKey) => {
        console.log('Pairing successful! Connecting with new key...');
        this.pairingSession = null;
        this.connectWithKey(ip, clientKey);
      })
      .catch((err: any) => {
        console.error('Pairing failed:', err.message);
        this.pairingSession = null;
        this.io.emit('tv:status', { status: 'error', ip, message: err.message });
      });
  }

  public submitPin(pin: string) {
    if (this.pairingSession) {
      this.pairingSession.submitPin(pin);
    } else {
      console.error('submitPin called but no active pairing session');
    }
  }

  private connectWithKey(ip: string, clientKey: string) {
    this.tv = lgtv2({
      url: `ws://${ip}:3000`,
      timeout: 10000,
      reconnect: 30000,
      clientKey,         // Pass key directly so lgtv2 skips pairing
      saveKey: (key: string, cb: any) => {
        // We already save the key ourselves in LGPairingSession,
        // so just return successfully to prevent lgtv2 from crashing.
        if (cb) cb(null);
      }
    });

    this.tv.on('connect', () => {
      console.log('Connected to TV');
      this.io.emit('tv:status', { status: 'connected', ip });

      // Request pointer socket for mouse control
      this.tv.getSocket('ssap://com.webos.service.networkinput/getPointerInputSocket', (err: any, sock: any) => {
        if (!err) {
          this.pointerSocket = sock;
          console.log('Pointer socket established');
        } else {
          console.error('Failed to establish pointer socket:', err);
        }
      });

      this.subscribeToUpdates();
    });

    this.tv.on('prompt', () => {
      // This shouldn't happen since we pass a clientKey, but handle gracefully
      console.log('TV requested pairing prompt (key may be invalid). Restarting PIN pairing...');
      // Clear the saved key as it's invalid
      if (fs.existsSync(this.keysFilePath)) {
        fs.unlinkSync(this.keysFilePath);
      }
      this.tv.disconnect();
      this.tv = null;
      this.startPairing(ip);
    });

    this.tv.on('error', (err: any) => {
      console.log('TV Connection Error:', err?.message);
      this.io.emit('tv:status', { status: 'error', ip, message: err?.message });
    });

    this.tv.on('close', () => {
      console.log('TV Connection closed');
      this.pointerSocket = null;
      this.io.emit('tv:status', { status: 'disconnected', ip });
    });
  }

  private getSavedKey(): string | null {
    try {
      if (fs.existsSync(this.keysFilePath)) {
        const key = fs.readFileSync(this.keysFilePath).toString().trim();
        return key || null;
      }
    } catch (_) {}
    return null;
  }

  private subscribeToUpdates() {
    // Subscribe to volume changes
    this.tv.subscribe('ssap://audio/getVolume', (err: any, res: any) => {
      if (!err && res.changed) {
        this.io.emit('tv:volume', res);
      }
    });

    // Subscribe to foreground app changes
    this.tv.subscribe('ssap://com.webos.applicationManager/getForegroundAppInfo', (err: any, res: any) => {
      if (!err) {
        this.io.emit('tv:foregroundApp', res);
      }
    });
  }

  public getTV() {
    return this.tv;
  }
}
