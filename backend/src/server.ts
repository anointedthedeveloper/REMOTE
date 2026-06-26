import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { initTVDiscovery } from './services/tvDiscovery';
import { TVConnection } from './services/tvConnection';
import { TVController } from './services/tvController';
import authRouter from './routes/auth';
import QRCode from 'qrcode';
import os from 'os';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);

// Generate QR Code for the local IP address
app.get('/api/qr', async (req, res) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    let localIp = 'localhost';
    
    // Find the local IPv4 address
    for (const name of Object.keys(networkInterfaces)) {
      for (const net of networkInterfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }

    const port = process.env.FRONTEND_PORT || 5173; // Vite default
    const url = `http://${localIp}:${port}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    res.json({ qrCodeDataUrl, url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Proxy for LG TV app icons (avoids CORS issues)
app.get('/api/tv-icon', async (req, res) => {
  const iconUrl = req.query.url as string;
  if (!iconUrl) return res.status(400).send('No URL');
  try {
    const response = await fetch(iconUrl, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return res.status(404).send('Not found');
    const buf = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch {
    res.status(500).send('Failed to fetch icon');
  }
});

// Initialize Services
const tvConnection = new TVConnection(io);
const tvController = new TVController(tvConnection);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // TV Control Events
  socket.on('tv:connect', (ip: string) => tvConnection.connect(ip));
  socket.on('tv:submitPin', (pin: string) => tvConnection.submitPin(pin));
  
  socket.on('tv:button', (buttonName: string) => tvController.sendButton(buttonName));
  socket.on('tv:mouseClick', () => tvController.sendMouseClick());
  socket.on('tv:mouseMove', ({ dx, dy, isDrag }: { dx: number, dy: number, isDrag?: boolean }) => tvController.sendMouseMove(dx, dy, isDrag));
  socket.on('tv:mouseScroll', ({ dx, dy }: { dx: number, dy: number }) => tvController.sendMouseScroll(dx, dy));
  
  socket.on('tv:keyboardInput', (text: string) => tvController.sendKeyboardInput(text));
  socket.on('tv:enterKey', () => tvController.sendEnterKey());

  socket.on('tv:launchApp', (appId: string) => tvController.launchApp(appId));
  
  socket.on('tv:switchInput', (inputId: string) => tvController.switchInput(inputId));
  socket.on('tv:turnOff', () => tvController.turnOff());
  socket.on('tv:setVolume', (volume: number) => tvController.setVolume(volume));

  // Queries
  socket.on('tv:getApps', async (callback) => {
    const apps = await tvController.getInstalledApps();
    callback(apps);
  });

  socket.on('tv:getInputs', async (callback) => {
    const inputs = await tvController.getInputs();
    callback(inputs);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Start TV Discovery
  initTVDiscovery(io);
});

export { io };
