# 🛡️ AegisOne — Emergency Triage & Security Case Management Platform

AegisOne is a production-ready, full-stack emergency response, telemetry analysis, and security case triage platform built for high-risk patient monitoring, kinematic fall detection, and forensic evidence generation.

---

## 🌟 Key Features

### 1. 🛡️ Security Case Management & Triage Hub
- **Incident Hub**: Centralized triage dashboard for telemetry alerts (e.g., high-G impacts, post-kinematic unresponsiveness, acute arrhythmia, panic SOS triggers).
- **Role-Aware Filters**: Role scopes supporting **All**, **User**, **Admin**, **Authority**, **Hospital**, and **Investigator** with dynamic, scoped record counts.
- **Investigation Status Labels**: Mark incident cases as `Needs Review`, `Suspected`, or `Verified`.
- **Persistent Investigator Notes**: Append timestamped notes with custom author names and roles that persist across case switches.
- **Model Integrity Protection**: Displays a prominent **"Detection Model Unchanged / Unaltered"** audit stamp ensuring reviewer notes and status updates function strictly as an annotation/audit layer over raw telemetry without altering underlying detection weights.
- **Multi-Format Evidence Brief Exporter**: Export compact evidence packages in **.PDF**, **.TXT**, or **.JSON** formats containing Case IDs, timestamps, model confidence scores, hardware device hashes, vitals, kinematic vectors, and full investigator notes.

---

### 2. ⚡ Live Emergency Triage (Schema 1)
- **Real-Time Telemetry Processing**: Continuous monitoring of tri-axial acceleration (G-Force), PPG pulse telemetry (BPM), SpO2 oxygen levels, and GPS velocity vectors.
- **Automated AI Triage Engine**: Instant computation of severity scores and emergency level classification (`LOW_RISK`, `MODERATE_OBSERVATION`, or `CRITICAL_EMERGENCY_DISPATCH`).
- **Emergency Dispatch Overlay**: High-visibility golden-hour alert modal with active countdown timers, voice prompt responsiveness checks, and 1-click EMS dispatch routing.

---

### 3. 📄 Golden-Hour Critical Report Engine (Schema 6)
- **Medical Dispatch Briefs**: Standardized, ER-ready clinical summaries designed for paramedics and emergency department physicians.
- **PDF Report Generation**: Download official Golden-Hour Emergency Briefs with complete diagnostic summaries, drug contraindication alerts, and emergency contact details.

---

### 4. 🪪 Emergency Passport & QR Medical ID
- **Instant Medical ID**: Quick access to blood group, primary language, chronic conditions, known allergies, current medications, and emergency contacts.
- **Scannable QR Code**: Generates an on-screen QR code for first responders to instantly view essential patient passport details offline.

---

### 5. 👤 Patient Profile Manager & Supabase Cloud Sync
- **Medical Profile Management**: Full editing interface for personal, demographic, and clinical data.
- **Supabase Cloud Sync**: Real-time persistent syncing across three PostgreSQL tables:
  - `patient_profiles`: Stores patient demographics and clinical profiles.
  - `telemetry_logs`: Historical kinematic and vital sensor readings.
  - `triage_history`: Records generated triage events and emergency dispatches.
- **Preset Persona Switcher**: Quickly switch between pre-configured patient profiles (Senior Citizen, Cardiac Telemetry, Active Athlete) or authenticate via Supabase Auth.

---

### 6. 🔌 API Schema Explorer
- **Interactive REST Documentation**: Inspect structured JSON schemas for Schemas 1 through 6.
- **cURL Code Generator**: Copy production-ready cURL commands and payload examples directly from the UI.

---

### 7. 📱 Mobile Application Deployment (Capacitor)
- Pre-configured with **@capacitor/core**, **@capacitor/android**, and **@capacitor/ios** to package the web dashboard directly into native Android (`.apk`/`.aab`) and iOS applications.

---

## 🗺️ How to Navigate & Access Features in the Application

All primary features are accessible via the **Left Sidebar Navigation Menu**:

| Sidebar Item | Icon | Description | How to Access |
| :--- | :--- | :--- | :--- |
| **Emergency Triage** | `Activity` | Live telemetry dashboard, fall detection triggers, and telemetry telemetry controls. | Click **Emergency Triage** under *Triage & Operations*. |
| **Golden-Hour Report** | `ShieldAlert` | Emergency medical dispatch report generator with PDF export. | Click **Golden-Hour Report** under *Triage & Operations*. |
| **Security Case Hub** | `ShieldCheck` | Incident triage hub, role filters, status updates, investigator notes, and **PDF / TXT / JSON evidence brief downloader**. | Click **Security Case Hub** under *Triage & Operations*. |
| **Emergency Passport** | `Smartphone` | Offline QR Medical ID card for first responders. | Click **Emergency Passport** under *Patient & Profile*. |
| **Patient Profile** | `User` | Edit medical profile, update contacts, and sync to Supabase database. | Click **Patient Profile** under *Patient & Profile*. |
| **API Explorer** | `Terminal` | REST API payload schemas, cURL code snippets, and integration docs. | Click **API Explorer** under *Developer & System*. |
| **Cloud Sync Status** | `Database` | Check Supabase PostgreSQL connection status and demo profile switcher. | Click the **Cloud Database** badge in the top-right header or bottom left avatar. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Icons & UI**: Lucide React (`lucide-react`)
- **PDF Generation**: `jspdf`
- **Database & Auth**: Supabase (PostgreSQL, Real-time Client, Supabase Auth)
- **Mobile Runtime**: Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/aegis-one.git
   cd aegis-one
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file at the project root:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📲 Building for Mobile (Android & iOS)

