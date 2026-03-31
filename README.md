# 🛡️ GigShield AI
### AI-Powered Parametric Insurance for India's Gig Workers

> **Guidewire Hackathon 2026** · Demo Prototype

---

## 📁 Project Structure

```
gigshield-ai/
├── app.py               ← Flask backend (AI risk engine + API)
├── requirements.txt     ← Python dependencies
├── static/
│   ├── index.html       ← Single-page dashboard UI
│   ├── styles.css       ← Premium dark-mode styling
│   └── app.js           ← Frontend logic & API calls
└── README.md
```

---

## 🚀 How To Run (2 Steps)

### Step 1 – Install Dependencies
```bash
cd gigshield-ai
pip install -r requirements.txt
```

### Step 2 – Start the Server
```bash
python app.py
```

Then open your browser at: **http://localhost:5000**

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🤖 AI Risk Engine | Rule-based model using rainfall + AQI data |
| ⚡ Parametric Triggers | Auto-payout when rainfall > 50mm OR AQI > 300 |
| 💰 Weekly Plans | Basic ₹99 / Pro ₹149 / Elite ₹199 per week |
| 🔍 Fraud Detection | Behavioral analysis flags suspicious patterns |
| 🏙️ 10 Indian Cities | Pre-loaded weather profiles for major cities |

---

## 🧠 AI Risk Logic

```python
if rainfall > 50 OR aqi > 300:
    risk = "HIGH"
    payout = 30% of weekly_income   # automatic, no claim needed
else:
    risk = "LOW"
    payout = 5% of weekly_income    # base coverage
```

---

## 🎤 2-Minute Hackathon Pitch Script

---

**[OPENING – 0:00–0:15]**

> "India has over **50 million gig workers** — delivery riders, auto drivers, daily-wage earners — who lose income every time it rains heavily or smog chokes the city. They can't work, they can't file insurance claims, and they have no safety net. We're changing that with **GigShield AI**."

---

**[PROBLEM – 0:15–0:35]**

> "Traditional insurance is broken for gig workers. It requires documentation, lengthy claim processes, and weeks of waiting. Meanwhile, a Zomato delivery rider loses ₹800 on a single rainy day with zero recourse. Over a monsoon season, that's ₹10,000+ lost — with no protection whatsoever."

## 🚀 Deployment (Vercel)

To deploy this project on Vercel:
1.  **Connect your GitHub Repository**.
2.  **Framework Preset**: Other.
3.  **Root Directory**: `.` (The root of the repo).
4.  **Build Command**: `cd frontend && npm install && npm run build`.
5.  **Output Directory**: `frontend/dist`.
6.  **Configuration**: I've provided a `vercel.json` that handles the routing between the Python API and the React frontend.

Note: Ensure you have a `requirements.txt` in the root for the Python functions.

---

**[SOLUTION – 0:35–1:05]**

> "GigShield AI is a **parametric insurance platform** — it pays out automatically based on objective data triggers, not subjective claims.
>
> Here's how it works:
> 1. The gig worker subscribes for as little as **₹99 per week**.
> 2. Our AI engine continuously monitors **rainfall and AQI** for their city.
> 3. The moment rainfall exceeds 50mm OR AQI exceeds 300, a **payout is triggered automatically** — straight to their UPI account.
> 4. **No forms. No claims. No waiting.**"

---

**[DEMO – 1:05–1:30]**

> "Let me show you the live dashboard. I enter 'Mumbai' and a weekly income of ₹5,000. The AI instantly pulls weather data showing heavy rainfall at 72mm — that crosses our trigger threshold. The system marks this as **HIGH RISK**, calculates a **₹1,500 payout** (30% of weekly income), and flags it as an auto-payout. The fraud detection engine simultaneously runs behavioral checks to ensure legitimacy."

---

**[BUSINESS MODEL – 1:30–1:45]**

> "We collect ₹99–₹199 per week per worker. With 1 million subscribers, that's **₹500M+ in annual premium** with an expected payout ratio of 20–30% — a healthy 70–80% loss ratio, well within actuarial safe bounds. We monetize further through platform partnerships with Swiggy, Zomato, Ola, and Urban Company."

---

**[CLOSING – 1:45–2:00]**

> "GigShield AI is not just an insurance product — it's a **financial safety net** for India's most vulnerable workforce. Built on AI, powered by real data, and designed for Bharat. We're here to protect the people who deliver your food, drive your cab, and keep India moving.
>
> **Thank you. Let's protect India's gig economy together.**"

---

## 🏆 Built For
**Guidewire Hackathon 2026** | Team GigShield | India's Gig Economy Protection

---

*This is a demo prototype. Not a real insurance product.*
