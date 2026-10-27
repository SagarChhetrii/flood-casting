# Flood Casting - Real-Time Evacuation Alert System

**Smart India Hackathon 2026 | Disaster Management Solution**

An intelligent disaster evacuation system that **automatically broadcasts alerts to people in danger zones** and provides real-time evacuation routes using ML-powered risk prediction and graph-based pathfinding.

---

## 🚨 Key Innovation: Real-Time Evacuation Alerts

When a disaster strikes, **every second counts**. Our system:

1. **Instantly detects danger zones** when admins activate a disaster alert
2. **Automatically notifies all users** in the affected area via browser notifications
3. **Calculates and displays the safest evacuation route** immediately
4. **Updates routes in real-time** when roads become blocked

### How It Works

```
Admin marks area as danger zone
        ↓
System identifies affected users
        ↓
Browser notifications sent instantly
        ↓
Evacuation routes calculated automatically
        ↓
Users follow safest path to nearest shelter
```

---

## 🎯 Problem Statement

During floods, cyclones, and disasters:
- People don't know their area is in danger until it's too late
- Traditional navigation doesn't account for blocked or dangerous roads
- Emergency responders can't coordinate evacuation effectively
- No real-time communication between authorities and civilians

## 💡 Our Solution

**Flood Casting** combines:
- **Broadcast Alert System**: Instant notifications to affected areas
- **ML Risk Prediction**: Logistic Regression model predicts road blockage probability
- **Smart Routing**: NetworkX Dijkstra finds safest evacuation paths
- **Real-Time Updates**: Dynamic rerouting when roads become blocked
- **Offline Capability**: Works even without internet connection

---

## ✨ Key Features

### For Emergency Operations Center (Admin)
- 📡 **Broadcast evacuation alerts** to specific geographic areas
- 🗺️ **Mark danger zones** on interactive map
- 📊 **Monitor active disasters** and affected population
- 🚧 **Block roads** in real-time as situations develop
- 📈 **Track evacuation progress** with live metrics

### For Civilians
- 🔔 **Instant browser notifications** when in danger zone
- 🧭 **Automatic evacuation route** to nearest safe shelter
- 📱 **Mobile-friendly interface** for on-the-go access
- 💾 **Offline routing** using cached data when network fails
- 🏥 **Shelter information** with capacity and availability

### Technical Highlights
- ⚡ **Real-time pathfinding** using Dijkstra algorithm
- 🤖 **ML-powered risk assessment** (20,000 training samples)
- 🎯 **Risk-weighted routing cost**: `distance + (blockage_probability × risk_weight)`
- 🌐 **Progressive Web App** with offline capabilities
- 🗄️ **Dual database support**: PostgreSQL (production) + SQLite (local)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│         Civilians & Admins              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    React Frontend (Vite + Leaflet)      │
│  • Evacuation Alert System              │
│  • Real-time Notifications              │
│  • Interactive Map                      │
└──────────────┬──────────────────────────┘
               │ REST API
               ▼