AegisOne is equipped with Capacitor scripts for native packaging:

```bash
# 1. Build web production assets
npm run build

# 2. Add Android or iOS native platform
npm run cap:add:android
npm run cap:add:ios

# 3. Sync built assets to native projects
npm run cap:sync

# 4. Open in Android Studio or Xcode
npm run cap:open:android
npm run cap:open:ios
```

---

## 🗄️ Database Schema Setup (Supabase / PostgreSQL)

If initializing your own Supabase project, execute the following DDL script in the **Supabase SQL Editor**:

```sql
-- 1. Patient Profiles Table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  primary_language TEXT,
  chronic_conditions TEXT[],
  known_allergies TEXT[],
  current_medications TEXT[],
  emergency_contacts JSONB[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Telemetry Logs Table
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  heart_rate_bpm INTEGER,
  spo2_percent INTEGER,
  g_force_magnitude NUMERIC,
  speed_kmh NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC
);

-- 3. Triage History Table
CREATE TABLE IF NOT EXISTS public.triage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  emergency_level TEXT,
  triage_score NUMERIC,
  summary TEXT,
  kinematic_vector TEXT,
  vital_indicators TEXT[]
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_history ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read and Write Policies for Demo
CREATE POLICY "Allow public read access" ON public.patient_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access" ON public.patient_profiles FOR ALL USING (true);
CREATE POLICY "Allow public telemetry logs" ON public.telemetry_logs FOR ALL USING (true);
CREATE POLICY "Allow public triage history" ON public.triage_history FOR ALL USING (true);
```
## 📐 Hardware Architecture & Circuit Design

AegisOne bridges on-device TinyML fall classification hardware directly with cloud web platforms. The hardware strap runs an autonomous 3-stage triage pipeline:
1. **Kinematic Detection**: Monitors high-G impact vectors ($>2.5\text{g}$) and orientation drops via a 3-axis motion engine.
2. **Physiological Validation**: Measures immediate post-impact pulse spikes and stress indicators via PPG biometrics.
3. **Active Vocal Inquiry**: Executes on-device voice queries (*"Are you good?"*). If no vocal cancellation is captured within 30 seconds, it dispatches telemetry to the cloud and emergency contacts.

┌─────────────────────────────────────────────────────────────┐
│                   AEGIS WEARABLE HARDWARE                   │
│  - ESP32-S3 / ESP32-WROOM Microcontroller                   │
│  - MPU6050 (3-Axis Kinematic Motion Engine)                 │
│  - MAX30102 (PPG Biometric Pulse & SpO2 Sensor)             │
│  - INMP441 / Analog Microphone (30s Voice Response Capture) │
│  - Active Buzzer (5V Audible Triage Beeper)                 │
│  - SIM800L (Cellular SMS & GPS Telemetry Backup)            │
│  - 3.7V LiPo Battery + TP4056 + SPDT Power Switch           │
└──────────────────────────────┬──────────────────────────────┘
│
Wi-Fi / HTTP POST / WebSockets / Blynk IoT
│
v
┌─────────────────────────────────────────────────────────────┐
│                 AEGISONE CLOUD & BLYNK HUB                  │
│  - Node.js WebSocket Relay Server (Socket.io)               │
│  - Blynk IoT Cloud Engine (Mobile Push & Stream Sync)       │
│  - Supabase PostgreSQL Database                             │
└──────────────────────────────┬──────────────────────────────┘
│
Real-time Broadcast
│
v
┌─────────────────────────────────────────────────────────────┐
│                  AEGISONE WEB DASHBOARD                     │
│  - Live Telemetry Dashboard & Biometric Radar               │
│  - Security Case Hub & Evidence Brief Exporter (.PDF/.TXT)  │
│  - Emergency Passport & Golden-Hour Clinical Reports        │
└─────────────────────────────────────────────────────────────┘


### Hardware Component Table

| Component Category | Hardware Specification | Functional Role |
| :--- | :--- | :--- |
| **Main Microcontroller** | ESP32-S3 / ESP32-WROOM | Edge processing, TinyML classification, Wi-Fi/BLE stack |
| **Inertial Motion Sensor** | MPU6050 (3-Axis Accelerometer/Gyro) | Detects high-G impact forces & spatial orientation drops |
| **Biometric Sensor** | MAX30102 PPG Sensor | Monitors post-impact pulse spikes & physiological stress indicators |
| **Audio Input Module** | INMP441 MEMS / KY-037 Analog Mic | Voice recognition capture for verbal user safety confirmation |
| **Audible Alert** | 5V Active Buzzer | Local audible triage beeping during 30s countdown |
| **Cellular Module** | SIM800L GSM Module | Emergency SMS dispatch & GPS coordinate fallback |
| **Power Subsystem** | 3.7V LiPo Battery + TP4056 | Rechargeable power unit with DW01A protection & switch |

