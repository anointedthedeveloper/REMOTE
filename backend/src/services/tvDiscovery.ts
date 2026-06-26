// @ts-ignore
import { Client } from 'node-ssdp';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { Socket } from 'socket.io';

export interface DiscoveredTV {
  ip: string;
  name: string;
  modelName?: string;
}

const discoveredTVs = new Map<string, DiscoveredTV>();

// Probe a device IP to see if it's an LG webOS TV by hitting its UPnP device description
function probeDevice(ip: string, location: string, io: SocketIOServer) {
  try {
    const url = new URL(location);
    const options = {
      hostname: url.hostname,
      port: parseInt(url.port) || 80,
      path: url.pathname,
      method: 'GET',
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const isLg = data.toLowerCase().includes('lg') || data.toLowerCase().includes('webos');
        const modelMatch = data.match(/<modelName>([^<]+)<\/modelName>/i);
        const friendlyMatch = data.match(/<friendlyName>([^<]+)<\/friendlyName>/i);

        if (isLg && !discoveredTVs.has(ip)) {
          console.log(`Discovered LG TV at ${ip}`);
          const tvInfo: DiscoveredTV = {
            ip,
            name: friendlyMatch ? friendlyMatch[1] : `LG TV (${ip})`,
            modelName: modelMatch ? modelMatch[1] : undefined,
          };
          discoveredTVs.set(ip, tvInfo);
          io.emit('tv:discovered', Array.from(discoveredTVs.values()));
        }
      });
    });

    req.on('error', () => {}); // Silently ignore non-TV devices
    req.on('timeout', () => req.destroy());
    req.end();
  } catch (_) {}
}

export function initTVDiscovery(io: SocketIOServer) {
  const ssdpClient = new Client();

  ssdpClient.on('response', (headers: any, _statusCode: any, rinfo: any) => {
    const location: string = headers['LOCATION'] || headers['location'] || '';
    const ip: string = rinfo.address;

    if (!location) return;

    // Probe all SSDP-responding devices; filter in probeDevice by LG/webOS content
    probeDevice(ip, location, io);
  });

  const searchForTVs = () => {
    // Search multiple service types to maximize discovery chances
    ssdpClient.search('urn:schemas-upnp-org:device:MediaRenderer:1');
    ssdpClient.search('urn:schemas-upnp-org:device:MediaServer:1');
    ssdpClient.search('ssdp:all');
  };

  searchForTVs();
  // Re-scan every 20 seconds
  setInterval(searchForTVs, 20000);

  // When a new frontend client connects, send already-discovered TVs immediately
  io.on('connection', (socket: Socket) => {
    if (discoveredTVs.size > 0) {
      socket.emit('tv:discovered', Array.from(discoveredTVs.values()));
    }
  });
}

export function getDiscoveredTVs() {
  return Array.from(discoveredTVs.values());
}
