import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const pinFilePath = path.join(__dirname, '..', '..', 'pin.json');

// Get whether a PIN is set
router.get('/status', (req, res) => {
  const isSet = fs.existsSync(pinFilePath);
  res.json({ isPinSet: isSet });
});

// Set PIN for the first time
router.post('/setup', (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length !== 4) {
    return res.status(400).json({ error: 'Invalid PIN. Must be 4 digits.' });
  }

  if (fs.existsSync(pinFilePath)) {
    return res.status(400).json({ error: 'PIN is already set.' });
  }

  fs.writeFileSync(pinFilePath, JSON.stringify({ pin }));
  res.json({ success: true });
});

// Verify PIN
router.post('/verify', (req, res) => {
  const { pin } = req.body;
  
  if (!fs.existsSync(pinFilePath)) {
    return res.status(400).json({ error: 'PIN not setup yet.' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(pinFilePath, 'utf-8'));
    if (data.pin === pin) {
      res.json({ success: true, token: 'valid-token' }); // Basic token for simplicity
    } else {
      res.status(401).json({ error: 'Incorrect PIN' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error reading PIN data.' });
  }
});

export default router;
