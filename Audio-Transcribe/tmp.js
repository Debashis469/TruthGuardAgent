// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const portAudio = require('naudiodon');
const fs = require('fs');

// Google Speech client
// NOTE: Make sure GOOGLE_APPLICATION_CREDENTIALS env var points to the JSON key file
const speech = require('@google-cloud/speech');

console.log('App starting...');

// Helpful diagnostics for naudiodon
try {
  console.log('naudiodon typeof:', typeof portAudio);
  if (portAudio && typeof portAudio === 'object') {
    console.log('naudiodon keys:', Object.keys(portAudio));
    // If it exposes a version property, show it
    if (portAudio.version) console.log('naudiodon version:', portAudio.version);
    // show sample format constants if present
    if (portAudio.SampleFormat16Bit !== undefined) {
      console.log('SampleFormat16Bit found (value):', portAudio.SampleFormat16Bit);
    }
  }
} catch (e) {
  console.warn('Could not inspect naudiodon object', e);
}

// Show whether Google credentials env var is set and whether the file exists (do NOT print file contents)
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (credPath) {
  try {
    const stat = fs.statSync(credPath);
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', credPath, `(exists, ${stat.size} bytes)`);
  } catch (e) {
    console.warn('GOOGLE_APPLICATION_CREDENTIALS is set but file not found or unreadable:', credPath, e.message);
  }
} else {
  console.warn('GOOGLE_APPLICATION_CREDENTIALS is NOT SET in environment.');
}

let win;
let ai = null; // AudioIO instance from naudiodon
let recognizerStream = null;
let client = null;
let capturing = false;

// default sample rate - we'll attempt to use 48000 which most loopback devices support
let TARGET_SAMPLE_RATE = 48000;
const CHANNELS = 1;

// create overlay window
function createWindow() {
  win = new BrowserWindow({
    width: 720,
    height: 120,
    x: 40,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('renderer.html');
  // win.webContents.openDevTools(); // uncomment for debugging
}

// device helpers
function listDevices() {
  try {
    return portAudio.getDevices();
  } catch (err) {
    console.error('Error listing devices', err);
    return [];
  }
}

function findLoopbackDeviceIndex() {
  const devices = listDevices();
  for (let i = 0; i < devices.length; i++) {
    const d = devices[i];
    const name = (d.name || '').toLowerCase();
    if (d.maxInputChannels > 0 && (name.includes('loopback') || name.includes('stereo mix') || name.includes('cable') || name.includes('monitor') || name.includes('output'))) {
      return i;
    }
  }
  for (let i = 0; i < devices.length; i++) {
    if (devices[i].maxInputChannels > 0) return i;
  }
  return null;
}

// create Google Speech client (only if credentials path exists)
function createGoogleClient() {
  if (client) return client;

  const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!cred) {
    console.warn('Google credentials env var not set; will not create SpeechClient.');
    return null;
  }
  try {
    if (!fs.existsSync(cred)) {
      console.warn('Google credentials file does not exist at:', cred);
      return null;
    }
  } catch (e) {
    console.warn('Error checking credentials file:', e);
    return null;
  }

  try {
    client = new speech.SpeechClient();
    console.log('Created Google Speech client');
    return client;
  } catch (err) {
    console.error('Failed to create Google client. Ensure GOOGLE_APPLICATION_CREDENTIALS is set and valid.', err);
    return null;
  }
}

// start streamingRecognize
function startRecognizerStream() {
  const googleClient = createGoogleClient();
  if (!googleClient) {
    if (win && win.webContents) win.webContents.send('status', 'Google credentials missing — set GOOGLE_APPLICATION_CREDENTIALS');
    return null;
  }

  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: TARGET_SAMPLE_RATE,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
      audioChannelCount: CHANNELS
    },
    interimResults: true
  };

  const stream = googleClient.streamingRecognize(request)
    .on('error', (err) => {
      console.error('Google STT stream error', err);
      if (win && win.webContents) win.webContents.send('status', 'Google STT error: ' + (err && err.message ? err.message : String(err)));
      // If credentials error, log it
      if (err && err.code === 'ENOTFOUND') console.warn('Network/ENOTFOUND while connecting to Google STT.');
    })
    .on('data', (data) => {
      if (data.results && data.results[0]) {
        const result = data.results[0];
        const isFinal = result.isFinal || false;
        const text = (result.alternatives && result.alternatives[0] && result.alternatives[0].transcript) ? result.alternatives[0].transcript : '';
        if (win && win.webContents) {
          if (isFinal) win.webContents.send('transcript', { type: 'final', text });
          else win.webContents.send('transcript', { type: 'partial', text });
        }
      }
    });

  return stream;
}