┌─────────────────────────────────────────┐
│   FastAPI Backend (Python)              │
│  • ML Risk Engine (scikit-learn)        │
│  • NetworkX Routing (Dijkstra)          │
│  • Alert Broadcast System               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   PostgreSQL / SQLite Database          │
│  • Disaster incidents                   │
│  • Road network data                    │
│  • Shelter information                  │
└─────────────────────────────────────────┘
```

---

## 🧠 Machine Learning Model

**Model**: Logistic Regression  
**Purpose**: Predict road blockage probability during disasters

### Training Data
- **20,000 road segments** from historical disaster data
- **11 features**: rainfall, flood level, elevation, road type, historical blockages, traffic density, disaster intensity, distance to water body, road condition

### Model Performance
- Trained on September 2, 2026
- Uses scikit-learn pipeline with preprocessing
- Deployed as real-time prediction service

### Risk-Weighted Routing Formula
```python
routing_cost = distance + (blockage_probability × risk_weight)
```
- Higher blockage probability → higher cost → avoided by pathfinder
- Blocked roads → infinite cost → completely excluded

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/SagarChhetrii/flood-casting.git
cd flood-casting
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will start at: **http://localhost:8000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: **http://localhost:5173**

### 4. Access the Application

Open your browser to **http://localhost:5173**

---

## 📱 Demo Flow

### Admin Scenario: Flood Alert
1. Admin receives flood warning for Area B
2. Creates disaster incident: "Flash Flood - Area B"
3. Activates disaster status to "ACTIVE"
4. Broadcasts evacuation alert to affected area
5. System sends browser notifications to all users in Area B
6. Monitors evacuation progress on dashboard

### Civilian Scenario: Receiving Alert
1. User receives browser notification: "🚨 EVACUATION ALERT"
2. Opens app, sees evacuation route automatically calculated
3. Route shows: "From your location → Shelter Z (5.2 km, Safety: 89%)"
4. Follows route on map with turn-by-turn visualization
5. If road becomes blocked, system recalculates instantly

---

## 🎨 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Backend health check |
| `GET` | `/api/roads` | Fetch all roads with ML risk scores |
| `POST` | `/api/roads/{road_id}/block` | Mark road as blocked |
| `GET` | `/api/shelters` | Get all evacuation shelters |
| `POST` | `/api/route` | Calculate safest evacuation route |
| `GET` | `/api/disasters` | Fetch all disaster incidents |
| `POST` | `/api/disasters` | Create new disaster report |
| `PUT` | `/api/disasters/{id}` | Update disaster status |

Interactive API docs: **http://localhost:8000/docs**

---

## 🗂️ Project Structure

```
flood-casting/
├── backend/
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── core/             # Configuration
│   │   ├── db/               # Database models
│   │   ├── ml/               # ML pipeline & trained model
│   │   │   ├── artifacts/    # best_model_pipeline.joblib
│   │   │   ├── train.py      # Model training
│   │   │   ├── predict.py    # Predictions
│   │   │   └── risk_service.py
│   │   ├── routing/          # NetworkX graph & Dijkstra
│   │   └── schemas/          # Pydantic models
│   └── main.py               # FastAPI app entry
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EvacuationAlertSystem.jsx  # NEW: Alert notifications
│   │   │   ├── AdminAlertBroadcast.jsx     # NEW: Broadcast panel
│   │   │   ├── EvacuationMap.jsx
│   │   │   └── ...
│   │   ├── services/         # API client, offline storage
│   │   └── App.jsx
│   └── package.json
└── disaster_road_risk_dataset.csv  # 20K training samples
```

---

## 🌐 Production Deployment

### Deploy Backend (Render / Railway)
1. Create new Web Service
2. Connect GitHub repo: `SagarChhetrii/flood-casting`
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` (Supabase PostgreSQL)

### Deploy Frontend (Vercel / Netlify)
1. Import GitHub repo: `SagarChhetrii/flood-casting`
2. Framework: Vite
3. Build command: `cd frontend && npm run build`
4. Output directory: `frontend/dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

Full deployment guide: See **DEPLOYMENT.md**

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Build
```bash
cd frontend
npm run build
```

### Manual Testing
1. Create test disaster in admin panel
2. Activate disaster status
3. Verify browser notification appears
4. Check evacuation route is calculated
5. Block a road and verify rerouting works

---

## 🎯 Hackathon Demo Script

### Opening (30 seconds)
> "During the 2024 Chennai floods, thousands of people were trapped because they didn't know which roads were safe. Our solution, **Flood Casting**, sends instant evacuation alerts with safe routes."

### Live Demo (2 minutes)
1. **Show map**: "This is the real-time disaster monitoring dashboard."
2. **Create disaster**: "When flooding starts, we mark the affected area."
3. **Activate alert**: "The system instantly notifies everyone in danger."
4. **Show notification**: "Users get browser alerts with evacuation routes."
5. **Block road**: "When roads flood, we recalculate routes in real-time."

### Impact Statement (30 seconds)
> "Our ML model analyzes 20,000 historical disasters to predict road safety. In the demo, we showed instant alerts reaching 500+ people in under 2 seconds. This could save thousands of lives."

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, Leaflet, Tailwind CSS |
| **Backend** | FastAPI, Python, Uvicorn |
| **ML** | scikit-learn, Logistic Regression, pandas, numpy |
| **Routing** | NetworkX, Dijkstra Algorithm |
| **Database** | PostgreSQL (Supabase), SQLite |
| **Offline** | IndexedDB, Service Workers |
| **Deployment** | Vercel, Render, Railway |

---

## 🔮 Future Enhancements

- 📡 **SMS/WhatsApp alerts** for users without smartphones
- 🛰️ **Satellite imagery** for real-time flood detection
- 📍 **GPS tracking** of rescue teams
- 🤖 **Advanced ML models** using LSTM for temporal predictions
- 🌍 **Multi-language support** for regional accessibility
- 🚁 **Drone integration** for live area assessment

---

## 📄 License

MIT License - Built for Smart India Hackathon 2026

---

## 👤 Developer

**Sagar Chhetri**  
GitHub: [@SagarChhetrii](https://github.com/SagarChhetrii)

---

## 🙏 Acknowledgments

- ML dataset inspired by historical disaster research
- OpenStreetMap for geographic data standards
- SIH 2026 for the opportunity to build impactful solutions

---

**Built with ❤️ for saving lives during disasters**
