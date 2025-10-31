const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
listDevices: () => ipcRenderer.invoke('list-devices'),
startCapture: (deviceId) => ipcRenderer.invoke('start-capture', { deviceId }),
stopCapture: () => ipcRenderer.invoke('stop-capture'),
selectDeviceAndRestart: (deviceId) => ipcRenderer.invoke('select-device-and-restart', deviceId),
processText: (text, backendUrl) => ipcRenderer.invoke('process-text', { text, backendUrl }),
onTranscript: (cb) => ipcRenderer.on('transcript', (ev, data) => cb(data)),
onStatus: (cb) => ipcRenderer.on('status', (ev, data) => cb(data)),
onDeviceSelected: (cb) => ipcRenderer.on('device-selected', (ev, data) => cb(data)),
onCollectedFinal: (cb) => ipcRenderer.on('collected-final', (ev, data) => cb(data)),
onCollectedAll: (cb) => ipcRenderer.on('collected-all', (ev, data) => cb(data))
});