# 🔐 CipherAttend

### Cryptographically Secured AI Face Recognition Attendance & Academic Intelligence System
**Designed for VTU BCS703 Cryptography & Network Security | Academic Institution Ready**

[![CI Status](https://github.com/milanraj-github/CipherAttend/actions/workflows/ci.yml/badge.svg)](https://github.com/milanraj-github/CipherAttend/actions)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![AES-256-GCM](https://img.shields.io/badge/AES--256--GCM-Authenticated_Encryption-FFB000?logo=security)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
[![SHA-256](https://img.shields.io/badge/SHA--256-Integrity_Verified-00E0C6)](https://en.wikipedia.org/wiki/SHA-2)
[![InsightFace](https://img.shields.io/badge/InsightFace-ArcFace-orange)](https://github.com/deepinsight/insightface)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Anti--Spoofing-blue)](https://developers.google.com/mediapipe)
[![Tests Passing](https://img.shields.io/badge/Tests-77%2F77_Passed-brightgreen)](https://github.com/milanraj-github/CipherAttend/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📑 Table of Contents
1. [Executive Overview](#-executive-overview)
2. [VTU BCS703 Curriculum Alignment](#-vtu-bcs703-curriculum-alignment)
3. [System Architecture & Dataflow](#-system-architecture--dataflow)
4. [Cryptographic Security & Biometric Privacy](#-cryptographic-security--biometric-privacy)
5. [AI Face Recognition & Active Anti-Spoofing Pipeline](#-ai-face-recognition--active-anti-spoofing-pipeline)
6. [College Academic Hierarchy & Multi-Period Scheduling](#-college-academic-hierarchy--multi-period-scheduling)
7. [Database Schema & Entity-Relationship Diagram](#-database-schema--entity-relationship-diagram)
8. [System Portals & User Journey Flowcharts](#-system-portals--user-journey-flowcharts)
9. [Admin Cryptography Command Center & Student Dashboard](#-admin-cryptography-command-center--student-dashboard)
10. [REST API Directory](#-rest-api-directory)
11. [Quick Start & Installation Guide](#-quick-start--installation-guide)
12. [Default Credentials & Verification](#-default-credentials--verification)

---

## 📌 Executive Overview

**CipherAttend** is an enterprise-grade academic attendance and cryptographic surveillance platform engineered to eliminate manual roll calls, proxy attendance, and biometric vulnerability. 

Traditional facial recognition platforms suffer from severe security vulnerabilities:
- They store unencrypted raw photographs or plaintext mathematical embeddings in databases.
- They are vulnerable to 2D photo print attacks, digital screen replays, and man-in-the-middle vector tampering.
- They treat attendance as a simplistic binary daily flag rather than handling institutional college timetables.

**CipherAttend resolves this through five pillars:**
1. **Zero-Raw-Image Security Architecture:** Camera frames are evaluated strictly in volatile RAM and destroyed immediately after vector extraction.
2. **Authenticated Encryption (AES-256-GCM):** Facial vector embeddings are encrypted at rest with unique 96-bit initialization vectors (IVs) and 128-bit authentication tags.
3. **Cryptographic Integrity Sealing (SHA-256):** Every record is bound to a cryptographic hash chain to detect any unauthorized database alteration.
4. **Deterministic Server-Verified 3D Liveness:** Dynamic head-turn yaw challenges issued by the server defeat photo, screen, and deepfake replay attacks.
5. **Multi-Period Academic Hierarchy:** Full cohort grouping (`Branch` ➔ `Year` ➔ `Semester` ➔ `Section` ➔ `Subjects` `BCS701`–`BCS707`) with up to **7 class periods per day**.

---

## 🔬 VTU BCS703 Curriculum Alignment

CipherAttend serves as a practical implementation and demonstration of core syllabus topics in **VTU BCS703 Cryptography & Network Security**:

| Syllabus Module | Cryptographic Concept | CipherAttend Implementation |
|---|---|---|
| **Module 1 / 2: Block Ciphers** | Advanced Encryption Standard (AES) | AES-256 operating in **Galois/Counter Mode (GCM)** for authenticated encryption of biometric vectors. |
| **Module 3: Hash Functions & MACs** | Secure Hash Algorithm (SHA-2), Message Authentication Codes | **SHA-256 digest chains** on vector records; **128-bit GMAC tags** for cipher verification. |
| **Module 4: Authentication & Key Management** | Replay Attacks, Challenge-Response, Ephemeral Nonces | Server-issued **90-second TTL randomized yaw challenges**; **96-bit cryptographically random IV nonces**. |
| **Module 5: Network Security & Privacy** | Transport Layer Security (TLS), Privacy by Design, RBAC | JWT access tokens, role-based route guards, and zero plaintext exposure of master secret keys. |

---

## 🏗️ System Architecture & Dataflow

```mermaid
flowchart TB
    subgraph Client["CLIENT TIER (React 18 SPA)"]
        UI["Dark Cyberpunk Interface (#070A0F, #00E0C6, #FFB000)"]
        MP["MediaPipe FaceLandmarker (Client Blink & EAR)"]
        WC["Webcam Stream (Volatile Memory)"]
        UI --- MP
        MP --- WC
    end

    subgraph Transport["TRANSPORT TIER (HTTPS / TLS 1.3)"]
        JWT["JWT Authorization Header (Bearer Token)"]
        FD["Multipart Form Data (Frame Burst + Challenge Nonce)"]
    end

    subgraph Backend["APPLICATION & ML TIER (FastAPI + ONNX Runtime)"]
        direction TB
        RL["SlowAPI Rate Limiter"]
        LV["Liveness Evaluator (3D Yaw Angular Sweep)"]
        AR["Anti-Replay Guard (Pixel Difference Variance)"]
        FR["InsightFace SCRFD Detector + ArcFace Feature Extractor"]
        CS["AES-256-GCM Cryptographic Service"]
        
        RL --> LV --> AR --> FR --> CS
    end

    subgraph Database["PERSISTENCE TIER (SQLAlchemy ORM)"]
        direction TB
        DB_USERS[("users\n(Credentials, Roles, bcrypt)")]
        DB_STUDENTS[("students\n(Academic Cohorts & USN)")]
        DB_SUBJECTS[("subjects\n(BCS701 - BCS707 Catalog)")]
        DB_CRYPTO[("face_embeddings\n(AES Ciphertext, Nonce, Tag, SHA-256)")]
        DB_ATT[("attendance\n(Multi-Period P1..P7 Logs)")]
    end

    Client --> Transport
    Transport --> Backend
    Backend --> Database
```

---

## 🔐 Cryptographic Security & Biometric Privacy

### 1. Vector Encryption Pipeline (AES-256-GCM + SHA-256)

```mermaid
flowchart LR
    A["Raw Camera Frame (RAM)"] --> B["ArcFace Feature Extraction"]
    B --> C["512-D Float32 Array"]
    C --> D["IEEE 754 Binary Buffer (2048 Bytes)"]
    
    subgraph Encryption["AES-256-GCM Authenticated Encryption"]
        D --> E["AES-256-GCM Cipher"]
        KEY["256-Bit Master Key (Server Secret)"] --> E
        IV["96-Bit Nonce (os.urandom(12))"] --> E
        E --> CT["Ciphertext (2048 Bytes)"]
        E --> TAG["128-Bit GMAC Auth Tag (16 Bytes)"]
    end

    subgraph Hashing["SHA-256 Integrity Sealing"]
        CT --> H["SHA-256 Engine"]
        IV --> H
        TAG --> H
        H --> DIGEST["64-Char Hex Digest"]
    end

    CT --> DB[("Database: face_embeddings")]
    IV --> DB
    TAG --> DB
    DIGEST --> DB
```

### Mathematical Foundations:
- **AES-256-GCM AEAD Function:**
  $$\text{Ciphertext}, \text{Tag} = \text{AES-GCM-Encrypt}(K_{256}, \text{IV}_{96}, \text{Plaintext}, \text{AAD})$$
- **SHA-256 Integrity Digest:**
  $$\text{Hash} = \text{SHA-256}(\text{IV}_{96} \mathbin{\Vert} \text{Tag}_{128} \mathbin{\Vert} \text{Ciphertext})$$
- **Tamper Detection Guarantee:**
  $$\text{AES-GCM-Decrypt}(K, \text{IV}, \text{Ciphertext}, \text{Tag}) = 
  \begin{cases} 
  \text{Plaintext} & \text{if Tag is Valid} \\ 
  \bot \text{ (AUTH\_FAIL)} & \text{if Modified} 
  \end{cases}$$

---

## 👁️ AI Face Recognition & Active Anti-Spoofing Pipeline

### Dynamic Challenge-Response Liveness Sequence:

```mermaid
sequenceDiagram
    autonumber
    participant User as Student
    participant Browser as Client (MediaPipe)
    participant Server as Backend (FastAPI + InsightFace)
    participant DB as Encrypted Database

    User->>Browser: Opens Attendance Kiosk
    Browser->>Server: POST /liveness/challenge
    Server-->>Browser: Challenge Nonce { direction: "TURN_RIGHT", ttl: 90s }
    Browser->>User: Prompts: "Turn Head Right & Blink"
    User->>Browser: Turns head and blinks
    Browser->>Browser: MediaPipe measures EAR (Eyelid blink verified)
    Browser->>Server: POST /attendance/mark { frames: [F1..F5], challenge_id }
    
    Server->>Server: 1. Anti-Replay: Mean pixel difference >= 0.75?
    Server->>Server: 2. Yaw Measurement: Delta yaw >= 12.0° in required direction?
    Server->>Server: 3. ArcFace: Extract 512-D embeddings from frontal frames
    Server->>DB: Fetch encrypted templates
    Server->>Server: 4. Decrypt templates & Cosine k-NN Match (Threshold = 0.42)
    Server->>DB: 5. Record Period Attendance (UQ: user_id, date, period)
    Server-->>Browser: 200 OK: Attendance Recorded (Subject: BCS703, Period: 1)
```

---

## 🏫 College Academic Hierarchy & Multi-Period Scheduling

```mermaid
graph TD
    College["Engineering College"] --> B1["CSE (Computer Science)"]
    College --> B2["ISE (Information Science)"]
    College --> B3["ECE (Electronics)"]
    College --> B4["AIML (AI & Machine Learning)"]

    B1 --> Y3["3rd Academic Year"]
    Y3 --> S6["Semester 6 / 7"]
    S6 --> SEC_A["Section A"]
    S6 --> SEC_B["Section B"]

    SEC_A --> STU1["Student: Milanraj (4SO23CS071)"]
    
    SEC_A --> SUB["Course Catalog (7th Semester CSE)"]
    SUB --> P1["Period 1: BCS701 (Advanced Computer Architecture)"]
    SUB --> P2["Period 2: BCS702 (Cloud Computing & Virtualization)"]
    SUB --> P3["Period 3: BCS703 (Cryptography & Network Security)"]
    SUB --> P4["Period 4: BCS704 (Data Mining & Machine Learning)"]
    SUB --> P5["Period 5: BCS705 (Web Technologies & Frameworks)"]
    SUB --> P6["Period 6: BCS706 (Embedded Systems & IoT)"]
    SUB --> P7["Period 7: BCS707 (Cryptography & Network Security Lab)"]
```

### Multi-Period Scheduling Rules:
- **Up to 7 Periods Per Day:** A student can attend multiple distinct periods in a single day.
- **Database Concurrency Guarantee:** The database enforces uniqueness on `(user_id, date, period)`. Duplicate submissions for the same period are rejected by database constraint, while separate periods (P1 to P7) are recorded seamlessly.
- **VTU 75% Attendance Rule:** Individual subject percentages are tracked continuously:
  $$\text{Subject Rate} = \left(\frac{\text{Periods Attended}}{\text{Total Conducted Periods}}\right) \times 100 \ge 75\%$$

---

## 🗄️ Database Schema & Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o| students : "binds to (1:1)"
    users ||--o{ attendance : "has records (1:N)"
    users ||--o| face_embeddings : "owns encrypted vector (1:1)"
    users ||--o{ face_images : "owns validation thumbnails (1:N)"
    subjects ||--o{ attendance : "scheduled for (1:N)"

    users {
        int id PK
        string email UK "Unique login email"
        string password "bcrypt hash"
        string full_name "Display name"
        string unique_id UK "Institutional ID"
        string role "admin or user"
        boolean is_active "Account status"
        boolean face_registered "Biometric status"
        datetime created_at
    }

    students {
        int id PK
        string usn UK "University Seat Number"
        string full_name "Official name"
        string email UK "Institutional email"
        string branch "e.g. CSE"
        int year "1..4"
        int semester "1..8"
        string section "A, B, C"
        int user_id FK "Linked user account"
        datetime created_at
    }

    subjects {
        int id PK
        string code UK "e.g. BCS703"
        string name "Subject Title"
        string branch "CSE"
        int year "3"
        int semester "6"
    }

    attendance {
        int id PK
        int user_id FK "Student user reference"
        int subject_id FK "Subject reference"
        date date "Attendance date"
        int period "Period slot (1..7)"
        time time_in "Timestamp marked"
        string status "present or absent"
        datetime created_at
    }

    face_embeddings {
        int id PK
        int user_id FK "User reference"
        binary encrypted_vector "AES-256-GCM Ciphertext"
        binary nonce_iv "96-bit initialization vector"
        binary auth_tag "128-bit authentication tag"
        string sha256_hash "Integrity hash"
        int count "Encodings aggregated"
        string model "buffalo_l"
        datetime created_at
    }
```

---

## 🧭 System Portals & User Journey Flowcharts

```mermaid
flowchart TD
    Start["User visits /"] --> AuthCheck{"Authenticated?"}
    
    AuthCheck -- "No" --> Landing["Public Landing Page (3 Actions: Sign In, Sign Up, Mark Attendance)"]
    Landing --> Action{"User Choice"}
    Action -- "Sign In" --> Login["JWT Login (/login)"]
    Action -- "Sign Up" --> Register["Self-Registration (/register)"]
    Action -- "Mark Attendance" --> Kiosk["Facial Attendance Kiosk (/mark-attendance)"]

    Register --> LinkCheck{"Matches Pre-Registered Student Email?"}
    LinkCheck -- "Yes" --> AutoLink["Auto-Link user_id to Academic Profile"]
    LinkCheck -- "No" --> StdUser["Standard User Account Created"]

    Login --> RoleCheck{"User Role?"}
    RoleCheck -- "Admin" --> AdminDashboard["Admin Command Center (/admin)"]
    RoleCheck -- "Student" --> StudentDashboard["Student Dashboard (/dashboard)"]

    subgraph AdminActions["Admin Command Center"]
        AdminDashboard --> Tab1["📊 Main Dashboard (KPIs, Weekly Trends)"]
        AdminDashboard --> Tab2["👥 Students (Cohort Filters, Add Student, 4-Tab Profile)"]
        AdminDashboard --> Tab3["🔐 Cryptography Lab (AES-256-GCM Live Encrypt/Decrypt)"]
        AdminDashboard --> Tab4["🛡️ Security Center (Tamper Detection, Spoof Audit)"]
    end

    subgraph StudentActions["Student Dashboard"]
        StudentDashboard --> Cal["Monthly Calendar (Aligned Sun-Sat, Indicators)"]
        StudentDashboard --> SubList["Subject-Wise Attendance Breakdown (BCS701 - BCS707)"]
        StudentDashboard --> ExpLogs["Period Drilldown Logs (P1..P7)"]
        StudentDashboard --> CSV["Download CSV Report"]
    end
```

---

## 🖥️ Admin Cryptography Command Center & Student Dashboard

### 1. Admin Command Center Tabs:
- 📊 **Main Dashboard:** High-level college attendance charts, security badges, and active operational stats.
- 👥 **Student Directory:**
  - Multi-tier cohort filters: Filter by Branch, Year, Semester, Section, Subject, and USN.
  - Student Table with Account Status (`Linked ✓` / `Pre-registered`) and Face Status (`Enrolled ✓` / `Pending`).
  - Comprehensive **4-Tab Student Profile Modal**:
    - `[ PROFILE ]`: Academic details, cohort breadcrumb.
    - `[ BIOMETRIC ]`: Zero raw image guarantee, vector dimension parameters.
    - `[ SECURITY ]`: Real AES-256-GCM metadata, SHA-256 verification button, server-side decrypted vector inspector.
    - `[ ATTENDANCE ]`: Subject-wise breakdown cards, period history logs, and `[ ⚡ Seed 7-Period Demo ]` button.
- 🔐 **Cryptography Lab:**
  - **Live AES-256-GCM Encryptor/Decryptor:** Interactive test sandbox allowing live encryption of vectors with randomized IV generation.
  - **SHA-256 Integrity Verifier:** Real-time hash comparison demonstrating tampering detection.
- 🛡️ **Security Center:**
  - Tamper alarm monitor, anti-spoofing rejection audit logs, and account lockouts.

### 2. Student Academic Dashboard:
- **Precision Monthly Calendar:**
  - Properly aligned to day-of-week slots (`Sun` through `Sat`).
  - Color-coded: 🟡 **Today** (Amber border), 🟢 **Present** (Teal surface with green indicator), 🔴 **Absent** (Crimson dot).
- **Subject-Wise Attendance Breakdown List:**
  - Real course metrics across all enrolled courses (`BCS701` to `BCS707`).
  - Progress bar with VTU 75% thresholds (Teal for $\ge 75\%$, Amber for $65\% - 74\%$, Red for $< 65\%$).
  - Expandable **Period Logs** revealing date, period number, timestamp, and status.

---

## 📡 REST API Directory

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates credentials and returns JWT access token. |
| `POST` | `/auth/register` | Public | Student registration; auto-binds to academic profile. |
| `POST` | `/liveness/challenge` | Public / Token | Generates dynamic 90s head-turn challenge. |
| `POST` | `/face/register` | User Token | Enrolls face embeddings (AES-256-GCM encrypted). |
| `POST` | `/attendance/mark` | Public / Token | Verifies liveness & marks multi-period attendance. |
| `GET` | `/user/attendance` | User Token | Returns student attendance & subject breakdown. |
| `GET` | `/admin/students` | Admin Token | Cohort filterable directory of students. |
| `POST` | `/admin/students` | Admin Token | Pre-registers student academic identity. |
| `DELETE`| `/admin/students/{id}` | Admin Token | Full purge of student profile, login account & biometrics. |
| `GET` | `/admin/students/{id}/details` | Admin Token | Returns 4-tab cryptographic & attendance inspector. |
| `POST` | `/admin/students/{id}/attendance/seed-multi-period` | Admin Token | Seeds 7 distinct period records for demonstration. |
| `GET` | `/admin/academic-options` | Admin Token | Returns valid branches, years, semesters, sections. |
| `GET` | `/admin/subjects` | Admin Token | Lists all academic course subjects. |

---

## 🚀 Quick Start & Installation Guide

### Prerequisites:
- Python 3.10+ (Recommended: Python 3.11)
- Node.js 18+ & npm
- Webcam device

---

### 1. Backend Service Setup:
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
> Interactive API Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Application Setup:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```
> Web Portal: [http://localhost:3000](http://localhost:3000)

---

### 3. One-Click Windows Launchers:
- Run `run_backend.bat` in the root folder to start FastAPI.
- Run `run_frontend.bat` in the root folder to start React.

---

## 🔑 Default Credentials & Verification

| Portal | User Type | Email | Password | Details |
|---|---|---|---|---|
| **Admin Command Center** | Administrator | `admin@gmail.com` | `admin@123` | Full access to Cryptography Lab, Student Directory & Security Center |
| **Student Dashboard** | Student (Milanraj) | `milanraj.23cs071@sode-edu.in` | `milan@123` | Pre-enrolled 7-period demo account (`USN: 4SO23CS071`) |

---

### 🧪 Automated Testing & CI Verification:
To execute the complete 77-test suite locally:
```bash
cd backend
.venv\Scripts\python -m pytest tests/ -v
```
**Result:** `77 passed in 15.96s (100% Green)`

---

<p align="center">
  Crafted with precision for <strong>Secure Biometric Intelligence & Academic Excellence</strong>
</p>