// start capture
function startCapture(deviceIndex = null) {
  if (capturing) {
    console.warn('Already capturing');
    if (win && win.webContents) win.webContents.send('status', 'Already capturing');
    return;
  }

  const devices = listDevices();
  if (!deviceIndex) deviceIndex = findLoopbackDeviceIndex();
  if (deviceIndex === null) {
    if (win && win.webContents) win.webContents.send('status', 'No input device found. Open Settings and choose device.');
    return;
  }

  const chosen = devices[deviceIndex];
  console.log('Chosen device:', deviceIndex, chosen ? chosen.name : 'unknown');

  if (chosen && chosen.defaultSampleRate) {
    TARGET_SAMPLE_RATE = chosen.defaultSampleRate >= 48000 ? 48000 : Math.floor(chosen.defaultSampleRate);
    console.log('Using sample rate:', TARGET_SAMPLE_RATE);
  }

  // create Google stream (if credentials available)
  recognizerStream = startRecognizerStream();
  if (!recognizerStream) {
    // recognizer stream not created because of missing creds; still allow local capture if desired
    // but for now we abort capture because app is intended to stream to Google
    console.warn('Recognizer stream not created — aborting capture.');
    return;
  }

  // build AudioIO input options for naudiodon
  const aiOptions = {
    inOptions: {
      deviceId: deviceIndex,
      channelCount: CHANNELS,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: TARGET_SAMPLE_RATE,
      closeOnError: true,
      // framesPerBuffer is not always supported as a named option, but we attempt to set a reasonable buffer
      // highWaterMark controls internal stream buffering in Node
    },
    // helpful: set a moderate highWaterMark in stream options
    highWaterMark: 4096
  };

  try {
  ai = new portAudio.AudioIO({
    inOptions: {
      channelCount: CHANNELS,
      sampleFormat: portAudio.SampleFormat16Bit,
      sampleRate: TARGET_SAMPLE_RATE,
      deviceId: deviceIndex,
      closeOnError: true
    }
  });
} catch (err) {
  console.error('Failed to create AudioIO (naudiodon)', err);
  win.webContents.send('status', 'Failed to open audio input: ' + err.message);
  if (recognizerStream) {
    try { recognizerStream.end(); } catch (e) {}
    recognizerStream = null;
  }
  return;
}

  // handle data from audio device and forward to Google stream
  ai.on('data', (chunk) => {
    if (!recognizerStream) return;
    try {
      // The gRPC stream accepts raw binary chunks for audioContent in many examples.
      // For the Node client the common pattern that works is writing the raw bytes directly.
      recognizerStream.write(chunk);
    } catch (e) {
      console.error('Failed to write audio chunk to recognizerStream', e);
    }
  });

  ai.on('error', (err) => {
    console.error('AudioIO error', err);
    if (win && win.webContents) win.webContents.send('status', 'Audio input error: ' + (err && err.message ? err.message : String(err)));
  });

  try {
    ai.start();
    capturing = true;
    if (win && win.webContents) {
      win.webContents.send('status', 'Capturing');
      win.webContents.send('device-selected', { deviceId: deviceIndex, name: chosen ? chosen.name : String(deviceIndex) });
    }
    console.log('Capture started');
  } catch (e) {
    console.error('Error starting AudioIO', e);
    if (win && win.webContents) win.webContents.send('status', 'Failed to start capture: ' + (e && e.message ? e.message : String(e)));
    try { ai.quit(); } catch (ee) {}
    ai = null;
    capturing = false;
    if (recognizerStream) { try { recognizerStream.end(); } catch (err) {} recognizerStream = null; }
  }
}

function stopCapture() {
  if (!capturing && !ai && !recognizerStream) {
    return;
  }
  try {
    if (ai) {
      try {
        ai.stop();
      } catch (e) {
        console.warn('ai.stop() threw', e);
      }
      try {
        ai.quit();
      } catch (e) {
        // quit may not exist depending on build; ignore
      }
      ai = null;
    }
    if (recognizerStream) {
      try {
        recognizerStream.end();
      } catch (e) {
        console.warn('recognizerStream.end() threw', e);
      }
      recognizerStream = null;
    }
  } catch (err) {
    console.error('Error stopping capture', err);
  } finally {
    capturing = false;
    if (win && win.webContents) win.webContents.send('status', 'Stopped');
    console.log('Capture stopped');
  }
}

// IPC handlers
ipcMain.handle('list-devices', async () => {
  return listDevices();
});
ipcMain.handle('start-capture', async (ev, { deviceId }) => {
  startCapture(deviceId);
  return { ok: true };
});
ipcMain.handle('stop-capture', async () => {
  stopCapture();
  return { ok: true };
});
ipcMain.handle('select-device-and-restart', async (ev, deviceId) => {
  stopCapture();
  startCapture(deviceId);
  return { ok: true };
});

app.whenReady().then(() => {
  createWindow();
  // create Google client eagerly (will read credentials from env var) -- optional
  createGoogleClient();
});

app.on('window-all-closed', () => {
  stopCapture();
  app.quit();
});