### Pinout Connections


[MPU6050 Motion Sensor]
- VCC  ---> 3.3V
- GND  ---> Common GND
- SDA  ---> GPIO 21
- SCL  ---> GPIO 22

[INMP441 MEMS Microphone]
- VDD  ---> 3.3V
- GND  ---> Common GND
- WS   ---> GPIO 14
- SCK  ---> GPIO 32
- SD   ---> GPIO 33

[Active Buzzer & Analog Sound Sensor]
- BUZZER (+) ---> GPIO 25
- ANALOG MIC ---> GPIO 34 (ADC1)

[SIM800L GSM Module]
- VCC  ---> External 3.7V–4.2V Supply (LiPo / Buck Regulator)
- GND  ---> Common GND
- TX   ---> GPIO 16 (RX2)
- RX   ---> GPIO 17 (TX2)

[TP4056 Power System]
- B+   ---> LiPo Battery (+)
- B-   ---> LiPo Battery (-)
- OUT- ---> Common System GND
- OUT+ ---> SPDT Switch (Pin 2) ---> ESP32 VIN / 5V

## 🌐 Blynk IoT Integration

AegisOne natively integrates with **Blynk IoT** to deliver real-time hardware status synchronization, live G-force telemetry streaming, and instant mobile push notifications to iOS and Android smartphones without requiring manual port forwarding.

---

### 1. Blynk Datastream Mapping

Configure the following Virtual Pins in your **[Blynk IoT Console](https://blynk.cloud)** under **Developer Zone → Templates → Datastreams**:

| Datastream Name | Pin | Data Type | Range / Format | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **System Status** | `V0` | String | `NORMAL` / `🚨 FALL DETECTED!` | Displays current hardware triage state |
| **Peak Impact ($G$-Force)** | `V1` | Double | `0.0` to `16.0` | Real-time acceleration magnitude gauge |
| **Heart Rate (BPM)** | `V2` | Integer | `0` to `220` | Pulse reading from PPG sensor |
| **Remote Silence Cancel** | `V3` | Integer | `0` or `1` | Mobile app button to remote-cancel alarm |

---

### 2. Mobile Push Notification Setup

1. In your Blynk template, navigate to the **Events** tab.
2. Click **Create New Event** and set the Event Name to `fall_alert`.
3. Set the Title to `🚨 Emergency: Fall Detected!`.
4. Enable **Send event to Notifications** to trigger instant smartphone push alerts upon high-G impact events.

---

### 3. ESP32 Firmware Implementation

Add your Blynk credentials at the top of your main ESP32 sketch file (`aegis_main.ino`):

```cpp
// ⚠️ MUST BE AT THE VERY TOP OF THE FILE BEFORE ANY INCLUDES!
#define BLYNK_TEMPLATE_ID   "YOUR_BLYNK_TEMPLATE_ID"
#define BLYNK_TEMPLATE_NAME "Project Aegis"
#define BLYNK_AUTH_TOKEN    "YOUR_BLYNK_AUTH_TOKEN"

#define BLYNK_PRINT Serial

#include <Wire.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>

// Wi-Fi Credentials
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";

// Global State
bool remote_silence_requested = false;

// Blynk Virtual Pin 3: Remote Cancel Button Handler
BLYNK_WRITE(V3) {
    int buttonValue = param.asInt();
    if (buttonValue == 1) {
        remote_silence_requested = true;
        Serial.println("📱 Remote Silence Command Received from Blynk App!");
    }
}

void setup() {
    Serial.begin(115200);
    
    // Connect to Blynk Cloud
    Serial.println("🌐 Connecting to Blynk IoT...");
    Blynk.begin(BLYNK_AUTH_TOKEN, ssid, pass);

    // Set Initial Datastream Values
    Blynk.virtualWrite(V0, "NORMAL");
    Blynk.virtualWrite(V1, 1.0);
    Blynk.virtualWrite(V2, 72);

    Serial.println("✅ Blynk Initialized Successfully.");
}

void loop() {
    Blynk.run(); // Process incoming Blynk messages & keep connection alive

    // ... Kinematic sampling logic ...

    // Update real-time G-force on Blynk Mobile App Widget
    Blynk.virtualWrite(V1, max_accel_g);

    if (max_accel_g >= 2.5f) {
        // Broadcast Fall Event to Blynk
        Blynk.virtualWrite(V0, "🚨 FALL DETECTED!");
        Blynk.logEvent("fall_alert", "High-G Impact Detected! Check on user immediately.");
        
        // Execute 30-second triage countdown
        // User can press the V3 button in the mobile app to set remote_silence_requested = true
    } else {
        Blynk.virtualWrite(V0, "NORMAL");
    }
}

## 📄 License

Distributed under the MIT License.
