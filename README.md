# 🛡️ Project Aegis: AI-Nanny & Medical Ecosystem

> **An Intelligent Healthcare & Wearable Emergency Response Ecosystem**  
> Consolidating 24/7 AI-driven fall triage, smart medication adherence, zero-false-positive emergency dispatch, and instant Golden Hour medical summaries into a unified digital health platform.

---

## 📌 Problem Statement

1. **Delayed Emergency Response & High False Positives:** Traditional alert buttons require manual intervention during acute trauma, rendering them ineffective if a user loses consciousness. Conversely, existing automated fall detection systems trigger frequent false alarms, causing severe alarm fatigue among caregivers.
2. **Fragmented Medical Management Ecosystem:** Beyond emergency response, routine health tasks—such as adherence to complex medication schedules, identifying drug-to-drug interactions, locating nearby open pharmacies, and securing timely prescription refills—are dispersed across multiple disconnected platforms.
3. **Information Vacuum & Golden Hour Delays:** During emergency admissions, doctors lack instant access to critical health records (blood group, allergies, past surgeries, active prescriptions), leading to delayed or hazardous medical decisions[cite: 1, 2].

---

## 🌟 Core Pillars & Key Features

* **🤖 Aegis Wearable AI-Nanny (3-Stage Autonomous Triage):**
  1. *Kinematic Detection:* Identifies high-G impact forces ($>2.5\text{g}$) and sudden spatial orientation drops using 3-axis motion sensors[cite: 1, 2].
  2. *Physiological Validation:* Measures immediate post-impact pulse spikes and stress indicators via PPG sensors[cite: 1, 2].
  3. *Active Vocal Inquiry:* Executes an on-device voice query (*"Are you good?"*) using local voice synthesis[cite: 1, 2]. If the user fails to respond verbally within 30 seconds, Aegis automatically dispatches GPS coordinates, vital logs, and shock data to emergency contacts and nearby medical facilities[cite: 1, 2].
* **💊 Smart Medication Management & Adherence Tracking:** Automated, multi-channel medication reminders synchronized across mobile push notifications, audible chimes, and wearable haptic vibrations[cite: 1, 2]. Logs dose confirmations, tracks long-term adherence rates, alerts caregivers when doses are missed, and triggers low-supply automated pharmacy refill orders[cite: 1, 2].
* **🩺 AI Symptom & Medicine Recommendation Engine:** Conversational AI assistant that evaluates user-reported symptoms and provides safe Over-The-Counter (OTC) medication recommendations[cite: 1, 2]. Cross-references medical records and active prescriptions to prevent hazardous drug-to-drug interactions, escalating severe symptoms to video tele-consultations[cite: 1, 2].
* **📄 Instant Emergency Medical Passport (1-Tap Doctor Summary):** Generates a cloud-synced QR code broadcasting critical health data (blood type, allergies, active medications, chronic conditions, emergency contacts) allowing doctors to evaluate patients in seconds[cite: 1, 2].
* **🗺️ Hyper-Local Healthcare & E-Pharmacy Logistics Hub:** Integrated mapping and logistics hub that identifies nearby open pharmacies, diagnostic centers, and emergency rooms with real-time stock availability, enabling express doorstep delivery[cite: 1, 2].

---

## 📐 System Architecture

┌─────────────────────────────────────────────────────────────┐
│                 PROJECT AEGIS WEARABLE STRAP                │
│  - ESP32-S3 / ESP32-WROOM (Microcontroller)                 │
│  - MPU6050 / ADXL345 (3-Axis Kinematic Motion Engine)       │
│  - MAX30102 (PPG Biometric Pulse & SpO2 Sensor)             │
│  - INMP441 MEMS Microphone (30s Voice Response Capture)     │
│  - MAX98357A I2S + 8Ω Speaker (On-Device Voice Synthesis)   │
│  - SIM800L / Wi-Fi (Cellular & Network Telemetry Dispatch)   │
│  - 3.7V LiPo Battery + TP4056 Charge Module + SPDT Switch   │
└──────────────────────────────┬──────────────────────────────┘
│
Wi-Fi / HTTP POST / WebSockets / Blynk
│
v
┌─────────────────────────────────────────────────────────────┐
│                NODE.JS RELAY & BLYNK IOT HUB                │
│  - Real-Time WebSockets (Socket.io Engine)                  │
│  - Blynk Cloud Synchronization & Mobile Push Alerts         │
└──────────────────────────────┬──────────────────────────────┘
│
WebSocket Broadcast
│
v
┌─────────────────────────────────────────────────────────────┐
│                 REACT / VITE WEB DASHBOARD                  │
│  - Live Telemetry Dashboard & Biometric Waveforms           │
│  - Emergency Triage Modal Overlay                           │
│  - Sci-Fi Desktop AI Assistant Interface                    │
│  - 1-Tap Emergency Medical Passport (Doctor QR Summary)     │
└─────────────────────────────────────────────────────────────┘


---

## 🛠️ Hardware Specifications & Circuit Wiring

### Hardware Component Table

| Component Category | Hardware / Module Specification | Functional Role |
| :--- | :--- | :--- |
| **Main Microcontroller** | ESP32-S3 / ESP32-WROOM[cite: 1, 2] | Edge processing, threshold filtering, BLE/Wi-Fi stack[cite: 1, 2] |
| **Inertial Motion Sensor** | MPU6050 / ADXL345 (3-Axis)[cite: 1, 2] | Detects high-G impact forces & spatial orientation drops[cite: 1, 2] |
| **Biometric Sensor** | MAX30102 PPG Sensor[cite: 1, 2] | Monitors post-impact pulse spikes & physiological stress indicators[cite: 1, 2] |
| **Audio Output Module** | MAX98357A I2S + 8Ω Speaker[cite: 1, 2] | Local voice synthesis query execution ('Are you good?')[cite: 1, 2] |
| **Audio Input Module** | INMP441 MEMS Microphone[cite: 1, 2] | Voice recognition capture for verbal user safety confirmation[cite: 1, 2] |
| **Cellular Module** | SIM800L GSM Module | Emergency SMS dispatch & GPS transmission |
| **Power System** | 3.7V LiPo Battery + TP4056[cite: 1, 2] | Rechargeable, ultra-compact power unit with LDO regulation[cite: 1, 2] |

### Complete Pinout Scheme
