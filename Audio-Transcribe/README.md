# Electron System Transcriber (Windows)

This app captures system audio (WASAPI loopback / Stereo Mix / VB-Cable), streams to Google Speech-to-Text streaming API, and shows live transcription in an overlay.

## Prerequisites (Windows 11)
1. Node 16+ / npm installed.
2. Visual Studio Build Tools (C++), Python on PATH — required to build `naudiodon` native addon. If you don't have build tools, install "Desktop development with C++" workload via Visual Studio Installer.
3. Google Cloud project with **Speech-to-Text API enabled** and a **service account JSON** key.

## Google Cloud setup
1. Create a Google Cloud project and enable **Speech-to-Text API**.
2. Create a **service account** with `roles/cloudspeech.client` and download the JSON key. Save the file locally (e.g., `C:\keys\gcloud-speech-key.json`).
3. Set environment variable:
   ```powershell
   setx GOOGLE_APPLICATION_CREDENTIALS "C:\keys\gcloud-speech-key.json"
