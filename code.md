App name: Lumos
Description: Lumos logo

Lumos dark mode with web design

Lumos light mode with web design

Lumos input by texting or uploading a image

Lumos analysis results

Lumos light mode with mobile design

Inspiration

We live in a state of constant digital alert. Every unexpected text or email forces a difficult choice: Is this a critical notification or a sophisticated trap? The fear of being scammed is matched only by the fear of missing something important, like a delivery update or an appointment reminder.

We realized that without an integrated, instant verification tool, users are left guessing. This uncertainty leads to two costly outcomes: missed opportunities (ignoring real messages) or financial/data loss (falling for malicious links). We wanted to eliminate this guesswork by building a tool that provides clarity in a world of deception.

What it does

Lumos is an AI Co-pilot for Digital Trust. It is a centralized platform that provides instant, AI-powered analysis for suspicious messages and images, powered by machine learning models such as XGBoost.

Multi-Modal Analysis: Users can paste text or upload a screenshot of a suspicious message.

Instant Verdict: The system analyzes the input and delivers a clear Risk Score (0-100) in seconds.

Actionable Intelligence: Unlike simple blockers, Lumos explains why a message is risky through ""Analysis Evidence"" (e.g., unknown sender, urgency keywords, flagged URLs) and provides concrete ""Recommendations"" (e.g., Block number, Do not click links).

How we built it

We engineered a Multi-Layered Intelligence Engine that deconstructs threats into parts for analysis.

The Stack: We built a scalable backend using Node.js and Express.js, serving a responsive Web UI.

Data Processing (OCR): To handle image-based scams that evade text filters, we integrated Tesseract.js. This allows Lumos to extract and analyze text, URLs, and phone numbers directly from screenshots.

External Intelligence: We chained multiple powerful APIs to gather context:

The Brain (Machine Learning): All these signals feed into our custom-trained XGBoost Model. This model evaluates 45 distinct features—ranging from keyword density to international sender status—to calculate the final probability of a scam.

Challenges we ran into

OCR Accuracy on Varied Backgrounds: Extracting text reliably from screenshots with different lighting, resolutions, and compression artifacts using Tesseract.js required significant tuning to ensure we didn't miss critical URLs or phone numbers.

Feature Engineering for XGBoost: Determining which features were most predictive of a scam was difficult. We had to balance technical signals (such as URL age) with linguistic signals (such as ""urgency"") to ensure legitimate high-priority messages (such as 2FA codes) weren't flagged as false positives.

Real-Time Latency: Chaining multiple APIs (Twilio, Google, OpenAI) creates a risk of slow responses. We had to optimize our asynchronous requests to ensure the user gets a ""verdict in seconds"" rather than waiting for a long analysis.

Accomplishments that we're proud of

The ""Glass Box"" Approach: We didn't just build a black-box AI that says ""Bad."" We are proud of our UI that breaks down the Analysis Evidence. Showing the user exactly why a message was flagged (e.g., ""URL not flagged, but AI analysis detected urgency tactics"") builds genuine user trust.

45-Feature Threat Analysis: Successfully implementing a model that considers 45 different variables gives our detection engine a depth that simple keyword matching cannot achieve.

Seamless Image Handling: Getting the ""Parser & OCR"" layer to work smoothly allows us to catch scams that hide in images, which is a massive gap in many current security tools.

What we learned

Scams are Structural: We learned that while the content of scams changes, the structure (urgency + obscure link + unknown sender) remains remarkably consistent. This validated our choice to use XGBoost to detect these patterns.

Context is King: A URL might be safe, but the context (e.g., asking for a toll payment via text) is what makes it a scam. Relying on a single data point (like Safe Browsing) isn't enough; you need the multi-layered approach we built.
<code>
================================================================================
FILE: INTEGRATION_CHECKLIST.md
================================================================================
# Integration Setup Checklist

## ✅ Completed Setup

- [x] Node.js services created
  - [x] `src/services/xgboostService.js`
  - [x] `src/services/featureExtractor.js`
  - [x] `src/utils/analyzer.js` with hybrid scoring
- [x] Routes updated
  - [x] `src/routes/analyze.js` integrated with ML
- [x] Configuration updated
  - [x] `src/config.js` has xgboostApiUrl
  - [x] `package.json` has concurrently and npm scripts
- [x] Python ML model ready
  - [x] `lumos_XGBoost/api_server.py` exists
  - [x] `lumos_XGBoost/scam_detector_model.pkl` exists
  - [x] `lumos_XGBoost/requirements.txt` exists

## ⚠️ Required Steps to Complete

### 1. Update .env file

Add this line to your `.env`:
```env
XGBOOST_API_URL=http://localhost:5000
```

### 2. Install Python Dependencies

```bash
cd lumos_XGBoost
pip install -r requirements.txt
cd ..
```

### 3. Install concurrently (if not already installed)

```bash
npm install
```

## 🧪 Testing Steps

### 1. Start Both Services

```bash
npm run start:all
```

You should see:
- `🚀 Server is running on http://localhost:3000`
- `🌐 API Service Started` (from Python)

### 2. Test Node.js API

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H ""Content-Type: application/json"" \
  -d ""{\""message\"": \""URGENT! You won $1000! Click http://bit.ly/prize now! Call 0912345678\""}""
```

### 3. Verify ML Model is Working

Check response should include:
```json
{
  ""riskScore"": 85,
  ""mlScore"": 90,  // <-- This indicates ML model is working
  ""riskLevel"": ""red"",
  ""evidence"": [
    ""🤖 ML Model: 90% scam probability (High confidence)"",  // <-- ML evidence
    ...
  ]
}
```

If `mlScore` is `null`, the ML model is not available (degraded to rule-based).

### 4. Test Python API Directly (Optional)

```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

## 🔍 Troubleshooting

### ML Model Not Being Used

**Check console logs for:**
- `⚠️ XGBoost not available, using rule-based scoring only`

**Solutions:**
1. Ensure Python service is running (`npm run ml:start`)
2. Check `XGBOOST_API_URL` in `.env`
3. Verify Python dependencies installed

### Python Service Won't Start

**Error**: `ModuleNotFoundError`

**Solution**: Install Python packages
```bash
cd lumos_XGBoost
pip install -r requirements.txt
```

**Error**: `Model not loaded`

**Solution**: Train the model
```bash
cd lumos_XGBoost
python train_model.py
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**: 
1. Kill process using port 5000
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   ```
2. Or change port in `lumos_XGBoost/api_server.py`

## ✨ Success Indicators

You'll know the integration is working when:

1. ✅ Both services start without errors
2. ✅ Response includes `mlScore` field
3. ✅ Evidence includes ""🤖 ML Model: X% scam probability""
4. ✅ Console shows ""🤖 XGBoost prediction: 0.XX""
5. ✅ Health check returns `model_loaded: true`

## 📚 Next Steps

After verifying integration works:

1. **Development**: Use `npm run start:all`
2. **Production**: See deployment guide in XGBOOST_INTEGRATION.md
3. **Separation**: See INTEGRATION_GUIDE.md for microservice separation


================================================================================
FILE: README.md
================================================================================
# Scam Message Detection

Hackathon Project - AI-powered scam detection system with frontend + backend + machine learning training pipeline

Introduction Document: [Lumos - Clarity_in_Digital_Trust](https://github.com/AndersonTsaiTW/HackTheSource_lumos/blob/main/Lumos_Clarity_in_Digital_Trust.pdf)

## Features

### Production API (For End Users)

- 📝 **Smart Parsing**: Extract URLs, phone numbers, and content from messages using Regex
- 🌐 **URL Detection**: Google Safe Browsing API to detect malicious links
- 📞 **Phone Lookup**: Twilio Lookup API to verify phone numbers and detect VoIP
- 🤖 **AI Analysis**: OpenAI GPT-4o-mini with 12 semantic features (urgency, threat level, impersonation type, etc.)
- 📸 **OCR Support**: Tesseract.js for extracting text from scam message images
- ⚡ **Parallel Processing**: Call three APIs simultaneously for fast response
- 🎨 **Risk Assessment**: Red warning (≥75), yellow caution (≥30), green safe (<30)
- 🌐 **Web Interface**: Modern responsive UI with dark/light mode
- 🤖 **ML Integration**: XGBoost model with 78.3% accuracy for enhanced scam detection

### XGBoost ML Model (Machine Learning)

- 🎯 **45 Features**: Comprehensive feature engineering from text, URL, phone, AI, and statistical analysis
- 🤖 **XGBoost Classifier**: Trained model with 78.3% accuracy and 0.938 ROC-AUC score
- 🔮 **Scam Probability**: Returns precise probability score (0-100%) for scam detection
- 🐍 **Python API Server**: Flask-based REST API for model inference
- 🔄 **Node.js Integration**: Easy integration with existing Node.js backend
- 📊 **Model Metrics**: Detailed performance metrics and feature importance visualization

### Training Data Collection (For ML Model)

- 🎯 **45 Feature Extraction**: Comprehensive feature engineering for XGBoost training
  - Text features (14): character count, word count, digit ratio, special chars, etc.
  - URL features (8): URL count, suspicious domains, HTTPS ratio, etc.
  - Phone features (7): phone count, VoIP detection, international format, etc.
  - AI features (12): urgency level, threat level, temptation level, impersonation type, emotion triggers, etc.
  - Statistical features (3): entropy, readability, complexity
- 📊 **CSV Export**: Automated training data generation to `training_data.csv`
- 🖼️ **Batch Processing**: Process 100+ images from `data_pics/fraud` and `data_pics/normal` folders
- 🔄 **API Integration**: Reuses production APIs (Google, Twilio, OpenAI) for consistent feature extraction

## Quick Start

### Prerequisites

- **Node.js**: v22.13.0 or higher
- **Python**: 3.10 - 3.12 (for ML model, Python 3.13 may have compatibility issues)
- **npm**: Comes with Node.js

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API Keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
OPENAI_API_KEY=your_api_key_here
XGBOOST_API_URL=http://localhost:5000
```

### 3. Setup Python ML Model (XGBoost)

```bash
# Navigate to ML model directory
cd lumos_XGBoost

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate.bat
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Return to project root
cd ..
```

**Note:** If you encounter scikit-learn version warnings, the model will still work but was trained with version 1.7.2.

### 4. Start Services

**Option A: Start Both Services Simultaneously (Recommended)**

```bash
npm run start:all
```

This will start:
- Node.js API on `http://localhost:3000`
- Python ML API on `http://localhost:5000`

**Option B: Start Services Separately**

Terminal 1 - Python ML API:
```bash
cd lumos_XGBoost
.\.venv\Scripts\Activate.ps1  # Windows
python api_server.py
```

Terminal 2 - Node.js API:
```bash
npm run dev
```

### 5. Open Web Interface

Navigate to `http://localhost:3000` and open `test.html` in your browser.

### 6. Verify Installation

Check if both services are running:

```bash
# Check Node.js API
curl http://localhost:3000/api/analyze

# Check Python ML API
curl http://localhost:5000/health
```

Expected response from ML API:
```json
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

## API Documentation

### Production Endpoints

#### POST /api/analyze

Analyze suspicious messages

**Request Body:**

```json
{
  ""message"": ""Your package has arrived, please click http://suspicious-link.com for details. Contact: 0912345678""
}
```

**Response:**

```json
{
  ""riskLevel"": ""red"",
  ""riskScore"": 82,
  ""evidence"": [
    ""🚨 The ML model detected strong scam patterns with 82% probability, indicating a significant risk"",
    ""⚠️ The message contains a high number of special characters (28), which can be a tactic used by scammers to create confusion"",
    ""⚠️ The average word length (4.67) is slightly unusual for legitimate messages, hinting at potential manipulation""
  ],
  ""action"": {
    ""title"": ""🚨 High Risk Warning"",
    ""suggestions"": [
      ""Do not click any links in this message"",
      ""Do not call back or respond to the sender"",
      ""Block this sender immediately"",
      ""Report this message to the 165 anti-fraud hotline if necessary""
    ]
  }
}
```

**Note:** With XGBoost ML model integration, the response now includes AI-generated human-readable explanations. The `riskScore` prioritizes the ML model's prediction when available (70% weight), falling back to rule-based scoring if the ML service is unavailable.

#### POST /api/ocr

Extract text from image and analyze for scams

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body: `image` file (JPG, PNG, GIF, WebP, TIFF, max 10MB)

**Response:**

```json
{
  ""text"": ""Extracted text from image..."",
  ""riskScore"": 85,
  ""riskLevel"": ""red"",
  ""evidence"": [...],
  ""action"": {...}
}
```

### Training Endpoints

#### POST /api/training/collect-training-data

Collect training data with 45 features for ML model

**Request Body:**

```json
{
  ""image_path"": ""data_pics/fraud/scam_001.png"",
  ""ocr_text"": ""URGENT! Click http://phishing.com"",
  ""label"": 1
}
```

**Response:**

```json
{
  ""success"": true,
  ""message"": ""Training data collected successfully"",
  ""features"": {
    ""char_count"": 156,
    ""word_count"": 23,
    ""url_count"": 1,
    ""phone_count"": 1,
    ""urgency_level"": 8,
    ""threat_level"": 7
  },
  ""label"": 1
}
```

#### GET /api/training/training-stats

Get statistics about collected training data

**Response:**

```json
{
  ""totalRows"": 128,
  ""features"": 45,
  ""lastUpdated"": ""2025-12-04T10:30:00.000Z""
}
```

## Project Structure

```text
.
├── src/                          # Production code
│   ├── index.js                  # Main server (unified)
│   ├── config.js                 # Environment variables
│   ├── routes/
│   │   └── analyze.js            # /api/analyze, /api/ocr
│   ├── services/
│   │   ├── parser.js             # Message parsing (URL, phone)
│   │   ├── safeBrowsing.js       # Google Safe Browsing API
│   │   ├── twilioLookup.js       # Twilio Lookup API
│   │   ├── openaiCheck.js        # OpenAI GPT-4o-mini (12 features)
│   │   └── ocrService.js         # Tesseract.js OCR
│   └── utils/
│       └── analyzer.js           # Risk score calculation
│
├── training/                     # ML training pipeline
│   ├── routes/
│   │   └── collectData.js        # /api/training/*
│   ├── services/
│   │   └── featureExtractor.js   # 45 feature extraction
│   ├── utils/
│   │   └── csvWriter.js          # CSV file management
│   └── scripts/
│       ├── test-collect.js       # Test single sample
│       └── scan-images.js        # Batch process images
│
├── data_pics/                    # Training images
│   ├── fraud/                    # 85 scam images
│   └── normal/                   # 43 normal images
│
├── lumos_XGBoost/                # ML Model (Python)
│   ├── api_server.py             # Flask API server
│   ├── train_model.py            # Model training script
│   ├── predict.py                # Prediction script
│   ├── scam_detector_model.pkl   # Trained XGBoost model
│   ├── feature_columns.json      # 45 feature definitions
│   ├── model_metrics.json        # Performance metrics
│   ├── requirements.txt          # Python dependencies
│   ├── nodejs_example.js         # Node.js integration example
│   └── README.md                 # Model documentation
│
├── test.html                     # Web UI
├── styles/                       # CSS files
├── scripts/                      # Frontend JS
└── training_data.csv             # Generated training data
```

## Tech Stack

### Backend & APIs

- **Runtime**: Node.js v22.13.0
- **Framework**: Express.js
- **HTTP Client**: Axios
- **AI**: OpenAI GPT-4o-mini
- **OCR**: Tesseract.js
- **APIs**: Google Safe Browsing v4, Twilio Lookup v2

### Machine Learning

- **Model**: XGBoost Classifier
- **Language**: Python 3.x
- **API Framework**: Flask + Flask-CORS
- **Libraries**: pandas, numpy, scikit-learn, xgboost, joblib
- **Accuracy**: 78.3% with 0.938 ROC-AUC

### Frontend

- **UI**: Vanilla HTML/CSS/JS with dark mode
- **Styling**: SCSS preprocessor

## Training Data Collection

### How to Collect Training Data

1. **Prepare images**: Place images in `data_pics/fraud/` (label=1) or `data_pics/normal/` (label=0)

2. **Start server**:

```bash
npm run dev
```

1. **Run batch processing** (in another terminal):

```bash
node training/scripts/scan-images.js
```

This will:

- Scan all images in `data_pics/fraud/` and `data_pics/normal/`
- Extract text using OCR
- Call Google, Twilio, and OpenAI APIs
- Extract 45 features
- Append to `training_data.csv`

### Feature List (45 Total)

**Text Features (14)**:

- char_count, word_count, digit_count, digit_ratio
- uppercase_ratio, special_char_count, exclamation_count
- question_count, has_urgent_keywords, suspicious_word_count
- max_word_length, avg_word_length, emoji_count, consecutive_caps

**URL Features (8)**:

- url_count, has_suspicious_tld, has_ip_address
- has_url_shortener, avg_url_length, has_https
- url_path_depth, subdomain_count

**Phone Features (7)**:

- phone_count, has_intl_code, is_voip
- is_mobile, is_valid_phone, phone_carrier_known, has_multiple_phones

**AI Features (12)**:

- urgency_level (0-10), threat_level (0-10), temptation_level (0-10)
- impersonation_type, action_requested, grammar_quality (0-10)
- emotion_triggers, credibility_score (0-10)
- ai_is_scam (0/1), ai_confidence (0-100), has_scam_keywords, keyword_count

**Statistical Features (3)**:

- text_entropy, readability_score, sentence_complexity

## XGBoost Model Usage

The XGBoost model is integrated into the main analysis pipeline and runs automatically when both services are started.

### Architecture

```
User Request → Node.js API (Port 3000)
                ↓
    Extract 45 Features (parser, APIs, AI)
                ↓
    Python ML API (Port 5000) → XGBoost Model
                ↓
    Scam Probability + Top Factors
                ↓
    AI Explainer (OpenAI) → Human-readable Report
                ↓
    JSON Response → Frontend
```

### Manual Setup (If Not Using `npm run start:all`)

1. **Navigate to the model directory**:

```bash
cd lumos_XGBoost
```

2. **Create and activate virtual environment**:

```bash
# Create venv
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate
```

3. **Install Python dependencies**:

```bash
pip install -r requirements.txt
```

**Common Issues:**
- If using Python 3.13, you may see scikit-learn version warnings (model trained with 1.7.2, runs with 1.6.1)
- The model will still work despite warnings
- For production, consider retraining with matching scikit-learn version

4. **Start the Flask API server**:

```bash
python api_server.py
```

The API will run on `http://localhost:5000`

### XGBoost API Endpoints

#### Health Check

```http
GET http://localhost:5000/health
```

**Response:**
```json
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

#### Predict Scam Probability

```http
POST http://localhost:5000/predict
Content-Type: application/json

{
  ""char_count"": 156,
  ""word_count"": 23,
  ""url_count"": 1,
  ""phone_count"": 1,
  ""urgency_level"": 8,
  ""threat_level"": 7,
  ... (all 45 features)
}
```

**Response:**

```json
{
  ""success"": true,
  ""result"": {
    ""is_scam"": true,
    ""scam_probability"": 0.87,
    ""normal_probability"": 0.13,
    ""confidence"": ""High"",
    ""prediction_label"": ""Scam"",
    ""top_scam_factors"": [
      {
        ""feature"": ""urgency_level"",
        ""value"": 8.0,
        ""importance"": 0.085,
        ""contribution_score"": 0.68
      },
      {
        ""feature"": ""url_is_shortened"",
        ""value"": 1.0,
        ""importance"": 0.072,
        ""contribution_score"": 0.072
      }
    ]
  }
}
```

#### Get Model Information

```http
GET http://localhost:5000/model/info
```

### Integration Flow

The Node.js backend automatically:

1. ✅ Extracts 45 features using existing services
2. ✅ Calls XGBoost API at `http://localhost:5000/predict`
3. ✅ Receives scam probability and top contributing factors
4. ✅ Sends all data to OpenAI for human-readable explanation
5. ✅ Returns final report to frontend

**Graceful Degradation:** If XGBoost API is unavailable, the system automatically falls back to rule-based scoring.

For detailed integration documentation, see:
- `lumos_XGBoost/INTEGRATION_GUIDE.md` - Technical integration details
- `XGBOOST_INTEGRATION.md` - Architecture and workflow
- `TESTING_PROCEDURE.md` - Step-by-step testing guide

## Development Tips

- Use `nodemon` for development with auto-restart on file changes
- Keep API Keys secure, do not commit to Git
- Test API with Postman, curl, or the web interface (`test.html`)
- Training data is saved to `training_data.csv` (gitignored)
- Each API call costs money - be mindful when batch processing

## License

MIT


================================================================================
FILE: TESTING_PROCEDURE.md
================================================================================
# Integration Test & Cleanup Procedure

## Step 1: Cleanup (Remove incorrect .venv)

**Why?** The outer `.venv` should NOT exist. Only `lumos_XGBoost/.venv` should exist.

```powershell
# Remove outer .venv (if it exists)
cd C:\Users\ander\OneDrive\Documents\GitHub\HackTheSource_Lumos
Remove-Item -Recurse -Force .venv -ErrorAction SilentlyContinue
```

---

## Step 2: Verify Environment Structure

```powershell
# Check current directory structure
Get-ChildItem -Directory | Select-Object Name

# Expected output should NOT show .venv in root
# But should show: lumos_XGBoost, src, training, etc.
```

---

## Step 3: Start Python API Service

**Terminal 1** - Start Python ML API:

```powershell
# Navigate to ML model directory
cd C:\Users\ander\OneDrive\Documents\GitHub\HackTheSource_Lumos\lumos_XGBoost

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start Python Flask API
python api_server.py
```

**Expected Output:**
```
🚀 Starting API service...
✅ Model loaded successfully
🌐 API Service Started
* Running on http://127.0.0.1:5000
```

**Keep this terminal running!**

---

## Step 4: Test Python API (in another terminal)

**Terminal 2** - Test Python API:

```powershell
# Test health endpoint
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

---

## Step 5: Start Node.js API Service

**Terminal 2** (same terminal, or open Terminal 3):

```powershell
# Navigate back to project root
cd C:\Users\ander\OneDrive\Documents\GitHub\HackTheSource_Lumos

# Start Node.js API
npm run dev
```

**Expected Output:**
```
🚀 Server is running on http://localhost:3000
```

**Keep this terminal running too!**

---

## Step 6: Test Node.js API (Integration Test)

**Terminal 3** - Test the integration:

```powershell
# Test with a scam message
$body = @{
    message = ""URGENT! You won $1000! Click http://bit.ly/prize now! Call 0912345678""
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/analyze `
    -Method POST `
    -ContentType ""application/json"" `
    -Body $body
```

**Expected Response (should include ML score):**
```json
{
  ""riskLevel"": ""red"",
  ""riskScore"": 85,
  ""mlScore"": 90,          // <-- ML model is working!
  ""evidence"": [
    ""🤖 ML Model: 90% scam probability (High confidence)"",
    ""⚠️ URL is shortened link"",
    ""⚠️ Phone is VoIP"",
    ...
  ],
  ""action"": { ... }
}
```

---

## ✅ Success Indicators

Your integration is working if you see:

1. ✅ **Python API**: `model_loaded: true` in health check
2. ✅ **Node.js API**: Server starts without errors
3. ✅ **Response includes**: `""mlScore"": 90` (or any number)
4. ✅ **Evidence includes**: ""🤖 ML Model: X% scam probability""
5. ✅ **Console shows**: ""🤖 XGBoost prediction: 0.XX""

---

## ❌ Troubleshooting

### Issue 1: Python API not starting

**Check virtual environment:**
```powershell
cd lumos_XGBoost
Test-Path .\.venv\Scripts\python.exe
```

**If False, recreate venv:**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install pandas numpy scikit-learn==1.6.1 xgboost joblib matplotlib seaborn flask flask-cors nltk
```

### Issue 2: Node.js can't connect to Python

**Check if Python API is running:**
```powershell
curl http://localhost:5000/health
```

**Check .env has correct URL:**
```powershell
Get-Content .env | Select-String ""XGBOOST""
```

Should show: `XGBOOST_API_URL=http://localhost:5000`

### Issue 3: mlScore is null

**Means**: ML model not available, degraded to rule-based

**Check Node.js console for:**
```
⚠️ XGBoost not available, using rule-based scoring only
```

**Solution**: Ensure Python API is running first

---

## 🚀 Alternative: One-Command Start (After Testing)

Once you confirm everything works, you can use:

```powershell
npm run start:all
```

This starts both services simultaneously using `concurrently`.

---

## 📊 Test Results Checklist

- [ ] Outer `.venv` removed
- [ ] Python API starts successfully
- [ ] Python health check returns `model_loaded: true`
- [ ] Node.js API starts successfully
- [ ] Test request returns response with `mlScore`
- [ ] Evidence includes ""🤖 ML Model"" message
- [ ] Console shows XGBoost prediction logs

---

## 📝 Notes

- **Python API Port**: 5000
- **Node.js API Port**: 3000
- **Python venv location**: `lumos_XGBoost/.venv` ✅
- **Root .venv**: Should NOT exist ❌


================================================================================
FILE: XGBOOST_INTEGRATION.md
================================================================================
# XGBoost Integration Guide

## Architecture Overview

The system uses a **dual-service architecture** with Node.js and Python services running in parallel:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                    (Browser/API)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Node.js Express      │
              │   (Port 3000)          │
              │                        │
              │  - OCR Service         │
              │  - Parser              │
              │  - Google Safe Browse  │
              │  - Twilio Lookup       │
              │  - OpenAI Analysis     │
              │  - Feature Extractor   │
              └───────────┬────────────┘
                          │
                          │ HTTP Request
                          │ (45 features)
                          ▼
              ┌────────────────────────┐
              │   Python Flask API     │
              │   (Port 5000)          │
              │                        │
              │  - XGBoost Model       │
              │  - Scam Prediction     │
              │  - Return Probability  │
              └────────────────────────┘
```

## Scoring Mechanism

### Hybrid Scoring System

The system uses a **hybrid scoring mechanism** that combines machine learning models with rule-based scoring:

1. **When XGBoost is Available** (Recommended):
   - ML Model: 70% weight
   - Google Safe Browsing: 15% weight
   - Twilio Phone Check: 10% weight
   - OpenAI Analysis: 5% weight

2. **When XGBoost is Unavailable** (Fallback Mode):
   - Google Safe Browsing: 40% weight
   - Twilio Phone Check: 30% weight
   - OpenAI Analysis: 30% weight

### Feature Extraction (45 Features)

The system automatically extracts 45 features from messages:

- **Text Features (14)**: Character count, word count, digit ratio, uppercase ratio, special characters, etc.
- **URL Features (8)**: URL count, suspicious TLD, IP address, URL shortener, HTTPS, etc.
- **Phone Features (7)**: Phone count, VoIP, validity, carrier, etc.
- **AI Features (12)**: Urgency level, threat level, temptation level, impersonation type, etc.
- **Statistical Features (3)**: Entropy, readability, sentence complexity
- **URL Safety (1)**: Google Safe Browsing result

## Quick Start

### 1. Install Dependencies

#### Node.js Dependencies
```bash
npm install
```

#### Python Dependencies
```bash
cd lumos_XGBoost
pip install -r requirements.txt
cd ..
```

### 2. Start Services

#### Option 1: One-Command Start (Recommended)
```bash
npm run start:all
```

This will start both:
- Node.js API (Port 3000)
- Python Flask API (Port 5000)

#### Option 2: Start Separately

**Terminal 1 - Node.js API:**
```bash
npm run dev
```

**Terminal 2 - Python API:**
```bash
npm run ml:start
# or
cd lumos_XGBoost
python api_server.py
```

### 3. Test Integration

#### Health Check
```bash
# Check Node.js API
curl http://localhost:3000

# Check Python API
curl http://localhost:5000/health
```

#### Analyze Message
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H ""Content-Type: application/json"" \
  -d '{
    ""message"": ""Congratulations! You won a prize! Click http://bit.ly/scam123 immediately to claim. Contact: 0912345678""
  }'
```

#### Expected Response
```json
{
  ""riskLevel"": ""red"",
  ""riskScore"": 92,
  ""mlScore"": 95,
  ""evidence"": [
    ""🤖 ML Model: 95% scam probability (High confidence)"",
    ""⚠️ URL is shortened link"",
    ""⚠️ Phone is VoIP, commonly used in scams"",
    ""🔍 AI Analysis: Likely Scam"",
    ""   Reason: Contains urgency keywords and prize claims""
  ],
  ""action"": {
    ""title"": ""🚨 High Risk Warning"",
    ""suggestions"": [...]
  }
}
```

## Environment Variables

Add to your `.env` file:

```env
# Node.js API
PORT=3000
GOOGLE_SAFE_BROWSING_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
OPENAI_API_KEY=your_key

# XGBoost API URL
XGBOOST_API_URL=http://localhost:5000
```

## Degradation Strategy

The system implements a **graceful degradation** mechanism:

1. Attempts to connect to Python API on startup
2. If Python API is unavailable:
   - System continues to operate
   - Uses rule-based scoring
   - Logs warning messages
3. Automatically uses ML model when Python API recovers

This ensures high system availability!

## Troubleshooting

### Python API Won't Start

1. Confirm Python 3.x is installed
2. Confirm all dependencies are installed:
   ```bash
   cd lumos_XGBoost
   pip install -r requirements.txt
   ```
3. Confirm model file exists:
   ```bash
   ls lumos_XGBoost/scam_detector_model.pkl
   ```
4. If model doesn't exist, run training:
   ```bash
   cd lumos_XGBoost
   python train_model.py
   ```

### Port Conflict

If Port 5000 is occupied, modify `.env`:
```env
XGBOOST_API_URL=http://localhost:5001
```

Then modify the startup port in `lumos_XGBoost/api_server.py`.

### Feature Mismatch

If feature count doesn't match, ensure:
1. `featureExtractor.js` extracts 45 features
2. `feature_columns.json` contains all feature names
3. Model training uses the same features

## Performance Metrics

- **Node.js API Response Time**: ~500-800ms
  - OCR: 200-300ms
  - Google/Twilio/OpenAI (parallel): 200-400ms
  - Feature Extraction: 10-20ms
  - XGBoost Prediction: 50-100ms
  
- **XGBoost Model Performance**:
  - Accuracy: 78.3%
  - ROC-AUC: 0.938
  - F1 Score: 0.830

## Development Recommendations

1. **Development Stage**: Use `npm run start:all` to run both services
2. **Production Environment**: 
   - Use PM2 to manage Node.js service
   - Use gunicorn to manage Python service
   - Configure Nginx reverse proxy
3. **Monitoring**: 
   - Monitor Python API health status
   - Log ML model prediction results
   - Track degradation events


================================================================================
FILE: _metadata.json
================================================================================
{
  ""title"": ""Lumos"",
  ""url"": ""https://github.com/AndersonTsaiTW/HackTheSource_lumos.git"",
  ""index"": 1,
  ""size_mb"": 30,
  ""downloaded_at"": ""2026-01-02 22:18:25"",
  ""clone_mode"": ""shallow"",
  ""clone_depth"": 1,
  ""devpost_url"": ""https://devpost.com/software/corematrix"",
  ""devpost_id"": ""devpost-corematrix""
}

================================================================================
FILE: lumos_XGBoost/INTEGRATION_GUIDE.md
================================================================================
# 🔗 Node.js Integration & Separation Guide

> **Note**: This project is already integrated. This guide explains:
> 1. How to verify the integration is working
> 2. How to separate the ML model into a standalone service if needed

---

## 📋 Current Integration Status

### ✅ Already Integrated Components

1. **Node.js Services** (in `src/services/`)
   - `xgboostService.js` - Calls Python API
   - `featureExtractor.js` - Extracts 45 features
   - `analyzer.js` - Hybrid scoring (ML + rules)

2. **Python ML Model** (in `lumos_XGBoost/`)
   - `api_server.py` - Flask API server
   - `scam_detector_model.pkl` - Trained XGBoost model
   - `requirements.txt` - Python dependencies

3. **Configuration**
   - `package.json` - npm scripts for dual-service startup
   - `src/config.js` - XGBoost API URL configuration

---

## 🚀 Quick Start (Use Current Integration)

### 1. Complete Setup (First Time Only)

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd lumos_XGBoost
pip install -r requirements.txt
cd ..

# Add to .env file
echo ""XGBOOST_API_URL=http://localhost:5000"" >> .env
```

### 2. Start Both Services

```bash
# One command to start both Node.js and Python services
npm run start:all
```

This will:
- Start Node.js API on `http://localhost:3000`
- Start Python Flask API on `http://localhost:5000`

### 3. Test the Integration

```bash
# Test Node.js API (should call Python internally)
curl -X POST http://localhost:3000/api/analyze \
  -H ""Content-Type: application/json"" \
  -d '{""message"": ""URGENT! Click http://bit.ly/scam to claim prize! Call 0912345678""}'
```

Expected response includes:
```json
{
  ""riskScore"": 85,
  ""mlScore"": 90,
  ""riskLevel"": ""red"",
  ""evidence"": [
    ""🤖 ML Model: 90% scam probability (High confidence)"",
    ...
  ]
}
```

---

## 🔧 Troubleshooting Current Integration

### Issue: Missing XGBOOST_API_URL

**Symptom**: ML model not being used, only rule-based scoring

**Solution**: Add to `.env`
```env
XGBOOST_API_URL=http://localhost:5000
```

### Issue: Python Dependencies Not Installed

**Symptom**: `ModuleNotFoundError` when starting Python service

**Solution**:
```bash
cd lumos_XGBoost
pip install -r requirements.txt
```

### Issue: Model File Not Found

**Symptom**: `Model not loaded` error

**Solution**: Train the model
```bash
cd lumos_XGBoost
python train_model.py
```

---

## 📦 How to Separate ML Model (Optional)

If you want to deploy the ML model as a separate microservice:

### Option 1: Separate to Different Server

#### Step 1: Extract ML Model to Separate Project

```bash
# On your ML server
mkdir scam-detection-ml-service
cd scam-detection-ml-service

# Copy only ML files
cp -r /path/to/HackTheSource_Lumos/lumos_XGBoost/* .

# Install dependencies
pip install -r requirements.txt

# Start service (use production server)
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

#### Step 2: Update Node.js Project

In your Node.js project, update `.env`:
```env
# Point to remote ML service
XGBOOST_API_URL=http://ml-server.yourcompany.com:5000
```

Remove from `package.json` scripts:
```json
{
  ""scripts"": {
    ""start"": ""node src/index.js"",
    ""dev"": ""nodemon src/index.js""
    // Remove: ""ml:start"" and ""start:all""
  }
}
```

Keep these Node.js files (they still need to call remote ML service):
- `src/services/xgboostService.js`
- `src/services/featureExtractor.js`
- `src/utils/analyzer.js`

### Option 2: Dockerize ML Service

#### Create `lumos_XGBoost/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD [""gunicorn"", ""-w"", ""4"", ""-b"", ""0.0.0.0:5000"", ""api_server:app""]
```

#### Create `lumos_XGBoost/docker-compose.yml`

```yaml
version: '3.8'

services:
  ml-service:
    build: .
    ports:
      - ""5000:5000""
    volumes:
      - ./scam_detector_model.pkl:/app/scam_detector_model.pkl
      - ./feature_columns.json:/app/feature_columns.json
    environment:
      - FLASK_ENV=production
    restart: always
```

#### Run ML Service in Docker

```bash
cd lumos_XGBoost
docker-compose up -d
```

#### Update Node.js Project

```env
# .env
XGBOOST_API_URL=http://localhost:5000
# or for remote: http://ml-container:5000
```

---

## 🏗️ Separation Benefits vs Drawbacks

### Keep Integrated (Current Setup)

**Pros:**
- ✅ Simple deployment (one project)
- ✅ Easy local development
- ✅ No network latency between services
- ✅ Easier debugging

**Cons:**
- ❌ Python + Node.js on same server
- ❌ Can't scale ML service independently
- ❌ More complex dependency management

### Separate Services

**Pros:**
- ✅ Independent scaling (scale ML service separately)
- ✅ Independent deployment and updates
- ✅ Better resource management
- ✅ Can reuse ML service for other projects

**Cons:**
- ❌ Network latency between services
- ❌ More complex deployment
- ❌ Need to manage two projects
- ❌ Potential network failures

---

## 📊 API Endpoints Reference

### 1. Health Check

```http
GET http://localhost:5000/health
```

**Response:**
```json
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

### 2. Single Prediction

```http
POST http://localhost:5000/predict
Content-Type: application/json
```

**Request Body:**
```json
{
  ""char_count"": 156,
  ""word_count"": 23,
  ""url_count"": 1,
  ""phone_count"": 1,
  ""urgency_level"": 8,
  ""threat_level"": 7,
  ... (45 features total)
}
```

**Response:**
```json
{
  ""success"": true,
  ""result"": {
    ""is_scam"": true,
    ""scam_probability"": 0.8435,
    ""normal_probability"": 0.1565,
    ""confidence"": ""High"",
    ""prediction_label"": ""Scam""
  }
}
```

### 3. Batch Prediction

```http
POST http://localhost:5000/predict/batch
Content-Type: application/json
```

**Request Body:**
```json
{
  ""messages"": [
    {...features1...},
    {...features2...}
  ]
}
```

**Response:**
```json
{
  ""success"": true,
  ""results"": [
    {...result1...},
    {...result2...}
  ],
  ""count"": 2
}
```

### 4. Model Info

```http
GET http://localhost:5000/model/info
```

**Response:**
```json
{
  ""success"": true,
  ""info"": {
    ""feature_count"": 45,
    ""features"": [""char_count"", ""word_count"", ...]
  }
}
```

---

## 💻 Usage in Node.js

### Option 1: Use Example Module

```javascript
const { detectScam } = require('./lumos_XGBoost/nodejs_example');

// Prepare message features (45 features)
const features = {
  char_count: 156,
  word_count: 23,
  url_count: 1,
  phone_count: 1,
  urgency_level: 8,
  // ... other features
};

// Predict
const result = await detectScam(features);
console.log('Is scam:', result.result.is_scam);
console.log('Probability:', result.result.scam_probability);
```

### Option 2: Create Your Own Service

```javascript
const axios = require('axios');

class ScamDetectionService {
  constructor(apiUrl = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
  }

  async predict(features) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/predict`,
        features
      );
      return response.data;
    } catch (error) {
      console.error('Prediction failed:', error.message);
      throw error;
    }
  }

  async checkHealth() {
    const response = await axios.get(`${this.apiUrl}/health`);
    return response.data;
  }
}

// Usage
const detector = new ScamDetectionService();
const result = await detector.predict(messageFeatures);
```

---

## 🔧 Required Features (45 Total)

### Text Features (14)
- char_count, word_count, digit_count, digit_ratio
- uppercase_ratio, special_char_count, exclamation_count
- question_count, has_urgent_keywords, suspicious_word_count
- max_word_length, avg_word_length, emoji_count, consecutive_caps

### URL Features (8)
- url_count, has_suspicious_tld, has_ip_address
- has_url_shortener, avg_url_length, has_https
- url_path_depth, subdomain_count

### Phone Features (7)
- phone_count, has_intl_code, is_voip
- is_mobile, is_valid_phone, phone_carrier_known, has_multiple_phones

### AI Features (12)
- urgency_level, threat_level, temptation_level
- impersonation_type, action_requested, grammar_quality
- emotion_triggers, credibility_score
- ai_is_scam, ai_confidence, has_scam_keywords, keyword_count

### Statistical Features (3)
- text_entropy, readability_score, sentence_complexity

### URL Safety (1)
- google_safe_browsing_flagged

---

## 📊 Response Format

```javascript
{
  is_scam: boolean,              // true if message is classified as scam
  scam_probability: number,      // 0.0 to 1.0
  normal_probability: number,    // 0.0 to 1.0
  confidence: string,            // ""Low"", ""Medium"", ""High""
  prediction_label: string       // ""Scam"" or ""Normal""
}
```

### Confidence Levels
- **High**: probability > 0.75
- **Medium**: 0.60 <= probability <= 0.75
- **Low**: probability < 0.60

---

## 🐛 Troubleshooting

### Issue 1: Connection Failed (ECONNREFUSED)
**Solution**: Ensure Python API service is running at port 5000
```bash
python lumos_XGBoost/api_server.py
```

### Issue 2: Model Load Failed
**Solution**: Train the model first
```bash
cd lumos_XGBoost
python train_model.py
```

### Issue 3: Prediction Error (Missing Features)
**Solution**: Ensure all 45 features are provided. Check `feature_columns.json` for required feature names.

### Issue 4: Chinese Text Encoding
**Solution**: Ensure UTF-8 encoding in API requests
```javascript
axios.post(url, data, {
  headers: { 'Content-Type': 'application/json; charset=UTF-8' }
})
```

---

## 🔒 Production Recommendations

1. **Use Process Manager**
   ```bash
   # For Python service
   gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
   
   # For Node.js service
   pm2 start src/index.js
   ```

2. **Add Health Monitoring**
   - Monitor Python API uptime
   - Implement auto-restart on failure
   - Log prediction results

3. **Security**
   - Add API authentication
   - Rate limiting
   - Input validation

4. **Performance**
   - Use connection pooling
   - Cache frequent predictions
   - Batch requests when possible

---

## 📝 Testing

Run the test script:
```bash
node lumos_XGBoost/nodejs_example.js
```

Expected output:
```
==========================================================
🔍 Node.js Scam SMS Detection Example
==========================================================

1️⃣ Checking service status...
   Service status: { status: 'healthy', model_loaded: true }

2️⃣ Getting model information...
   Feature count: 45

3️⃣ Testing scam message detection...
   ✅ Prediction: Scam (84.35%)
   Confidence: High
```

---

## 📞 Need Help?

For more information, see:
- Main integration guide: [XGBOOST_INTEGRATION.md](../XGBOOST_INTEGRATION.md)
- Model documentation: [README.md](README.md)
- Open an issue on GitHub for support

在你的 Node 專案中建立啟動腳本:

```javascript
// start-ml-service.js
const { spawn } = require('child_process');
const path = require('path');

const pythonPath = path.join(__dirname, 'ml-model', '.venv', 'Scripts', 'python.exe');
const scriptPath = path.join(__dirname, 'ml-model', 'api_server.py');

const mlService = spawn(pythonPath, [scriptPath]);

mlService.stdout.on('data', (data) => {
  console.log(`[ML Service] ${data}`);
});

mlService.stderr.on('data', (data) => {
  console.error(`[ML Service Error] ${data}`);
});

mlService.on('close', (code) => {
  console.log(`ML Service exited with code ${code}`);
});

console.log('🚀 ML Service starting...');
```

在 `package.json` 中加入:

```json
{
  ""scripts"": {
    ""start:ml"": ""node start-ml-service.js"",
    ""dev"": ""concurrently \""npm run start:ml\"" \""npm run dev:server\""""
  }
}
```

---

## 📡 API 端點

### 1. Health Check

```javascript
GET http://localhost:5000/health

Response:
{
  ""status"": ""healthy"",
  ""model_loaded"": true
}
```

### 2. 單筆預測

```javascript
POST http://localhost:5000/predict
Content-Type: application/json

Request Body:
{
  // 文本欄位 (必要 - 模型使用文本特徵)
  ""message_text"": ""您的包裹需要補繳運費..."",
  ""openai_keywords"": ""包裹,運費,點擊"",
  ""openai_reason"": ""要求點擊可疑連結"",
  ""openai_emotion_triggers"": ""緊急,逾期"",
  ""openai_action_requested"": ""click_link"",
  ""openai_impersonation_type"": ""courier"",
  
  // 數值欄位 (33個)
  ""message_length"": 68,
  ""contains_urgent_words"": 1,
  ""has_url"": 1,
  // ... 其他欄位
}

Response:
{
  ""success"": true,
  ""result"": {
    ""is_scam"": true,
    ""scam_probability"": 0.8435,
    ""normal_probability"": 0.1565,
    ""confidence"": ""High"",
    ""prediction_label"": ""Scam"",
    ""top_scam_factors"": [
      {
        ""feature"": ""message_length"",
        ""value"": 68.0,
        ""importance"": 0.014,
        ""contribution_score"": 0.952
      },
      // ... 前5名
    ]
  }
}
```

### 3. 批次預測

```javascript
POST http://localhost:5000/predict/batch
Content-Type: application/json

Request Body:
{
  ""messages"": [
    { /* message 1 features */ },
    { /* message 2 features */ }
  ]
}

Response:
{
  ""success"": true,
  ""results"": [
    { /* result 1 */ },
    { /* result 2 */ }
  ],
  ""count"": 2
}
```

### 4. 模型資訊

```javascript
GET http://localhost:5000/model/info

Response:
{
  ""success"": true,
  ""info"": {
    ""feature_count"": 79,
    ""features"": [""message_length"", ""tfidf_msg_0"", ...]
  }
}
```

---

## 💻 在 Node.js 中使用

### 方式 1: 直接使用範例模組

```javascript
// your-app.js
const scamDetector = require('./ml-model/nodejs_example');

async function checkMessage(messageData) {
  try {
    // 單筆預測
    const result = await scamDetector.detectScam(messageData);
    
    console.log('Is scam:', result.result.is_scam);
    console.log('Probability:', result.result.scam_probability);
    console.log('Top factors:', result.result.top_scam_factors);
    
    return result.result;
  } catch (error) {
    console.error('Detection failed:', error);
    throw error;
  }
}
```

### 方式 2: 建立自己的服務類別

```javascript
// services/ScamDetectionService.js
const axios = require('axios');

class ScamDetectionService {
  constructor(apiUrl = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
  }

  async predict(messageData) {
    try {
      const response = await axios.post(`${this.apiUrl}/predict`, messageData);
      return response.data.result;
    } catch (error) {
      console.error('Scam detection error:', error.message);
      throw error;
    }
  }

  async predictBatch(messages) {
    try {
      const response = await axios.post(`${this.apiUrl}/predict/batch`, {
        messages
      });
      return response.data.results;
    } catch (error) {
      console.error('Batch prediction error:', error.message);
      throw error;
    }
  }

  async isHealthy() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`);
      return response.data.model_loaded;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ScamDetectionService;
```

使用範例:

```javascript
const ScamDetectionService = require('./services/ScamDetectionService');
const detector = new ScamDetectionService();

// 在你的 route 或 controller 中
app.post('/api/check-sms', async (req, res) => {
  try {
    const { message_text, ...otherFeatures } = req.body;
    
    // 確保服務健康
    if (!await detector.isHealthy()) {
      return res.status(503).json({ 
        error: 'ML service unavailable' 
      });
    }
    
    // 預測
    const result = await detector.predict({
      message_text,
      ...otherFeatures
    });
    
    res.json({
      success: true,
      prediction: result
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});
```

---

## 🔧 必要欄位說明

### 文本欄位 (Text Features)
- `message_text`: 簡訊內容 (必要)
- `openai_keywords`: OpenAI 提取的關鍵字
- `openai_reason`: 判斷原因
- `openai_emotion_triggers`: 情緒觸發詞
- `openai_action_requested`: 要求的行動 (click_link, reply, call_number, provide_info)
- `openai_impersonation_type`: 冒充類型 (company, bank, government, courier)

### 數值欄位 (Numeric Features) - 33個
- `message_length`: 訊息長度
- `contains_urgent_words`: 是否包含緊急詞彙 (0/1)
- `contains_money_keywords`: 是否包含金錢關鍵字 (0/1)
- `has_url`: 是否有網址 (0/1)
- `url_is_shortened`: 是否為短網址 (0/1)
- `openai_is_scam`: OpenAI 判斷是否詐騙 (0/1)
- `openai_confidence`: OpenAI 信心分數 (0-100)
- `openai_urgency_level`: 緊急程度 (0-10)
- `openai_threat_level`: 威脅程度 (0-10)
- `openai_credibility_score`: 可信度分數 (0-10)
- ... 等 (共33個)

完整欄位列表請參考 `feature_columns.json`

---

## 📊 回傳結果說明

```javascript
{
  is_scam: boolean,              // 是否為詐騙
  scam_probability: number,      // 詐騙機率 (0-1)
  normal_probability: number,    // 正常機率 (0-1)
  confidence: string,            // 信心水準: ""High"" / ""Medium"" / ""Low""
  prediction_label: string,      // 預測標籤: ""Scam"" / ""Normal""
  top_scam_factors: [            // 前5大支持詐騙的特徵
    {
      feature: string,           // 特徵名稱
      value: number,             // 特徵值
      importance: number,        // 模型中的重要性
      contribution_score: number // 貢獻分數 = importance × value
    }
  ]
}
```

### 信心水準判定
- **High**: 詐騙機率 ≥ 80%
- **Medium**: 詐騙機率 60-80%
- **Low**: 詐騙機率 < 60%

---

## 🐛 除錯提示

### 問題 1: 連線失敗 (ECONNREFUSED)
```
解決方法: 確認 Python API 服務已啟動
python api_server.py
```

### 問題 2: 模型載入失敗
```
解決方法: 
1. 確認 scam_detector_model.pkl 存在
2. 檢查 Python 依賴是否完整安裝
   pip install -r requirements.txt
```

### 問題 3: 預測錯誤 (缺少特徵)
```
解決方法: 確保提供所有必要欄位
- 文本欄位: message_text (必要)
- 至少提供基本數值欄位，缺少的會自動填 0
```

### 問題 4: 中文亂碼
```
解決方法: 確保 API 請求使用 UTF-8 編碼
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
```

---

## 🔒 生產環境建議

1. **使用 PM2 管理 Python 服務**
   ```bash
   npm install -g pm2
   pm2 start api_server.py --interpreter python
   ```

2. **加入錯誤重試機制**
   ```javascript
   const axiosRetry = require('axios-retry');
   axiosRetry(axios, { retries: 3 });
   ```

3. **設定 timeout**
   ```javascript
   axios.post(url, data, { timeout: 5000 });
   ```

4. **加入快取機制** (針對相同訊息)
   ```javascript
   const cache = new Map();
   // 檢查 cache 再呼叫 API
   ```

5. **使用環境變數管理 URL**
   ```javascript
   const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
   ```

---

## 📝 測試

執行範例測試:

```bash
# 1. 啟動 API 服務
cd ml-model
python api_server.py

# 2. 在另一個終端執行 Node.js 測試
node ml-model/nodejs_example.js
```

你應該會看到完整的測試結果,包括預測結果和前五大因子。

---

## 📞 需要幫助?

- 檢查 `model_metrics.json` 查看模型效能
- 檢查 `feature_importance.png` 查看特徵重要性
- 參考 `nodejs_example.js` 完整範例代碼


================================================================================
FILE: lumos_XGBoost/README.md
================================================================================
# Scam Message Detection Model

XGBoost-based scam message classification model with REST API for Node.js integration.

## 📊 Model Information

- **Training Data**: 111 messages (77 scam, 34 normal)
- **Algorithm**: XGBoost
- **Features**: 33
- **Test Accuracy**: 78.3%
- **ROC-AUC**: 0.938
- **Cross-validated F1**: 0.830 (±0.089)

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train Model

```bash
python train_model.py
```

This generates:
- `scam_detector_model.pkl` - Trained model
- `feature_importance.png` - Feature importance chart
- `model_metrics.json` - Model evaluation metrics
- `feature_columns.json` - Feature column list

### 3. Test Prediction

```bash
python predict.py
```

### 4. Start API Service

```bash
python api_server.py
```

Service runs at `http://localhost:5000`

## 🌐 API Endpoints

### Health Check
```http
GET /health
```

### Single Message Prediction
```http
POST /predict
Content-Type: application/json

{
  ""message_length"": 300,
  ""contains_urgent_words"": 1,
  ""contains_money_keywords"": 1,
  ...
}
```

### Batch Prediction
```http
POST /predict/batch
Content-Type: application/json

{
  ""messages"": [
    {...features1...},
    {...features2...}
  ]
}
```

### Model Info
```http
GET /model/info
```

## 📱 Node.js Integration

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Run Example

```bash
node nodejs_example.js
```

### 3. Use in Your Node.js Project

```javascript
const { detectScam } = require('./nodejs_example');

// Prepare message features
const messageFeatures = {
  message_length: 300,
  contains_urgent_words: 1,
  contains_money_keywords: 1,
  // ... other features
};

// Predict
const result = await detectScam(messageFeatures);

if (result.success) {
  console.log('Is scam:', result.result.is_scam);
  console.log('Scam probability:', result.result.scam_probability);
  console.log('Confidence level:', result.result.confidence);
}
```

## 🔑 Top Features (Top 10)

1. `avg_word_length` - Average word length (18.81%)
2. `digit_ratio` - Digit ratio (13.86%)
3. `exclamation_count` - Exclamation mark count (8.63%)
4. `openai_credibility_score` - OpenAI credibility score (8.16%)
5. `question_count` - Question mark count (7.42%)
6. `openai_grammar_quality` - Grammar quality (6.97%)
7. `openai_urgency_level` - Urgency level (6.94%)
8. `special_char_count` - Special character count (6.39%)
9. `openai_temptation_level` - Temptation level (6.03%)
10. `contains_link_text` - Contains link text (5.13%)

## 📂 File Structure

```
HackTheSource_Model/
├── training_data.csv          # Training data
├── train_model.py             # Model training script
├── predict.py                 # Prediction script
├── api_server.py              # Flask API service
├── nodejs_example.js          # Node.js integration example
├── requirements.txt           # Python dependencies
├── package.json               # Node.js dependencies
├── scam_detector_model.pkl    # Trained model
├── feature_importance.png     # Feature importance chart
├── model_metrics.json         # Model evaluation metrics
└── feature_columns.json       # Feature column list
```

## ⚠️ Important Notes

1. **Small Dataset**: Currently only 111 training samples. Recommend collecting more samples to improve performance
2. **Class Imbalance**: Scam:Normal = 2.26:1, handled with class_weight
3. **False Positive Rate**: May have higher false positive rate (classifying normal as scam). Adjust threshold for production use
4. **Feature Engineering**: Model performance heavily depends on feature extraction quality

## 🔄 Improvement Suggestions

1. **Increase Training Data**: Collect more normal message samples (target 500-1000)
2. **Adjust Threshold**: Tune classification threshold based on requirements (default 0.5)
3. **Feature Optimization**: Analyze misclassified cases, optimize feature extraction
4. **Regular Retraining**: Retrain model periodically as data accumulates

## 📞 Issue Reporting

For any questions or suggestions, please open an issue for discussion.


================================================================================
FILE: lumos_XGBoost/api_server.py
================================================================================
""""""
Flask API Service
Provide REST API for Node.js to call scam detection model
""""""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import ScamPredictor
import traceback
import sys
import io
import os

# Fix Windows encoding issue
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load model
print(""🚀 Starting API service..."")
try:
    predictor = ScamPredictor()
    print(""✅ Model loaded successfully"")
except Exception as e:
    print(f""❌ Model loading failed: {e}"")
    predictor = None

@app.route('/health', methods=['GET'])
def health_check():
    """"""Health check""""""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """"""
    Predict single message
    
    POST /predict
    Content-Type: application/json
    
    Request Body:
    {
        ""message_length"": 300,
        ""contains_urgent_words"": 1,
        ""contains_money_keywords"": 1,
        ...other features
    }
    
    Response:
    {
        ""success"": true,
        ""result"": {
            ""is_scam"": true,
            ""scam_probability"": 0.95,
            ""normal_probability"": 0.05,
            ""confidence"": ""High"",
            ""prediction_label"": ""Scam""
        }
    }
    """"""
    try:
        if predictor is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Please provide message feature data'
            }), 400
        
        # Predict
        result = predictor.predict(data)
        
        return jsonify({
            'success': True,
            'result': result
        })
    
    except Exception as e:
        print(f""❌ Prediction error: {e}"")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """"""
    Batch prediction
    
    POST /predict/batch
    Content-Type: application/json
    
    Request Body:
    {
        ""messages"": [
            {...features1...},
            {...features2...}
        ]
    }
    
    Response:
    {
        ""success"": true,
        ""results"": [
            {...result1...},
            {...result2...}
        ]
    }
    """"""
    try:
        if predictor is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get request data
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({
                'success': False,
                'error': 'Please provide messages array'
            }), 400
        
        messages = data['messages']
        
        if not isinstance(messages, list):
            return jsonify({
                'success': False,
                'error': 'messages must be an array'
            }), 400
        
        # Batch prediction
        results = predictor.predict_batch(messages)
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    
    except Exception as e:
        print(f""❌ Batch prediction error: {e}"")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """"""Get model information""""""
    try:
        if predictor is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        return jsonify({
            'success': True,
            'info': {
                'feature_count': len(predictor.feature_columns),
                'features': predictor.feature_columns
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Get port from environment variable (for Railway, Render, etc.)
    port = int(os.environ.get('PORT', 5000))
    
    print(""\n"" + ""="" * 60)
    print(""🌐 API Service Started"")
    print(""="" * 60)
    print(""\nAvailable Endpoints:"")
    print(""  GET  /health          - Health check"")
    print(""  POST /predict         - Single message prediction"")
    print(""  POST /predict/batch   - Batch prediction"")
    print(""  GET  /model/info      - Model information"")
    print(f""\nService Address: http://0.0.0.0:{port}"")
    print(""="" * 60 + ""\n"")
    
    app.run(host='0.0.0.0', port=port, debug=False)


================================================================================
FILE: lumos_XGBoost/model_metrics.json
================================================================================
{
  ""train_accuracy"": 0.9204545454545454,
  ""test_accuracy"": 0.8695652173913043,
  ""roc_auc"": 0.8928571428571429,
  ""confusion_matrix"": [
    [
      6,
      1
    ],
    [
      2,
      14
    ]
  ],
  ""timestamp"": ""2025-12-04T11:39:16.222407""
}

================================================================================
FILE: lumos_XGBoost/nodejs_example.js
================================================================================
// Node.js Integration Example
// Demonstrates how to call Python API service from Node.js

const axios = require('axios');

// API service address
const API_URL = 'http://localhost:5000';

/**
 * Detect if a single message is scam
 * @param {Object} messageFeatures - Message features
 * @returns {Promise<Object>} Prediction result
 */
async function detectScam(messageFeatures) {
  try {
    const response = await axios.post(`${API_URL}/predict`, messageFeatures);
    return response.data;
  } catch (error) {
    console.error('Prediction failed:', error.message);
    throw error;
  }
}

/**
 * Batch predict multiple messages
 * @param {Array<Object>} messages - Array of message features
 * @returns {Promise<Object>} Batch prediction result
 */
async function detectScamBatch(messages) {
  try {
    const response = await axios.post(`${API_URL}/predict/batch`, {
      messages: messages
    });
    return response.data;
  } catch (error) {
    console.error('Batch prediction failed:', error.message);
    throw error;
  }
}

/**
 * Check API service health status
 * @returns {Promise<Object>} Health status
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    throw error;
  }
}

/**
 * Get model information
 * @returns {Promise<Object>} Model information
 */
async function getModelInfo() {
  try {
    const response = await axios.get(`${API_URL}/model/info`);
    return response.data;
  } catch (error) {
    console.error('Failed to get model info:', error.message);
    throw error;
  }
}

// ========== Usage Examples ==========

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 Node.js Scam SMS Detection Example');
  console.log('='.repeat(60));

  try {
    // 1. Check service health status
    console.log('\n1️⃣ Checking service status...');
    const health = await checkHealth();
    console.log('   Service status:', health);

    // 2. Get model information
    console.log('\n2️⃣ Getting model information...');
    const modelInfo = await getModelInfo();
    console.log('   Feature count:', modelInfo.info.feature_count);

    // 3. Single message prediction - Suspected scam (with text features)
    console.log('\n3️⃣ Testing scam message detection...');
    const scamMessage = {
      // Text features
      message_text: '【緊急通知】您的包裹因地址不詳無法配送,請立即點擊 http://bit.ly/pkg123 補填資料並支付運費99元,逾期將退回!',
      openai_keywords: '緊急,包裹,點擊,支付,運費',
      openai_reason: '要求點擊可疑連結並支付金錢,使用緊急語氣施壓',
      openai_emotion_triggers: '緊急,逾期,退回',
      openai_action_requested: 'click_link',
      openai_impersonation_type: 'courier',
      
      // Numeric features
      message_length: 68,
      contains_urgent_words: 1,
      contains_money_keywords: 1,
      contains_link_text: 1,
      has_url: 1,
      url_is_shortened: 1,
      special_char_count: 15,
      exclamation_count: 1,
      openai_is_scam: 1,
      openai_confidence: 95,
      openai_urgency_level: 9,
      openai_threat_level: 7,
      openai_credibility_score: 2,
      avg_word_length: 4.5,
      digit_ratio: 0.1,
      uppercase_ratio: 0.05,
      contains_phone: 0,
      phone_count: 0,
      has_email: 0,
      number_sequence_count: 1,
      contains_time_sensitive: 1,
      question_mark_count: 0,
      capitalized_word_count: 0,
      word_count: 30,
      unique_word_ratio: 0.8,
      punctuation_ratio: 0.1,
      contains_please: 0,
      contains_verify: 0,
      contains_account: 0,
      contains_prize: 0,
      contains_act_now: 0
    };

    const scamResult = await detectScam(scamMessage);
    console.log('   Prediction:', scamResult.result.prediction_label);
    console.log('   Scam probability:', (scamResult.result.scam_probability * 100).toFixed(2) + '%');
    console.log('   Confidence level:', scamResult.result.confidence);
    
    // Display top scam factors
    if (scamResult.result.top_scam_factors && scamResult.result.top_scam_factors.length > 0) {
      console.log('   Top 5 scam factors:');
      scamResult.result.top_scam_factors.forEach((factor, idx) => {
        console.log(`     ${idx + 1}. ${factor.feature}: ${factor.value.toFixed(4)} (importance: ${factor.importance.toFixed(4)})`);
      });
    }

    // 4. Single message prediction - Normal message (with text features)
    console.log('\n4️⃣ Testing normal message detection...');
    const normalMessage = {
      // Text features
      message_text: '您好,這是來自銀行的通知:您的信用卡帳單已產生,本期應繳金額3500元,繳款期限為本月25日。',
      openai_keywords: '銀行,信用卡,帳單,繳款',
      openai_reason: '正常的銀行帳單通知,無要求立即行動或點擊連結',
      openai_emotion_triggers: '',
      openai_action_requested: 'reply',
      openai_impersonation_type: 'bank',
      
      // Numeric features
      message_length: 45,
      contains_urgent_words: 0,
      contains_money_keywords: 1,
      contains_link_text: 0,
      has_url: 0,
      url_is_shortened: 0,
      special_char_count: 5,
      exclamation_count: 0,
      openai_is_scam: 0,
      openai_confidence: 85,
      openai_urgency_level: 2,
      openai_threat_level: 0,
      openai_credibility_score: 8,
      avg_word_length: 4.2,
      digit_ratio: 0.08,
      uppercase_ratio: 0.0,
      contains_phone: 0,
      phone_count: 0,
      has_email: 0,
      number_sequence_count: 2,
      contains_time_sensitive: 1,
      question_mark_count: 0,
      capitalized_word_count: 0,
      word_count: 25,
      unique_word_ratio: 0.9,
      punctuation_ratio: 0.05,
      contains_please: 0,
      contains_verify: 0,
      contains_account: 0,
      contains_prize: 0,
      contains_act_now: 0
    };

    const normalResult = await detectScam(normalMessage);
    console.log('   Prediction:', normalResult.result.prediction_label);
    console.log('   Scam probability:', (normalResult.result.scam_probability * 100).toFixed(2) + '%');
    console.log('   Confidence level:', normalResult.result.confidence);
    
    // Display top factors
    if (normalResult.result.top_scam_factors && normalResult.result.top_scam_factors.length > 0) {
      console.log('   Top 5 factors:');
      normalResult.result.top_scam_factors.forEach((factor, idx) => {
        console.log(`     ${idx + 1}. ${factor.feature}: ${factor.value.toFixed(4)} (importance: ${factor.importance.toFixed(4)})`);
      });
    }

    // 5. Batch prediction
    console.log('\n5️⃣ Testing batch prediction...');
    const batchResult = await detectScamBatch([scamMessage, normalMessage]);
    console.log('   Prediction count:', batchResult.count);
    batchResult.results.forEach((result, index) => {
      console.log(`   Message ${index + 1}: ${result.prediction_label} (${(result.scam_probability * 100).toFixed(2)}%)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Complete');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Please start Python API service first');
      console.log('   Run: python api_server.py');
    }
  }
}

// Execute example
if (require.main === module) {
  main();
}

// Export functions for use by other modules
module.exports = {
  detectScam,
  detectScamBatch,
  checkHealth,
  getModelInfo
};


================================================================================
FILE: lumos_XGBoost/package.json
================================================================================
{
  ""name"": ""scam-detector-client"",
  ""version"": ""1.0.0"",
  ""description"": ""Node.js client for scam detection API"",
  ""main"": ""nodejs_example.js"",
  ""scripts"": {
    ""test"": ""node nodejs_example.js""
  },
  ""dependencies"": {
    ""axios"": ""^1.6.0""
  }
}


================================================================================
FILE: lumos_XGBoost/predict.py
================================================================================
""""""
Scam SMS Prediction Script
Load trained model for prediction
""""""

import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

class ScamPredictor:
    def __init__(self, model_path='scam_detector_model.pkl'):
        """"""Load model""""""
        print(""📦 Loading model..."")
        model_data = joblib.load(model_path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.tfidf_vectorizer = model_data.get('tfidf_vectorizer')
        self.keyword_vectorizer = model_data.get('keyword_vectorizer')
        self.feature_columns = model_data['feature_columns']
        self.use_text_features = model_data.get('use_text_features', False)
        print(f""✅ Model loaded successfully (features: {len(self.feature_columns)})"")
        if self.use_text_features:
            print(f""   Text features enabled: TF-IDF vectorizers loaded"")
    
    def prepare_features(self, message_data):
        """"""
        Prepare features for prediction
        message_data: dict containing all feature columns (including text fields)
        """"""
        # Create DataFrame
        df = pd.DataFrame([message_data])
        
        # Extract text features if model was trained with them
        if self.use_text_features and self.tfidf_vectorizer is not None:
            df = self._extract_text_features(df)
        
        # Ensure all feature columns exist
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Keep only required features
        X = df[self.feature_columns].fillna(0)
        
        # Handle data types
        for col in X.columns:
            if X[col].dtype == 'object':
                try:
                    X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)
                except:
                    X[col] = 0
        
        return X
    
    def _extract_text_features(self, df):
        """"""Extract text features during prediction (mirrors training process)""""""
        
        # Fill missing text - ensure columns exist first
        if 'message_text' not in df.columns:
            df['message_text'] = ''
        if 'openai_reason' not in df.columns:
            df['openai_reason'] = ''
        if 'openai_keywords' not in df.columns:
            df['openai_keywords'] = ''
        if 'openai_emotion_triggers' not in df.columns:
            df['openai_emotion_triggers'] = ''
        if 'openai_action_requested' not in df.columns:
            df['openai_action_requested'] = ''
        if 'openai_impersonation_type' not in df.columns:
            df['openai_impersonation_type'] = ''
        
        # Fill NaN values
        df['message_text'] = df['message_text'].fillna('')
        df['openai_reason'] = df['openai_reason'].fillna('')
        df['openai_keywords'] = df['openai_keywords'].fillna('')
        df['openai_emotion_triggers'] = df['openai_emotion_triggers'].fillna('')
        df['openai_action_requested'] = df['openai_action_requested'].fillna('')
        df['openai_impersonation_type'] = df['openai_impersonation_type'].fillna('')
        
        # 1. TF-IDF from message_text
        if self.tfidf_vectorizer is not None:
            try:
                tfidf_matrix = self.tfidf_vectorizer.transform(df['message_text'])
                tfidf_features = pd.DataFrame(
                    tfidf_matrix.toarray(),
                    columns=[f'tfidf_msg_{i}' for i in range(tfidf_matrix.shape[1])],
                    index=df.index
                )
                df = pd.concat([df, tfidf_features], axis=1)
            except Exception as e:
                print(f""Warning: TF-IDF transform failed: {e}"")
        
        # 2. TF-IDF from openai_keywords
        if self.keyword_vectorizer is not None:
            try:
                keyword_tfidf_matrix = self.keyword_vectorizer.transform(df['openai_keywords'])
                keyword_tfidf_features = pd.DataFrame(
                    keyword_tfidf_matrix.toarray(),
                    columns=[f'tfidf_kw_{i}' for i in range(keyword_tfidf_matrix.shape[1])],
                    index=df.index
                )
                df = pd.concat([df, keyword_tfidf_features], axis=1)
            except Exception as e:
                print(f""Warning: Keyword TF-IDF transform failed: {e}"")
        
        # 3. Keyword count
        df['keyword_count'] = df['openai_keywords'].apply(
            lambda x: len(str(x).split(',')) if pd.notna(x) and str(x).strip() else 0
        )
        
        # 4. Reason length
        df['reason_length'] = df['openai_reason'].apply(
            lambda x: len(str(x)) if pd.notna(x) else 0
        )
        
        # 5. Emotion trigger count
        df['emotion_trigger_count'] = df['openai_emotion_triggers'].apply(
            lambda x: len(str(x).split(',')) if pd.notna(x) and str(x).strip() else 0
        )
        
        # 6. Action type one-hot encoding
        common_actions = ['click_link', 'reply', 'call_number', 'provide_info']
        for action in common_actions:
            df[f'action_{action}'] = df['openai_action_requested'].apply(
                lambda x: 1 if str(x).lower() == action else 0
            )
        
        # 7. Impersonation type one-hot encoding
        common_impersonations = ['company', 'bank', 'government', 'courier']
        for imp_type in common_impersonations:
            df[f'impersonate_{imp_type}'] = df['openai_impersonation_type'].apply(
                lambda x: 1 if str(x).lower() == imp_type else 0
            )
        
        return df
    
    def predict(self, message_data):
        """"""
        Predict single message
        Returns: dict with prediction results and top contributing features
        """"""
        # Prepare features
        X = self.prepare_features(message_data)
        
        # Standardize
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0]
        
        # Determine confidence level
        scam_prob = probability[1]
        if scam_prob >= 0.8:
            confidence = ""High""
        elif scam_prob >= 0.6:
            confidence = ""Medium""
        else:
            confidence = ""Low""
        
        # Get top 5 features supporting scam prediction
        top_features = self._get_top_features(X, prediction)
        
        return {
            'is_scam': bool(prediction == 1),
            'scam_probability': float(scam_prob),
            'normal_probability': float(probability[0]),
            'confidence': confidence,
            'prediction_label': 'Scam' if prediction == 1 else 'Normal',
            'top_scam_factors': top_features
        }
    
    def _get_top_features(self, X, prediction):
        """"""
        Get top 5 features contributing to scam prediction
        """"""
        try:
            # Get feature importances from model
            feature_importances = self.model.feature_importances_
            
            # Get feature values for this instance
            feature_values = X.values[0]
            
            # Calculate contribution score (importance * value)
            contributions = []
            for i, (feat_name, importance, value) in enumerate(zip(self.feature_columns, feature_importances, feature_values)):
                if value > 0:  # Only consider non-zero features
                    contributions.append({
                        'feature': feat_name,
                        'value': float(value),
                        'importance': float(importance),
                        'contribution_score': float(importance * value)
                    })
            
            # Sort by contribution score and get top 5
            contributions.sort(key=lambda x: x['contribution_score'], reverse=True)
            top_5 = contributions[:5]
            
            return top_5
        except Exception as e:
            print(f""Warning: Could not calculate top features: {e}"")
            return []
    
    def predict_batch(self, messages_data):
        """"""Batch prediction""""""
        results = []
        for msg_data in messages_data:
            result = self.predict(msg_data)
            results.append(result)
        return results

def demo():
    """"""Demo prediction functionality""""""
    print(""="" * 60)
    print(""🔍 Scam SMS Prediction Demo"")
    print(""="" * 60)
    
    # Load model
    predictor = ScamPredictor()
    
    # Test case 1: Potential scam message with text features
    test_message_1 = {
        # Text features
        'message_text': '【緊急通知】您的包裹因地址不詳無法配送,請立即點擊 http://bit.ly/pkg123 補填資料並支付運費99元,逾期將退回!',
        'openai_keywords': '緊急,包裹,點擊,支付,運費',
        'openai_reason': '要求點擊可疑連結並支付金錢,使用緊急語氣施壓',
        'openai_emotion_triggers': '緊急,逾期,退回',
        'openai_action_requested': 'click_link',
        'openai_impersonation_type': 'courier',
        
        # Numeric features
        'message_length': 68,
        'contains_urgent_words': 1,
        'contains_money_keywords': 1,
        'contains_link_text': 1,
        'has_url': 1,
        'url_is_shortened': 1,
        'special_char_count': 15,
        'exclamation_count': 1,
        'openai_is_scam': 1,
        'openai_confidence': 95,
        'openai_urgency_level': 9,
        'openai_threat_level': 7,
        'openai_credibility_score': 2,
        'avg_word_length': 4.5,
        'digit_ratio': 0.1,
        'uppercase_ratio': 0.05,
        'contains_phone': 0,
        'phone_count': 0,
        'has_email': 0,
        'number_sequence_count': 1,
        'contains_time_sensitive': 1,
        'question_mark_count': 0,
        'capitalized_word_count': 0,
        'word_count': 30,
        'unique_word_ratio': 0.8,
        'punctuation_ratio': 0.1,
        'contains_please': 0,
        'contains_verify': 0,
        'contains_account': 0,
        'contains_prize': 0,
        'contains_act_now': 0
    }
    
    # Test case 2: Potential normal message with text features
    test_message_2 = {
        # Text features
        'message_text': '您好,這是來自銀行的通知:您的信用卡帳單已產生,本期應繳金額3500元,繳款期限為本月25日。',
        'openai_keywords': '銀行,信用卡,帳單,繳款',
        'openai_reason': '正常的銀行帳單通知,無要求立即行動或點擊連結',
        'openai_emotion_triggers': '',
        'openai_action_requested': 'reply',
        'openai_impersonation_type': 'bank',
        
        # Numeric features
        'message_length': 45,
        'contains_urgent_words': 0,
        'contains_money_keywords': 1,
        'contains_link_text': 0,
        'has_url': 0,
        'url_is_shortened': 0,
        'special_char_count': 5,
        'exclamation_count': 0,
        'openai_is_scam': 0,
        'openai_confidence': 85,
        'openai_urgency_level': 2,
        'openai_threat_level': 0,
        'openai_credibility_score': 8,
        'avg_word_length': 4.2,
        'digit_ratio': 0.08,
        'uppercase_ratio': 0.0,
        'contains_phone': 0,
        'phone_count': 0,
        'has_email': 0,
        'number_sequence_count': 2,
        'contains_time_sensitive': 1,
        'question_mark_count': 0,
        'capitalized_word_count': 0,
        'word_count': 25,
        'unique_word_ratio': 0.9,
        'punctuation_ratio': 0.05,
        'contains_please': 0,
        'contains_verify': 0,
        'contains_account': 0,
        'contains_prize': 0,
        'contains_act_now': 0
    }
    
    print(""\n"" + ""=""*60)
    print(""Test Case 1: Suspected Scam (Package + Payment)"")
    print(""=""*60)
    print(f""Message: {test_message_1['message_text'][:60]}..."")
    result_1 = predictor.predict(test_message_1)
    print(f""\n  📊 Prediction: {result_1['prediction_label']}"")
    print(f""  📈 Scam Probability: {result_1['scam_probability']:.2%}"")
    print(f""  🎯 Confidence Level: {result_1['confidence']}"")
    print(f""\n  🔍 Top 5 Scam Factors:"")
    for i, factor in enumerate(result_1['top_scam_factors'], 1):
        print(f""     {i}. {factor['feature']}: {factor['value']:.4f} (importance: {factor['importance']:.4f})"")
    
    print(""\n"" + ""=""*60)
    print(""Test Case 2: Suspected Normal (Bank Bill)"")
    print(""=""*60)
    print(f""Message: {test_message_2['message_text'][:60]}..."")
    result_2 = predictor.predict(test_message_2)
    print(f""\n  📊 Prediction: {result_2['prediction_label']}"")
    print(f""  📈 Scam Probability: {result_2['scam_probability']:.2%}"")
    print(f""  🎯 Confidence Level: {result_2['confidence']}"")
    print(f""\n  🔍 Top 5 Factors:"")
    for i, factor in enumerate(result_2['top_scam_factors'], 1):
        print(f""     {i}. {factor['feature']}: {factor['value']:.4f} (importance: {factor['importance']:.4f})"")
    
    print(""\n"" + ""="" * 60)

if __name__ == ""__main__"":
    demo()


================================================================================
FILE: lumos_XGBoost/requirements.txt
================================================================================
# Python 3.13+ compatible versions
pandas>=2.0.0
numpy>=2.0.0
scikit-learn==1.6.1
xgboost>=3.0.0
joblib>=1.3.0
matplotlib>=3.7.0
seaborn>=0.12.0
flask>=3.0.0
flask-cors>=4.0.0
nltk>=3.8.0


================================================================================
FILE: lumos_XGBoost/train_model.py
================================================================================
""""""
Scam SMS Detection Model Training Script
Train classification model using XGBoost, handling class imbalance
""""""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
import xgboost as xgb
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime
import re

# Set font for plotting (if needed)
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

class ScamDetectionModel:
    def __init__(self, data_path='training_data.csv', use_text_features=True):
        self.data_path = data_path
        self.model = None
        self.scaler = None
        self.tfidf_vectorizer = None
        self.keyword_vectorizer = None
        self.feature_columns = None
        self.metrics = {}
        self.use_text_features = use_text_features
        
    def load_data(self):
        """"""Load training data""""""
        print(""📁 Loading data..."")
        df = pd.read_csv(self.data_path)
        print(f""Total records: {len(df)}"")
        print(f""Scam messages: {(df['label'] == 1).sum()}"")
        print(f""Normal messages: {(df['label'] == 0).sum()}"")
        return df
    
    def preprocess_data(self, df):
        """"""Preprocess data""""""
        print(""\n🔧 Preprocessing data..."")
        
        # Extract text features if enabled
        if self.use_text_features:
            print(""   Extracting text features from message_text..."")
            df = self.extract_text_features(df)
        
        # Remove unnecessary columns
        exclude_cols = ['message_id', 'source', 'message_text', 'url_domain', 
                       'phone_number', 'phone_carrier', 'openai_reason', 
                       'openai_keywords', 'openai_impersonation_type', 
                       'openai_action_requested', 'openai_emotion_triggers']
        
        # Get feature columns
        self.feature_columns = [col for col in df.columns 
                               if col not in exclude_cols + ['label']]
        
        # Handle missing values
        X = df[self.feature_columns].copy()
        X = X.fillna(0)
        
        # Handle boolean and string types
        for col in X.columns:
            if X[col].dtype == 'object':
                # Try to convert to numeric
                try:
                    X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)
                except:
                    X[col] = 0
        
        y = df['label']
        
        print(f""Number of features: {len(self.feature_columns)}"")
        print(f""Feature columns: {', '.join(self.feature_columns[:5])}... (total {len(self.feature_columns)})"")
        
        return X, y
    
    def extract_text_features(self, df):
        """"""Extract numerical features from text columns""""""
        
        # Fill missing text
        df['message_text'] = df['message_text'].fillna('')
        df['openai_reason'] = df['openai_reason'].fillna('')
        df['openai_keywords'] = df['openai_keywords'].fillna('')
        
        # 1. TF-IDF features from message_text (top 20 words)
        print(""      - Applying TF-IDF vectorization to message_text..."")
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=20,
            min_df=2,
            max_df=0.8,
            ngram_range=(1, 2),
            stop_words='english'
        )
        
        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(df['message_text'])
            tfidf_features = pd.DataFrame(
                tfidf_matrix.toarray(),
                columns=[f'tfidf_msg_{i}' for i in range(tfidf_matrix.shape[1])],
                index=df.index
            )
            df = pd.concat([df, tfidf_features], axis=1)
            print(f""      - Added {tfidf_matrix.shape[1]} TF-IDF features from message_text"")
        except Exception as e:
            print(f""      - TF-IDF extraction from message_text failed: {e}"")
        
        # 2. TF-IDF features from openai_keywords (top 15 keywords)
        print(""      - Applying TF-IDF vectorization to openai_keywords..."")
        self.keyword_vectorizer = TfidfVectorizer(
            max_features=15,
            min_df=2,
            max_df=0.8,
            token_pattern=r'(?u)\b\w+\b',  # Match words
            lowercase=True
        )
        
        try:
            keyword_tfidf_matrix = self.keyword_vectorizer.fit_transform(df['openai_keywords'])
            keyword_tfidf_features = pd.DataFrame(
                keyword_tfidf_matrix.toarray(),
                columns=[f'tfidf_kw_{i}' for i in range(keyword_tfidf_matrix.shape[1])],
                index=df.index
            )
            df = pd.concat([df, keyword_tfidf_features], axis=1)
            print(f""      - Added {keyword_tfidf_matrix.shape[1]} TF-IDF features from keywords"")
        except Exception as e:
            print(f""      - TF-IDF extraction from keywords failed: {e}"")
        
        # 3. Keyword count (as backup numeric feature)
        df['keyword_count'] = df['openai_keywords'].apply(
            lambda x: len(str(x).split(',')) if pd.notna(x) and str(x).strip() else 0
        )
        
        # 3. Extract features from openai_reason (text length)
        df['reason_length'] = df['openai_reason'].apply(
            lambda x: len(str(x)) if pd.notna(x) else 0
        )
        
        # 4. Sentiment-like features from openai_emotion_triggers
        df['emotion_trigger_count'] = df['openai_emotion_triggers'].apply(
            lambda x: len(str(x).split(',')) if pd.notna(x) and str(x).strip() else 0
        )
        
        # 5. Action type encoding (one-hot for common actions)
        common_actions = ['click_link', 'reply', 'call_number', 'provide_info']
        for action in common_actions:
            df[f'action_{action}'] = df['openai_action_requested'].apply(
                lambda x: 1 if str(x).lower() == action else 0
            )
        
        # 6. Impersonation type encoding
        common_impersonations = ['company', 'bank', 'government', 'courier']
        for imp_type in common_impersonations:
            df[f'impersonate_{imp_type}'] = df['openai_impersonation_type'].apply(
                lambda x: 1 if str(x).lower() == imp_type else 0
            )
        
        print(f""      - Total new features extracted from text"")
        
        return df
    
    def train(self, X, y):
        """"""Train model""""""
        print(""\n🎯 Starting model training..."")
        
        # Split train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f""Training set: {len(X_train)} samples"")
        print(f""Test set: {len(X_test)} samples"")
        
        # Standardize features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Calculate class weights (handle imbalance)
        scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
        print(f""Class weight adjustment: {scale_pos_weight:.2f}"")
        
        # XGBoost parameters (optimized for small dataset)
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
            'scale_pos_weight': scale_pos_weight,
            'max_depth': 3,  # Shallow trees to prevent overfitting
            'learning_rate': 0.1,
            'n_estimators': 100,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 3,  # Increase to prevent overfitting
            'random_state': 42,
            'verbosity': 0
        }
        
        # Train model
        self.model = xgb.XGBClassifier(**params)
        self.model.fit(X_train_scaled, y_train)
        
        # 5-Fold cross validation
        print(""\n📊 Performing 5-Fold cross validation..."")
        cv_scores = cross_val_score(
            self.model, X_train_scaled, y_train, 
            cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
            scoring='f1'
        )
        print(f""Cross-validation F1 score: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})"")
        
        # Evaluate model
        self.evaluate(X_train_scaled, y_train, X_test_scaled, y_test)
        
        return X_test_scaled, y_test
    
    def evaluate(self, X_train, y_train, X_test, y_test):
        """"""Evaluate model performance""""""
        print(""\n📈 Model Evaluation Results:"")
        
        # Training set predictions
        y_train_pred = self.model.predict(X_train)
        train_accuracy = (y_train_pred == y_train).mean()
        
        # Test set predictions
        y_test_pred = self.model.predict(X_test)
        y_test_proba = self.model.predict_proba(X_test)[:, 1]
        
        test_accuracy = (y_test_pred == y_test).mean()
        
        print(f""\nTraining accuracy: {train_accuracy:.3f}"")
        print(f""Test accuracy: {test_accuracy:.3f}"")
        
        # Detailed classification report
        print(""\nClassification Report:"")
        print(classification_report(y_test, y_test_pred, 
                                   target_names=['Normal', 'Scam'],
                                   digits=3))
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_test_pred)
        print(""Confusion Matrix:"")
        print(f""              Pred Normal  Pred Scam"")
        print(f""Actual Normal    {cm[0][0]:6d}      {cm[0][1]:6d}"")
        print(f""Actual Scam      {cm[1][0]:6d}      {cm[1][1]:6d}"")
        
        # ROC-AUC
        try:
            roc_auc = roc_auc_score(y_test, y_test_proba)
            print(f""\nROC-AUC Score: {roc_auc:.3f}"")
        except:
            roc_auc = None
        
        # Save evaluation metrics
        self.metrics = {
            'train_accuracy': float(train_accuracy),
            'test_accuracy': float(test_accuracy),
            'roc_auc': float(roc_auc) if roc_auc else None,
            'confusion_matrix': cm.tolist(),
            'timestamp': datetime.now().isoformat()
        }
    
    def plot_feature_importance(self, top_n=20):
        """"""Plot feature importance""""""
        print(f""\n📊 Plotting top {top_n} important features..."")
        
        importance_df = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False).head(top_n)
        
        plt.figure(figsize=(10, 8))
        sns.barplot(data=importance_df, y='feature', x='importance')
        plt.title('Feature Importance Ranking')
        plt.xlabel('Importance Score')
        plt.ylabel('Feature')
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
        print(""✅ Feature importance plot saved: feature_importance.png"")
        
        # Display top 10 important features
        print(""\nTop 10 Important Features:"")
        for idx, row in importance_df.head(10).iterrows():
            print(f""  {row['feature']}: {row['importance']:.4f}"")
    
    def save_model(self, model_path='scam_detector_model.pkl'):
        """"""Save model""""""
        print(f""\n💾 Saving model..."")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'keyword_vectorizer': self.keyword_vectorizer,
            'feature_columns': self.feature_columns,
            'metrics': self.metrics,
            'use_text_features': self.use_text_features
        }
        
        joblib.dump(model_data, model_path)
        print(f""✅ Model saved: {model_path}"")
        
        # Save feature columns list
        with open('feature_columns.json', 'w', encoding='utf-8') as f:
            json.dump(self.feature_columns, f, ensure_ascii=False, indent=2)
        print(f""✅ Feature list saved: feature_columns.json"")
        
        # Save evaluation metrics
        with open('model_metrics.json', 'w', encoding='utf-8') as f:
            json.dump(self.metrics, f, ensure_ascii=False, indent=2)
        print(f""✅ Evaluation metrics saved: model_metrics.json"")

def main():
    """"""Main function""""""
    print(""="" * 60)
    print(""🚀 Scam SMS Detection Model Training"")
    print(""="" * 60)
    
    # Initialize model with text features enabled
    detector = ScamDetectionModel(use_text_features=True)
    
    # Load data
    df = detector.load_data()
    
    # Preprocess
    X, y = detector.preprocess_data(df)
    
    # Train model
    X_test, y_test = detector.train(X, y)
    
    # Plot feature importance
    detector.plot_feature_importance()
    
    # Save model
    detector.save_model()
    
    print(""\n"" + ""="" * 60)
    print(""✅ Training Complete!"")
    print(""="" * 60)
    print(""\nNext Steps:"")
    print(""1. View feature_importance.png to understand important features"")
    print(""2. View model_metrics.json to understand model performance"")
    print(""3. Run python predict.py to test prediction"")
    print(""4. Run python api_server.py to start API service"")

if __name__ == ""__main__"":
    main()


================================================================================
FILE: package.json
================================================================================
{
  ""name"": ""hackthesource-backend"",
  ""version"": ""1.0.0"",
  ""description"": ""Scam Message Detection Backend API"",
  ""main"": ""src/index.js"",
  ""type"": ""module"",
  ""scripts"": {
    ""start"": ""node src/index.js"",
    ""dev"": ""nodemon src/index.js"",
    ""test:collect"": ""node training/scripts/test-collect.js"",
    ""ml:start"": ""cd lumos_XGBoost && python api_server.py"",
    ""start:all"": ""concurrently \""npm run dev\"" \""npm run ml:start\""""
  },
  ""keywords"": [
    ""scam"",
    ""detection"",
    ""api""
  ],
  ""author"": """",
  ""license"": ""MIT"",
  ""dependencies"": {
    ""axios"": ""^1.6.2"",
    ""cors"": ""^2.8.5"",
    ""dotenv"": ""^16.3.1"",
    ""express"": ""^4.22.1"",
    ""multer"": ""^2.0.2"",
    ""openai"": ""^4.20.1"",
    ""tesseract.js"": ""^6.0.1""
  },
  ""devDependencies"": {
    ""nodemon"": ""^3.0.2"",
    ""concurrently"": ""^8.2.2""
  }
}


================================================================================
FILE: scripts/bubbles.js
================================================================================
// scripts/bubbles.js
// Lightweight animator for crystal/translucent bubbles that bounce at screen edges
(function () {
  // fewer bubbles but better spaced to avoid excessive overlap
  const BUBBLE_COUNT = 10;
  const containerId = 'bubble-bg';

  function createBubbleEl() {
    const el = document.createElement('div');
    el.className = 'bubble';
    return el;
  }

  function pickPalette(isLight) {
    if (isLight) {
      return [
        // vivid green / mint — stronger alpha so visible on light backdrops
        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent 45%), linear-gradient(135deg, rgba(34,197,94,0.40), rgba(74,222,128,0.28))',
        // bold purple — visible and pretty
        'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.9), transparent 45%), linear-gradient(135deg, rgba(99,102,241,0.36), rgba(168,85,247,0.28))',
        // teal / blue — stronger presence
        'radial-gradient(circle at 30% 35%, rgba(255,255,255,0.85), transparent 45%), linear-gradient(135deg, rgba(6,182,212,0.38), rgba(59,130,246,0.28))',
        // warm pink / coral
        'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9), transparent 45%), linear-gradient(135deg, rgba(255,99,132,0.36), rgba(255,159,243,0.24))'
      ];
    }
    // dark theme — more natural / pastel, subtle and muted for a natural look
    return [
      // deep ocean teal
      'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 45%), linear-gradient(135deg, rgba(10,84,120,0.42), rgba(12,128,146,0.22))',
      // misty forest green
      'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.22), transparent 45%), linear-gradient(135deg, rgba(34,110,72,0.38), rgba(71,135,88,0.22))',
      // warm sand / amber
      'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.20), transparent 45%), linear-gradient(135deg, rgba(206,143,69,0.38), rgba(230,186,110,0.22))',
      // soft mauve / dusk
      'radial-gradient(circle at 34% 26%, rgba(255,255,255,0.22), transparent 45%), linear-gradient(135deg, rgba(100,75,120,0.36), rgba(150,120,170,0.20))'
    ];
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function init() {
    const root = document.getElementById(containerId);
    if (!root) return;

    // determine theme at start and update on changes
    const isLight = document.body.classList.contains('light-mode') || window.matchMedia('(prefers-color-scheme: light)').matches;
    const palette = pickPalette(isLight);

    // keep state for each bubble
    const bubbles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    function makeBubble(i) {
      const el = createBubbleEl();
      // size scaled to viewport — allow smaller bubbles on narrow screens
      const maxSide = Math.min(width, height) || Math.max(width, height);
      const minSize = Math.max(16, Math.round(maxSide * 0.05));
      const maxSize = Math.max(minSize + 32, Math.round(Math.min(maxSide * 0.22, 220)));
      let size = Math.round(rand(minSize, maxSize));

      // attempt a more uniform/sparse placement
      // build a set of candidate points across the viewport (grid + jitter) then pick the first that doesn't overlap
      const candidates = [];
      const gridCols = Math.max(3, Math.round(Math.sqrt(BUBBLE_COUNT) * 2));
      const gridRows = Math.max(3, Math.round(Math.sqrt(BUBBLE_COUNT) * 2));
      const xPad = Math.max(size / 2 + 8, width * 0.02);
      const yPad = Math.max(size / 2 + 8, height * 0.02);

      for (let gx = 0; gx < gridCols; gx++) {
        for (let gy = 0; gy < gridRows; gy++) {
          const fx = (gx + 0.5) / gridCols; // normalized [0,1]
          const fy = (gy + 0.5) / gridRows;
          // jitter slightly so positions don't look too regular
          const jitterX = rand(-0.15, 0.15) * (width / gridCols);
          const jitterY = rand(-0.15, 0.15) * (height / gridRows);
          const cx = Math.min(Math.max(xPad, fx * width + jitterX), width - xPad);
          const cy = Math.min(Math.max(yPad, fy * height + jitterY), height - yPad);
          candidates.push([cx, cy]);
        }
      }

      // shuffle candidates so placement order isn't consistent on reloads
      for (let k = candidates.length - 1; k > 0; k--) {
        const r = Math.floor(Math.random() * (k + 1));
        const tmp = candidates[k]; candidates[k] = candidates[r]; candidates[r] = tmp;
      }

      // avoid clustering near the top-left corner — define a small no-generate box there
      const avoidNx = Math.max(32, Math.round(width * 0.14));
      const avoidNy = Math.max(32, Math.round(height * 0.14));

      let x = null, y = null;
      const minSepFactor = 1.05; // a little extra space
      for (const [cx, cy] of candidates) {
        // prefer points not inside the top-left avoid zone
        if (cx < avoidNx && cy < avoidNy) continue;

        // check overlap against existing bubbles
        let ok = true;
        for (const other of bubbles) {
          const dx = cx - other.x;
          const dy = cy - other.y;
          const minDist = (size + other.size) * minSepFactor;
          if ((dx * dx + dy * dy) < (minDist * minDist)) { ok = false; break; }
        }
        if (ok) { x = cx; y = cy; break; }
      }

      // fallback to randomized attempts (but still avoid top-left) if grid candidates didn't fit
      if (x === null) {
        const maxAttempts = 300;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const tx = rand(size / 2, Math.max(width - size / 2, size));
          const ty = rand(size / 2, Math.max(height - size / 2, size));
          if (tx < avoidNx && ty < avoidNy) continue; // keep away from top-left cluster
          let okay = true;
          for (const other of bubbles) {
            const dx = tx - other.x;
            const dy = ty - other.y;
            const minDist = (size + other.size) * minSepFactor;
            if ((dx * dx + dy * dy) < (minDist * minDist)) { okay = false; break; }
          }
          if (okay) { x = tx; y = ty; break; }
          // shrink occasionally to help fit
          if (attempt % 10 === 0 && size > minSize + 2) size = Math.round(size * rand(0.92, 0.98));
        }
      }

      // worst-case fallback — random anywhere
      if (x === null) {
        x = rand(size / 2, Math.max(width - size / 2, size));
        y = rand(size / 2, Math.max(height - size / 2, size));
      }
      // faster average speed with more variation
      const speed = rand(0.6, 1.6);
      const maxSpeed = speed * rand(1.8, 3.2);
      const angle = rand(0, Math.PI * 2);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // style
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      // place using transform instead of left/top so we can reliably reposition
      el.style.left = '0px';
      el.style.top = '0px';
      const tx = Math.round(x - size / 2);
      const ty = Math.round(y - size / 2);
      el.style.transform = `translate(${tx}px, ${ty}px)`;
      el.style.background = palette[i % palette.length];
      el.style.border = '1px solid rgba(255,255,255,0.12)';
      el.style.opacity = String(rand(0.55, 0.95));

      // pulse a few
      if (Math.random() > 0.65) el.classList.add('pulse');

      root.appendChild(el);

      return { el, x, y, vx, vy, size, maxSpeed, burstCooldown: rand(300, 1200) };
    }

    for (let i = 0; i < BUBBLE_COUNT; i++) bubbles.push(makeBubble(i));

    // do a short relaxation to separate any remaining small overlaps on first paint
    for (let iter = 0; iter < 6; iter++) {
      for (let a = 0; a < bubbles.length; a++) {
        for (let b = a + 1; b < bubbles.length; b++) {
          const p = bubbles[a];
          const q = bubbles[b];
          const dx = p.x - q.x; const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          const minDist = (p.size / 2 + q.size / 2) * 1.02;
          if (distSq > 0 && distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const overlap = (minDist - dist) / dist * 0.5;
            p.x += dx * overlap; p.y += dy * overlap;
            q.x -= dx * overlap; q.y -= dy * overlap;
          }
        }
      }
    }

    // update element transforms after relaxation
    bubbles.forEach(b => {
      const r = Math.round(b.size / 2);
      const tx = Math.round(b.x - r);
      const ty = Math.round(b.y - r);
      b.el.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    // update on resize — scale positions so bubbles stay visible and continue moving freely
    window.addEventListener('resize', () => {
      const prevW = width, prevH = height;
      width = window.innerWidth; height = window.innerHeight;
      bubbles.forEach(b => {
        const r = b.size / 2;
        if (prevW && prevH) {
          const sx = width / prevW; const sy = height / prevH;
          b.x = Math.min(Math.max(b.x * sx, r), width - r);
          b.y = Math.min(Math.max(b.y * sy, r), height - r);
        } else {
          b.x = Math.min(Math.max(b.x, r), width - r);
          b.y = Math.min(Math.max(b.y, r), height - r);
        }
      });
    });

    // animation loop
    let last = performance.now();

    function step(now) {
      const dt = Math.min(50, now - last) / 16.6667; // normalize to approx. 60fps unit
      last = now;

      bubbles.forEach(b => {
        b.x += b.vx * dt * 1.2; // apply some multiplier
        b.y += b.vy * dt * 1.2;

        const r = b.size / 2;

        // bounce logic — keep them inside the viewport
        if (b.x - r <= 0) { b.x = r; b.vx *= -1; }
        if (b.x + r >= width) { b.x = width - r; b.vx *= -1; }
        if (b.y - r <= 0) { b.y = r; b.vy *= -1; }
        if (b.y + r >= height) { b.y = height - r; b.vy *= -1; }

        // small damping for smoother motion
        b.vx *= 0.9945; b.vy *= 0.9945;

        // random gusts / bursts — gives a lively, faster motion sometimes
        if (b.burstCooldown <= 0 && Math.random() > 0.86) {
          const burstX = rand(-0.6, 0.6) * rand(1.5, 3.6);
          const burstY = rand(-0.6, 0.6) * rand(1.5, 3.6);
          b.vx += burstX; b.vy += burstY;

          // clamp to maxSpeed to avoid runaway
          const speedNow = Math.hypot(b.vx, b.vy);
          if (speedNow > b.maxSpeed) {
            const s = b.maxSpeed / speedNow;
            b.vx *= s; b.vy *= s;
          }

          b.burstCooldown = rand(240, 900);
        }

        // occasional small noise so the motion stays organic (also helps prevent standstill)
        if (Math.random() > 0.98) {
          b.vx += rand(-0.08, 0.08);
          b.vy += rand(-0.08, 0.08);
        }

        // ensure bubble never becomes stationary — if below threshold, give a gentle nudge
        const speedNow = Math.hypot(b.vx, b.vy);
        const minMovingSpeed = Math.max(0.16, 0.08 + (80 / Math.max(b.size, 1)) * 0.002); // slightly scale by size
        if (speedNow < minMovingSpeed) {
          // push in a random direction, but keep under maxSpeed
          const nudgeX = rand(-minMovingSpeed * 1.5, minMovingSpeed * 1.5);
          const nudgeY = rand(-minMovingSpeed * 1.5, minMovingSpeed * 1.5);
          b.vx += nudgeX; b.vy += nudgeY;
          // clamp again to maxSpeed
          const capped = Math.hypot(b.vx, b.vy);
          if (capped > b.maxSpeed) {
            const s = b.maxSpeed / capped;
            b.vx *= s; b.vy *= s;
          }
        }
        b.burstCooldown -= dt * 16.6667;

        // simple pairwise collision separation so bubbles don't heavily overlap
        for (let j = 0; j < bubbles.length; j++) {
          if (b === bubbles[j]) continue;
          const o = bubbles[j];
          const dx_ = b.x - o.x;
          const dy_ = b.y - o.y;
          const distSq = dx_ * dx_ + dy_ * dy_;
          const minDist = (b.size / 2 + o.size / 2) * 0.9;
          if (distSq > 0 && distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const overlap = (minDist - dist) / dist * 0.5; // push each half
            b.x += dx_ * overlap;
            b.y += dy_ * overlap;
            o.x -= dx_ * overlap;
            o.y -= dy_ * overlap;
          }
        }

        // apply transform
        const tx = Math.round(b.x - r);
        const ty = Math.round(b.y - r);
        const rotation = (b.x + b.y) % 360 * 0.03; // subtle rotation
        b.el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`;
      });

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

    // if theme toggles elsewhere, update palette
    const observer = new MutationObserver(() => {
      const nowLight = document.body.classList.contains('light-mode') || window.matchMedia('(prefers-color-scheme: light)').matches;
      const newPalette = pickPalette(nowLight);
      bubbles.forEach((b, i) => { b.el.style.background = newPalette[i % newPalette.length]; });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();


================================================================================
FILE: src/config.js
================================================================================
import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  googleSafeBrowsingApiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
  openaiApiKey: process.env.OPENAI_API_KEY,
  xgboostApiUrl: process.env.XGBOOST_API_URL || 'http://localhost:5000',
};


================================================================================
FILE: src/index.js
================================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRouter from './routes/analyze.js';
import collectDataRouter from '../training/routes/collectData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only accept image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from project root
app.use(express.static(path.join(__dirname, '..')));

// Make upload middleware available globally
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Serve test.html at root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test.html'));
});

// Routes
app.use('/api', analyzeRouter);
app.use('/api/training', collectDataRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    endpoints: {
      production: [
        'POST /api/analyze - Analyze message for scam detection'
      ],
      training: [
        'POST /api/training/collect-training-data - Collect training data',
        'GET /api/training/training-stats - Get training statistics'
      ]
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


================================================================================
FILE: src/routes/analyze.js
================================================================================
import express from 'express';
import multer from 'multer';
import { parseMessage } from '../services/parser.js';
import { checkUrlSafety } from '../services/safeBrowsing.js';
import { lookupPhone } from '../services/twilioLookup.js';
import { analyzeWithOpenAI } from '../services/openaiCheck.js';
import { generateResponse } from '../utils/analyzer.js';
import { extractTextFromImage } from '../services/ocrService.js';
import { predictScamProbability } from '../services/xgboostService.js';
import { extractFeaturesForML } from '../services/featureExtractor.js';
import { generateExplainedReport } from '../services/aiExplainer.js';

const router = express.Router();

// Configure Multer for OCR endpoint
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // 1. Parse message to extract URL, phone, and content
    const parsed = parseMessage(message);
    console.log('📝 Parsed result:', parsed);

    // 2. Call three APIs in parallel
    const [urlResult, phoneResult, aiResult] = await Promise.all([
      parsed.url ? checkUrlSafety(parsed.url) : Promise.resolve(null),
      parsed.phone ? lookupPhone(parsed.phone) : Promise.resolve(null),
      analyzeWithOpenAI(parsed.content),
    ]);

    // 3. Extract 45 features for ML model
    const features = extractFeaturesForML(message, parsed, urlResult, phoneResult, aiResult);
    console.log('🔢 Extracted features for ML model');

    // 4. Call XGBoost ML model for prediction (with fallback)
    const xgboostResult = await predictScamProbability(features);
    if (xgboostResult.available) {
      console.log('🤖 XGBoost prediction:', xgboostResult.scamProbability);
    } else {
      console.log('⚠️ XGBoost not available, using rule-based scoring only');
    }

    // 5. Use AI to generate human-readable explanation
    const explainedReport = await generateExplainedReport({
      messageText: message,
      parsed,
      mlResult: xgboostResult,
      urlResult,
      phoneResult,
      aiResult,
      topScamFactors: xgboostResult?.topScamFactors || [],
    });

    console.log('✨ Generated explained report with AI');

    res.json(explainedReport);
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
});

// OCR endpoint: Extract text from image and analyze for scams
router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    console.log('📸 Received image:', req.file.originalname, `(${req.file.size} bytes)`);

    // 1. Extract text from image using OCR
    const extractedText = await extractTextFromImage(req.file.buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'No text could be extracted from the image' });
    }

    console.log('📄 Text extracted:', extractedText.substring(0, 100) + '...');

    // 2. Parse extracted text to find URLs and phone numbers
    const parsed = parseMessage(extractedText);

    // 3. Call analysis APIs in parallel
    const [urlResult, phoneResult, aiResult] = await Promise.all([
      parsed.url ? checkUrlSafety(parsed.url) : Promise.resolve(null),
      parsed.phone ? lookupPhone(parsed.phone) : Promise.resolve(null),
      analyzeWithOpenAI(parsed.content),
    ]);

    // 4. Extract features for ML model
    const features = extractFeaturesForML(extractedText, parsed, urlResult, phoneResult, aiResult);

    // 5. Call XGBoost ML model
    const xgboostResult = await predictScamProbability(features);

    // 6. Use AI to generate human-readable explanation
    const explainedReport = await generateExplainedReport({
      messageText: extractedText,
      parsed,
      mlResult: xgboostResult,
      urlResult,
      phoneResult,
      aiResult,
      topScamFactors: xgboostResult?.topScamFactors || [],
    });

    res.json({
      text: extractedText,
      ...explainedReport,
    });
  } catch (error) {
    console.error('❌ OCR analysis error:', error);
    res.status(500).json({ 
      error: 'OCR analysis failed', 
      message: error.message 
    });
  }
});

export default router;


================================================================================
FILE: src/services/aiExplainer.js
================================================================================
/**
 * AI Explainer Service
 * Use OpenAI to translate technical analysis into human-readable insights
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate human-readable analysis report from all collected data
 * @param {Object} allData - All analysis data including ML, URL, phone, AI results
 * @returns {Object} Formatted response for frontend
 */
export async function generateExplainedReport(allData) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API Key not configured, using fallback');
      return generateFallbackReport(allData);
    }

    const {
      messageText,
      parsed,
      mlResult,
      urlResult,
      phoneResult,
      aiResult,
      topScamFactors,
    } = allData;

    // Determine primary risk score (ML > rule-based)
    const primaryScore = mlResult?.available ? Math.round(mlResult.scamProbability * 100) : calculateRuleBasedScore(allData);

    const prompt = `You are an expert in explaining cybersecurity analysis results to everyday users. I will provide you with technical scam detection data, and you must translate it into clear, actionable insights.

**Message being analyzed:**
""${messageText}""

**Analysis Data:**

1. **ML Model Prediction** ${mlResult?.available ? '(PRIMARY SOURCE)' : '(NOT AVAILABLE)'}:
${mlResult?.available ? `
   - Scam Probability: ${(mlResult.scamProbability * 100).toFixed(1)}%
   - Confidence: ${mlResult.confidence}
   - Top Contributing Factors:
${topScamFactors?.map((f, i) => `     ${i + 1}. ${f.feature}: value=${f.value.toFixed(2)}, importance=${(f.importance * 100).toFixed(1)}%`).join('\n') || '     (none)'}
` : '   - Model unavailable, using rule-based analysis'}

2. **URL Analysis:**
${urlResult ? `
   - Safe: ${urlResult.isSafe ? 'Yes' : 'No'}
   - URL: ${parsed.url || '(none detected)'}
${!urlResult.isSafe ? `   - Threat Type: ${urlResult.threatType}` : ''}
` : '   - No URL detected'}

3. **Phone Number Analysis:**
${phoneResult ? `
   - Valid: ${phoneResult.valid ? 'Yes' : 'No'}
   - Type: ${phoneResult.lineType || 'Unknown'}
   - Carrier: ${phoneResult.carrier || 'Unknown'}
   - Phone: ${parsed.phone || '(none detected)'}
` : '   - No phone number detected'}

4. **AI Content Analysis:**
   - Is Scam: ${aiResult?.isScam ? 'Yes' : 'No'}
   - Confidence: ${aiResult?.confidence || 0}%
   - Reason: ${aiResult?.reason || 'N/A'}
   - Keywords: ${aiResult?.keywords?.join(', ') || 'None'}
   - Urgency Level: ${aiResult?.urgency_level || 0}/10
   - Threat Level: ${aiResult?.threat_level || 0}/10
   - Temptation Level: ${aiResult?.temptation_level || 0}/10
   - Impersonation: ${aiResult?.impersonation_type || 'None'}
   - Action Requested: ${aiResult?.action_requested || 'None'}

**Your Task:**
Based on this analysis, generate a report in the following JSON format:

\`\`\`json
{
  ""riskLevel"": ""red|yellow|green"",
  ""riskScore"": 0-100,
  ""evidence"": [
    ""Clear explanation 1 (e.g., 'The ML model detected strong scam patterns')"",
    ""Clear explanation 2 (e.g., 'The message uses urgent language to pressure you into clicking immediately')"",
    ""Clear explanation 3..."",
    ""(up to 5-8 key points)""
  ],
  ""action"": {
    ""title"": ""Appropriate title based on risk"",
    ""suggestions"": [
      ""Actionable suggestion 1"",
      ""Actionable suggestion 2"",
      ""(3-5 suggestions)""
    ]
  }
}
\`\`\`

**Guidelines:**
1. **riskScore**: Use ML score (${primaryScore}) as primary. Adjust ±5 if other factors strongly disagree.
2. **riskLevel**: 
   - ""red"" if score ≥ 75 or extremely high-confidence scam indicators
   - ""yellow"" if 30-74 or mixed signals
   - ""green"" if < 30 and mostly safe
3. **evidence**: 
   - Translate technical features into plain language
   - Explain WHY each factor matters
   - For ML factors like ""url_is_shortened"", explain: ""The link uses a URL shortener (like bit.ly), which is commonly used by scammers to hide the real destination""
   - Prioritize the most important findings
   - Use emojis sparingly (one per point max): 🚨⚠️✅🔗📱💰⏰
4. **action.suggestions**:
   - Concrete, actionable steps
   - Match severity to risk level
   - Include reporting options for high-risk cases

Respond ONLY with valid JSON. No markdown, no explanations outside the JSON.`;

    const completion = await openai.chat.completions.create({
      model: ""gpt-4o-mini"",
      messages: [
        {
          role: ""system"",
          content: ""You are an expert at explaining technical cybersecurity analysis to everyday users. Translate jargon into clear, actionable insights. Always respond with valid JSON only.""
        },
        {
          role: ""user"",
          content: prompt
        }
      ],
      temperature: 0.4,
      response_format: { type: ""json_object"" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure score matches ML if available
    if (mlResult?.available) {
      result.riskScore = primaryScore;
      // Also ensure riskLevel matches the score thresholds
      if (primaryScore >= 75) {
        result.riskLevel = 'red';
      } else if (primaryScore >= 30) {
        result.riskLevel = 'yellow';
      } else {
        result.riskLevel = 'green';
      }
    }

    return result;

  } catch (error) {
    console.error('❌ AI Explainer error:', error.message);
    return generateFallbackReport(allData);
  }
}

/**
 * Fallback report generation when OpenAI is unavailable
 */
function generateFallbackReport(allData) {
  const { mlResult, urlResult, phoneResult, aiResult } = allData;
  
  const evidence = [];
  let riskScore = 0;

  // Use ML score if available
  if (mlResult?.available) {
    const mlScore = Math.round(mlResult.scamProbability * 100);
    riskScore = mlScore;
    evidence.push(`🤖 ML Model: ${mlScore}% scam probability (${mlResult.confidence} confidence)`);
  }

  // URL analysis
  if (urlResult && !urlResult.isSafe) {
    evidence.push(`⚠️ URL flagged as dangerous: ${urlResult.threatType}`);
    riskScore += mlResult?.available ? 0 : 40;
  } else if (urlResult && urlResult.isSafe) {
    evidence.push('✅ URL appears safe');
  }

  // Phone analysis
  if (phoneResult?.lineType === 'voip') {
    evidence.push('⚠️ Phone number is VoIP (commonly used in scams)');
    riskScore += mlResult?.available ? 0 : 30;
  } else if (phoneResult?.valid) {
    evidence.push(`✅ Phone number is valid (${phoneResult.carrier})`);
  }

  // AI analysis
  if (aiResult?.isScam) {
    evidence.push(`🔍 AI detected scam indicators: ${aiResult.reason}`);
    riskScore += mlResult?.available ? 0 : aiResult.confidence * 0.3;
  }

  // Determine risk level
  let riskLevel = 'green';
  if (riskScore >= 75) riskLevel = 'red';
  else if (riskScore >= 30) riskLevel = 'yellow';

  // Generate action suggestions
  const action = {
    title: riskLevel === 'red' ? '🚨 High Risk Warning' : 
           riskLevel === 'yellow' ? '⚠️ Handle with Caution' : 
           '✅ Appears Safe',
    suggestions: riskLevel === 'red' ? [
      'Do not click any links in this message',
      'Do not call back or respond',
      'Block this sender immediately',
      'Report to 165 anti-fraud hotline if financial loss involved'
    ] : riskLevel === 'yellow' ? [
      'Verify through official channels before taking action',
      'Do not provide personal or financial information',
      'Be cautious with any links or phone numbers',
      'Contact 165 if you have doubts'
    ] : [
      'No obvious scam indicators detected',
      'However, always remain vigilant',
      'Never share sensitive information unless verified'
    ]
  };

  return {
    riskLevel,
    riskScore: Math.min(Math.round(riskScore), 99),
    evidence: evidence.length > 0 ? evidence : ['Analysis completed with limited data'],
    action
  };
}

/**
 * Calculate rule-based score when ML is unavailable
 */
function calculateRuleBasedScore(allData) {
  const { urlResult, phoneResult, aiResult } = allData;
  let score = 0;

  if (urlResult && !urlResult.isSafe) score += 40;
  if (phoneResult?.lineType === 'voip') score += 30;
  if (aiResult?.isScam) score += aiResult.confidence * 0.99;

  return Math.min(Math.round(score), 99);
}


================================================================================
FILE: src/services/featureExtractor.js
================================================================================
/**
 * Extract 45 features from message for XGBoost model
 * Reuses existing analysis results (parsed, urlResult, phoneResult, aiResult)
 */

/**
 * Extract all 45 features for XGBoost model
 */
export function extractFeaturesForML(text, parsed, urlResult, phoneResult, aiResult) {
  const features = {
    // Text features (14)
    char_count: text.length,
    word_count: text.split(/\s+/).filter(w => w.length > 0).length,
    digit_count: (text.match(/\d/g) || []).length,
    digit_ratio: calculateDigitRatio(text),
    uppercase_ratio: calculateUppercaseRatio(text),
    special_char_count: (text.match(/[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]/g) || []).length,
    exclamation_count: (text.match(/!/g) || []).length,
    question_count: (text.match(/\?/g) || []).length,
    has_urgent_keywords: hasUrgentKeywords(text) ? 1 : 0,
    suspicious_word_count: countSuspiciousWords(text),
    max_word_length: getMaxWordLength(text),
    avg_word_length: parseFloat(calculateAvgWordLength(text)),
    emoji_count: (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
    consecutive_caps: getConsecutiveCaps(text),

    // URL features (8)
    url_count: parsed.url ? 1 : 0,
    has_suspicious_tld: parsed.url ? hasSuspiciousTLD(parsed.url) : 0,
    has_ip_address: parsed.url ? hasIPAddress(parsed.url) : 0,
    has_url_shortener: parsed.url ? isShortUrl(parsed.url) : 0,
    avg_url_length: parsed.url ? parsed.url.length : 0,
    has_https: parsed.url ? (parsed.url.startsWith('https') ? 1 : 0) : 0,
    url_path_depth: parsed.url ? getUrlPathDepth(parsed.url) : 0,
    subdomain_count: parsed.url ? getSubdomainCount(parsed.url) : 0,

    // Phone features (7)
    phone_count: parsed.phone ? 1 : 0,
    has_intl_code: parsed.phone ? (parsed.phone.startsWith('+') ? 1 : 0) : 0,
    is_voip: phoneResult?.lineType === 'voip' ? 1 : 0,
    is_mobile: phoneResult?.lineType === 'mobile' ? 1 : 0,
    is_valid_phone: phoneResult?.valid ? 1 : 0,
    phone_carrier_known: phoneResult?.carrier ? 1 : 0,
    has_multiple_phones: (text.match(/\d{3,4}[-\s]?\d{3,4}[-\s]?\d{4}/g) || []).length > 1 ? 1 : 0,

    // AI features (12)
    urgency_level: aiResult?.urgency_level || 0,
    threat_level: aiResult?.threat_level || 0,
    temptation_level: aiResult?.temptation_level || 0,
    impersonation_type: aiResult?.impersonation_type || 'none',
    action_requested: aiResult?.action_requested || 'none',
    grammar_quality: aiResult?.grammar_quality || 5,
    emotion_triggers: aiResult?.emotion_triggers ? aiResult.emotion_triggers.join(',') : 'none',
    credibility_score: aiResult?.credibility_score || 5,
    ai_is_scam: aiResult?.isScam ? 1 : 0,
    ai_confidence: aiResult?.confidence || 0,
    has_scam_keywords: aiResult?.keywords && aiResult.keywords.length > 0 ? 1 : 0,
    keyword_count: aiResult?.keywords ? aiResult.keywords.length : 0,

    // Statistical features (3)
    text_entropy: calculateEntropy(text),
    readability_score: calculateReadabilityScore(text),
    sentence_complexity: calculateSentenceComplexity(text),

    // URL safety (1 - from Google Safe Browsing)
    google_safe_browsing_flagged: urlResult && !urlResult.isSafe ? 1 : 0,
  };

  return features;
}

// Helper functions
function calculateDigitRatio(text) {
  if (text.length === 0) return 0;
  const digitCount = (text.match(/\d/g) || []).length;
  return parseFloat((digitCount / text.length).toFixed(3));
}

function calculateUppercaseRatio(text) {
  const letters = text.match(/[a-zA-Z]/g) || [];
  if (letters.length === 0) return 0;
  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  return parseFloat((uppercaseCount / letters.length).toFixed(3));
}

function hasUrgentKeywords(text) {
  const urgentWords = ['urgent', 'immediate', 'now', 'asap', 'hurry', 'fast', 'quick', 'alert', 'warning', 'action required', '緊急', '立即', '馬上', '盡快'];
  const lowerText = text.toLowerCase();
  return urgentWords.some(w => lowerText.includes(w.toLowerCase()));
}

function countSuspiciousWords(text) {
  const suspiciousWords = ['prize', 'winner', 'congratulations', 'claim', 'verify', 'suspended', 'locked', 'confirm', 'password', 'account', 'bank', 'credit card', '中獎', '恭喜', '領取', '驗證', '帳號', '密碼'];
  const lowerText = text.toLowerCase();
  return suspiciousWords.filter(w => lowerText.includes(w.toLowerCase())).length;
}

function getMaxWordLength(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  return Math.max(...words.map(w => w.length));
}

function calculateAvgWordLength(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return (totalLength / words.length).toFixed(2);
}

function getConsecutiveCaps(text) {
  const matches = text.match(/[A-Z]{3,}/g);
  return matches ? matches.length : 0;
}

function hasSuspiciousTLD(url) {
  const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click'];
  try {
    const hostname = new URL(url).hostname;
    return suspiciousTLDs.some(tld => hostname.endsWith(tld)) ? 1 : 0;
  } catch {
    return 0;
  }
}

function hasIPAddress(url) {
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  return ipPattern.test(url) ? 1 : 0;
}

function isShortUrl(url) {
  const shortDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'reurl.cc', 't.co', 'short.link', 'tiny.cc'];
  try {
    const hostname = new URL(url).hostname;
    return shortDomains.some(d => hostname.includes(d)) ? 1 : 0;
  } catch {
    return 0;
  }
}

function getUrlPathDepth(url) {
  try {
    const path = new URL(url).pathname;
    return path.split('/').filter(p => p.length > 0).length;
  } catch {
    return 0;
  }
}

function getSubdomainCount(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return Math.max(0, parts.length - 2); // Exclude domain and TLD
  } catch {
    return 0;
  }
}

function calculateEntropy(text) {
  if (text.length === 0) return 0;
  const freq = {};
  for (let char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  for (let char in freq) {
    const p = freq[char] / text.length;
    entropy -= p * Math.log2(p);
  }
  return parseFloat(entropy.toFixed(3));
}

function calculateReadabilityScore(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  // Simple readability score (lower is easier to read)
  const score = (avgWordsPerSentence * 0.5) + (avgWordLength * 2);
  return parseFloat(Math.min(score, 100).toFixed(2));
}

function calculateSentenceComplexity(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  let complexCount = 0;
  for (let sentence of sentences) {
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    const hasLongWords = words.some(w => w.length > 10);
    const hasMultipleClauses = (sentence.match(/[,;]/g) || []).length > 2;
    
    if (hasLongWords || hasMultipleClauses) {
      complexCount++;
    }
  }
  
  return parseFloat((complexCount / sentences.length).toFixed(2));
}


================================================================================
FILE: src/services/ocrService.js
================================================================================
import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using Tesseract.js OCR
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} Extracted text from image
 */
export async function extractTextFromImage(imageBuffer) {
  try {
    console.log('🔍 Starting OCR processing...');
    
    // Convert buffer to base64 for Tesseract
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    
    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker();
    
    try {
      // Recognize text from image
      const { data: { text } } = await worker.recognize(dataUrl);
      
      console.log('✅ OCR completed successfully');
      console.log('📄 Extracted text length:', text.length);
      
      return text;
    } finally {
      // Always terminate worker
      await worker.terminate();
    }
  } catch (error) {
    console.error('❌ OCR error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}


================================================================================
FILE: src/services/openaiCheck.js
================================================================================
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze message content for scam detection using OpenAI
 */
export async function analyzeWithOpenAI(content) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API Key not configured');
      return { isScam: false, confidence: 0, reason: 'API Key not configured' };
    }

    const prompt = `You are a professional scam message detection expert. Please analyze the following message content to determine if it's a scam, and respond in JSON format.

Message content:
""""""
${content}
""""""

Please respond in the following JSON format:
{
  ""isScam"": true/false,
  ""confidence"": 0-100,
  ""reason"": ""reason for determination"",
  ""keywords"": [""keyword1"", ""keyword2""],
  ""urgency_level"": 0-10,
  ""threat_level"": 0-10,
  ""temptation_level"": 0-10,
  ""impersonation_type"": ""bank|government|courier|company|lottery|tech_support|null"",
  ""action_requested"": ""click_link|call_number|transfer_money|provide_info|download|reply|null"",
  ""grammar_quality"": 0-10,
  ""emotion_triggers"": [""fear"", ""greed"", ""urgency"", ""curiosity"", ""trust""],
  ""credibility_score"": 0-10
}

Field explanations:
- urgency_level: How urgent or time-sensitive the message appears (0=none, 10=extreme)
- threat_level: Presence of threatening language or consequences (0=none, 10=severe)
- temptation_level: Appeal to greed or desire (prizes, money, deals) (0=none, 10=extreme)
- impersonation_type: What entity is being impersonated (or null if none)
- action_requested: Primary action the message wants recipient to take
- grammar_quality: Quality of grammar and spelling (0=very poor, 10=perfect)
- emotion_triggers: List of emotions being manipulated
- credibility_score: How legitimate the message appears (0=obviously fake, 10=highly credible)`;

    const completion = await openai.chat.completions.create({
      model: ""gpt-4o-mini"",
      messages: [
        {
          role: ""system"",
          content: ""You are a scam message detection expert specializing in identifying common scam tactics in Taiwan (including fake banks, lottery notifications, package scams, etc.). Please respond in English and strictly follow JSON format.""
        },
        {
          role: ""user"",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: ""json_object"" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return { 
      isScam: false, 
      confidence: 0, 
      reason: 'AI analysis failed', 
      error: error.message 
    };
  }
}


================================================================================
FILE: src/services/parser.js
================================================================================
/**
 * Extract URL, phone number, and content from message using Regex
 */
export function parseMessage(message) {
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|tw|io|gov)[^\s]*)/gi;
  const urlMatch = message.match(urlRegex);
  
  // Phone regex pattern (Taiwan mobile, landline, international format)
  const phoneRegex = /(\+?886[-\s]?)?0?9\d{2}[-\s]?\d{3}[-\s]?\d{3}|(\+?886[-\s]?)?0\d[-\s]?\d{3,4}[-\s]?\d{4}/g;
  const phoneMatch = message.match(phoneRegex);
  
  return {
    url: urlMatch ? urlMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].replace(/[-\s]/g, '') : null,
    content: message,
  };
}


================================================================================
FILE: src/services/safeBrowsing.js
================================================================================
import axios from 'axios';
import config from '../config.js';

/**
 * Check URL safety using Google Safe Browsing Lookup API v4
 */
export async function checkUrlSafety(url) {
  if (!url) return null;

  try {
    const apiKey = config.googleSafeBrowsingApiKey;
    
    if (!apiKey) {
      console.warn('⚠️ Google Safe Browsing API Key not configured');
      return { isSafe: true, threatType: null, error: 'API Key not configured' };
    }

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    
    const requestBody = {
      client: {
        clientId: ""hackthesource"",
        clientVersion: ""1.0.0""
      },
      threatInfo: {
        threatTypes: [""MALWARE"", ""SOCIAL_ENGINEERING"", ""UNWANTED_SOFTWARE"", ""POTENTIALLY_HARMFUL_APPLICATION""],
        platformTypes: [""ANY_PLATFORM""],
        threatEntryTypes: [""URL""],
        threatEntries: [{ url }]
      }
    };

    const response = await axios.post(endpoint, requestBody);

    return {
      raw: response.data,
      isSafe: !response.data.matches || response.data.matches.length === 0,
      threats: response.data.matches || []
    };
    
  } catch (error) {
    console.error('❌ Safe Browsing API error:', error.message);
    return { isSafe: true, threatType: null, error: error.message };
  }
}


================================================================================
FILE: src/services/twilioLookup.js
================================================================================
import axios from 'axios';
import config from '../config.js';

/**
 * Lookup phone information using Twilio Lookup v2 API
 */
export async function lookupPhone(phone) {
  if (!phone) return null;

  try {
    const { accountSid, authToken } = config.twilio;
    
    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not configured');
      return { valid: true, carrier: null, error: 'Twilio credentials not configured' };
    }

    // Format phone number (add country code if needed)
    const formattedPhone = phone.startsWith('+') ? phone : `+886${phone.substring(1)}`;
    
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(formattedPhone)}?Fields=line_type_intelligence`;
    
    const response = await axios.get(url, {
      auth: {
        username: accountSid,
        password: authToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Twilio Lookup API error:', error.message);
    return { valid: false, carrier: null, error: error.message };
  }
}


================================================================================
FILE: src/services/xgboostService.js
================================================================================
/**
 * XGBoost Model Service
 * Call Python Flask API for scam probability prediction
 */
import axios from 'axios';

const XGBOOST_API_URL = process.env.XGBOOST_API_URL || 'http://localhost:5000';

/**
 * Check if XGBoost API is available
 */
export async function checkXGBoostHealth() {
  try {
    const response = await axios.get(`${XGBOOST_API_URL}/health`, {
      timeout: 2000,
    });
    return response.data.model_loaded === true;
  } catch (error) {
    console.warn('⚠️ XGBoost API not available:', error.message);
    return false;
  }
}

/**
 * Predict scam probability using XGBoost model
 * @param {Object} features - 45 features extracted from message
 * @returns {Object} Prediction result with scam_probability
 */
export async function predictScamProbability(features) {
  try {
    const response = await axios.post(
      `${XGBOOST_API_URL}/predict`,
      features,
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      return {
        available: true,
        scamProbability: response.data.result.scam_probability,
        isScam: response.data.result.is_scam,
        confidence: response.data.result.confidence,
        normalProbability: response.data.result.normal_probability,
        topScamFactors: response.data.result.top_scam_factors || [],
      };
    } else {
      throw new Error(response.data.error || 'Prediction failed');
    }
  } catch (error) {
    console.error('❌ XGBoost prediction error:', error.message);
    return {
      available: false,
      error: error.message,
    };
  }
}

/**
 * Get model information
 */
export async function getModelInfo() {
  try {
    const response = await axios.get(`${XGBOOST_API_URL}/model/info`, {
      timeout: 3000,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get model info:', error.message);
    return null;
  }
}


================================================================================
FILE: src/utils/analyzer.js
================================================================================
/**
 * Generate risk assessment and recommendations from analysis results
 */
export function generateResponse({ parsed, urlResult, phoneResult, aiResult, xgboostResult }) {
  const evidence = [];
  let riskLevel = 'green'; // green, yellow, red
  let riskScore = 0;
  let mlScore = 0; // XGBoost ML score

  // XGBoost ML Model Score (if available)
  if (xgboostResult && xgboostResult.available) {
    mlScore = Math.round(xgboostResult.scamProbability * 100);
    evidence.push(`🤖 ML Model: ${mlScore}% scam probability (${xgboostResult.confidence} confidence)`);
    
    // Add top contributing factors if available
    if (xgboostResult.topScamFactors && xgboostResult.topScamFactors.length > 0) {
      evidence.push('   Top factors contributing to scam detection:');
      xgboostResult.topScamFactors.slice(0, 5).forEach((factor, index) => {
        evidence.push(`   ${index + 1}. ${factor.feature}: ${factor.value.toFixed(2)} (importance: ${(factor.importance * 100).toFixed(1)}%)`);
      });
    }
    
    // ML model has the highest weight
    riskScore += mlScore * 0.7; // 70% weight from ML model
  }

  // Analyze URL risk
  if (urlResult) {
    if (!urlResult.isSafe) {
      evidence.push(`⚠️ URL flagged by Google as ${getThreatTypeName(urlResult.threatType)}`);
      riskScore += xgboostResult?.available ? 15 : 40; // Lower weight if ML is available
    } else if (!urlResult.error) {
      evidence.push('✅ URL not flagged as malicious');
    }
  }

  // Analyze phone risk
  if (phoneResult) {
    if (phoneResult.lineType === 'voip') {
      evidence.push('⚠️ Phone is VoIP, commonly used in scams');
      riskScore += xgboostResult?.available ? 10 : 30; // Lower weight if ML is available
    } else if (phoneResult.valid) {
      evidence.push(`✅ Phone number is valid (${phoneResult.carrier || 'Unknown carrier'})`);
    } else {
      evidence.push('⚠️ Phone number is invalid or cannot be verified');
      riskScore += xgboostResult?.available ? 7 : 20; // Lower weight if ML is available
    }
  }

  // Analyze AI determination
  if (aiResult) {
    if (aiResult.isScam) {
      evidence.push(`🔍 AI Analysis: Likely Scam`);
      evidence.push(`   Reason: ${aiResult.reason}`);
      riskScore += xgboostResult?.available ? (aiResult.confidence * 0.3) : (aiResult.confidence * 0.99);
    } else {
      evidence.push(`🔍 AI Analysis: Considered Legitimate`);
    }

    if (aiResult.keywords && aiResult.keywords.length > 0) {
      evidence.push(`   Keywords: ${aiResult.keywords.join(', ')}`);
    }
  }

  // Determine risk level
  if (riskScore >= 60) {
    riskLevel = 'red';
  } else if (riskScore >= 30) {
    riskLevel = 'yellow';
  }

  // Generate action suggestions
  const action = getActionSuggestion(riskLevel, parsed);

  return {
    riskLevel,
    riskScore: Math.min(Math.round(riskScore), 99),
    mlScore: xgboostResult?.available ? mlScore : null, // Add ML score separately
    evidence,
    action,
    parsed: {
      url: parsed.url,
      phone: parsed.phone,
      content: parsed.content.substring(0, 100) + (parsed.content.length > 100 ? '...' : ''),
    },
    details: {
      url: urlResult,
      phone: phoneResult,
      ai: aiResult,
      ml: xgboostResult?.available ? {
        scamProbability: xgboostResult.scamProbability,
        isScam: xgboostResult.isScam,
        confidence: xgboostResult.confidence,
        topScamFactors: xgboostResult.topScamFactors || [],
      } : null,
    },
  };
}

function getThreatTypeName(threatType) {
  const types = {
    'MALWARE': 'Malware',
    'SOCIAL_ENGINEERING': 'Phishing',
    'UNWANTED_SOFTWARE': 'Unwanted Software',
    'POTENTIALLY_HARMFUL_APPLICATION': 'Potentially Harmful Application',
  };
  return types[threatType] || threatType;
}

function getActionSuggestion(riskLevel, parsed) {
  switch (riskLevel) {
    case 'red':
      return {
        title: '🚨 High Risk Warning',
        suggestions: [
          'Do not click any links',
          'Do not call back the phone number',
          'Block this number immediately',
          'Report to 165 anti-fraud hotline',
        ],
      };
    case 'yellow':
      return {
        title: '⚠️ Handle with Caution',
        suggestions: [
          'Verify through official channels first',
          'Do not provide personal information',
          parsed.url ? 'Avoid clicking suspicious links' : null,
          'Call 165 if you have doubts',
        ].filter(Boolean),
      };
    default:
      return {
        title: '✅ Appears Safe',
        suggestions: [
          'No obvious scam features detected',
          'However, remain vigilant',
          'Do not easily provide personal information',
        ],
      };
  }
}


================================================================================
FILE: styles/main.css
================================================================================
/* main.css — compiled CSS (extracted from test.html) */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Reset list bullets globally */
ul {
  list-style: none;
  padding-left: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(30px); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(-45deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transition: background 0.5s ease, color 0.5s ease;
}

body.light-mode { background: linear-gradient(-45deg, #f0fdf4 0%, #ffffff 25%, #ecfdf5 50%, #f0fdf4 75%, #ffffff 100%); }

.bg-elements { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.1; }
.blob-1 { width: 300px; height: 300px; background: linear-gradient(135deg, #00d4ff, #0099ff); top: -100px; left: -100px; animation: float 20s ease-in-out infinite; }
.blob-2 { width: 250px; height: 250px; background: linear-gradient(135deg, #ff006e, #ff00bb); top: 50%; right: -50px; animation: float 25s ease-in-out infinite reverse; }
.blob-3 { width: 200px; height: 200px; background: linear-gradient(135deg, #00ff88, #00d4ff); bottom: -50px; left: 10%; animation: float 30s ease-in-out infinite; }

.container { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; animation: slideInUp 0.8s ease-out; padding-bottom: 60px; }

.theme-toggle { position: fixed; top: 20px; right: 20px; z-index: 100; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 50px; padding: 10px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #00d4ff; transition: all 0.3s ease; backdrop-filter: blur(10px); }

@media (max-width: 768px) { .theme-toggle { top: 20px; right: 20px; padding: 8px 12px; font-size: 12px; } }

.theme-toggle:hover { background: rgba(0, 212, 255, 0.2); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);} 
.theme-toggle-icon { font-size: 16px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
body.light-mode .theme-toggle { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.4); color: #16a34a; }
body.light-mode .theme-toggle:hover { background: rgba(34, 197, 94, 0.25); box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }

.header { text-align: center; margin-bottom: 40px; position: relative; }
.header-badge { display: inline-block; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); color: #00d4ff; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; backdrop-filter: blur(10px); transition: all 0.3s ease; }
body.light-mode .header-badge { background: rgba(34, 197, 94, 0.12); border-color: rgba(34, 197, 94, 0.35); color: #16a34a; }
.header h1 { font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00ff88 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; letter-spacing: -1px; transition: all 0.3s ease; }
body.light-mode .header h1 { background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.header p { font-size: 16px; color: rgba(255, 255, 255, 0.7); font-weight: 300; transition: color 0.3s ease; }
body.light-mode .header p { color: rgba(45, 55, 72, 0.7); }

.card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-radius: 24px; padding: 48px; box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); animation: slideInUp 0.8s ease-out 0.1s both; transition: all 0.3s ease; }
body.light-mode .card { background: rgba(255, 255, 255, 0.95); box-shadow: 0 8px 32px rgba(34, 197, 94, 0.12), inset 0 1px 1px rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.25); }

.toggle-container { display: flex; gap: 8px; margin-bottom: 32px; background: rgba(0, 0, 0, 0.3); padding: 6px; border-radius: 16px; border: 1px solid rgba(0, 212, 255, 0.1); }
body.light-mode .toggle-container { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.2); }

.toggle-btn { flex: 1; padding: 12px 24px; border: none; background: transparent; color: rgba(255, 255, 255, 0.6); font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all 0.3s ease; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
body.light-mode .toggle-btn { color: #374151; }
.toggle-btn:hover { color: rgba(255, 255, 255, 0.9); }
body.light-mode .toggle-btn:hover { color: #16a34a; }
.toggle-btn.active { background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 255, 0.2)); color: #00d4ff; box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); }
body.light-mode .toggle-btn.active { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2)); color: #16a34a; box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), inset 0 1px 1px rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); }

label { display: block; font-size: 12px; font-weight: 700; color: #00d4ff; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; transition: color 0.3s ease; }
body.light-mode label { color: #16a34a; }

textarea { width: 100%; height: 140px; padding: 16px; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; resize: vertical; transition: all 0.3s ease; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
body.light-mode textarea { border-color: rgba(34, 197, 94, 0.3); color: #1f2937; background: rgba(34, 197, 94, 0.03); }
textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
body.light-mode textarea::placeholder { color: rgba(31, 41, 55, 0.5); }
textarea:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05); background: rgba(255, 255, 255, 0.08); }
body.light-mode textarea:focus { border-color: #16a34a; box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.08); background: rgba(34, 197, 94, 0.05); }

.input-section { display: none; }
.input-section.active { display: block; }

.form-group { margin-bottom: 28px; }

.file-input-wrapper { position: relative; display: inline-block; width: 100%; }
.file-input-label { display: flex; align-items: center; justify-content: center; width: 100%; padding: 40px; border: 2px dashed rgba(0, 212, 255, 0.3); border-radius: 16px; background: rgba(0, 212, 255, 0.05); cursor: pointer; transition: all 0.3s ease; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
body.light-mode .file-input-label { border-color: rgba(34, 197, 94, 0.35); background: rgba(34, 197, 94, 0.06); }
.file-input-label:hover { border-color: #00d4ff; background: rgba(0, 212, 255, 0.1); box-shadow: 0 0 20px rgba(0, 212, 255, 0.2); }
body.light-mode .file-input-label:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.12); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }

.file-input-label.dragover { border-color: #00d4ff; background: rgba(0, 212, 255, 0.15); box-shadow: 0 0 30px rgba(0, 212, 255, 0.3); }
body.light-mode .file-input-label.dragover { border-color: #16a34a; background: rgba(34, 197, 94, 0.15); box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); }

#imageFile { display: none; }

.file-input-text { text-align: center; color: #00d4ff; font-weight: 600; transition: color 0.3s ease; }
body.light-mode .file-input-text { color: #16a34a; }
.file-input-text small { display: block; color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 6px; font-weight: 400; transition: color 0.3s ease; }
body.light-mode .file-input-text small { color: rgba(31, 41, 55, 0.6); }

.file-name { margin-top: 12px; padding: 10px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 10px; color: #00d4ff; font-size: 13px; text-align: center; display: none; transition: all 0.3s ease; }
body.light-mode .file-name { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); color: #16a34a; }
.file-name.show { display: block; }

.analyze-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%); color: #0f3460; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; position: relative; overflow: hidden; }
body.light-mode .analyze-btn { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; }
.analyze-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); transition: left 0.5s; }
.analyze-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 212, 255, 0.4); }
body.light-mode .analyze-btn:hover { box-shadow: 0 15px 40px rgba(34, 197, 94, 0.4); }
.analyze-btn:hover::before { left: 100%; }
.analyze-btn:active { transform: translateY(-1px); }
.analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.result-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; border: 1px solid rgba(0, 212, 255, 0.2); transition: all 0.3s ease; display: flex; flex-direction: column; max-height: none; overflow: visible; }
body.light-mode .result-card { background: rgba(255, 255, 255, 0.95); border-color: rgba(34, 197, 94, 0.25); }
.result-card.high-risk { border-color: rgba(255, 0, 110, 0.3); box-shadow: 0 0 30px rgba(255, 0, 110, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }
.result-card.medium-risk { border-color: rgba(255, 154, 0, 0.3); box-shadow: 0 0 30px rgba(255, 154, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }
.result-card.low-risk { border-color: rgba(0, 255, 136, 0.3); box-shadow: 0 0 30px rgba(0, 255, 136, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }

.result-title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.5px; transition: color 0.3s ease; }
body.light-mode .result-title { color: #1f2937; }

.risk-score-container { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0 24px 0; padding: 16px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.04)); border-radius: 14px; border: 1px solid rgba(0, 212, 255, 0.15); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); transition: all 0.3s ease; }
body.light-mode .risk-score-container { background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04)); border-color: rgba(34, 197, 94, 0.15); }
.risk-score-container:hover { background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 212, 255, 0.08)); border-color: rgba(0, 212, 255, 0.25); transform: translateY(-2px); }
body.light-mode .risk-score-container:hover { background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.08)); border-color: rgba(34, 197, 94, 0.25); }
.risk-score { font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #0099ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -1px; }
body.light-mode .risk-score { background: linear-gradient(135deg, #22c55e, #16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.risk-label { font-size: 16px; font-weight: 600; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.5px; transition: color 0.3s ease; }
body.light-mode .risk-label { color: rgba(31, 41, 55, 0.7); }

.result-section { background: rgba(22, 33, 62, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: background 0.3s; max-height: none; overflow: visible; }
body.light-mode .result-section { background: rgba(236, 253, 245, 0.7); }
.result-section h3 { font-size: 12px; font-weight: 700; color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; transition: color 0.3s ease; }
body.light-mode .result-section h3 { color: #16a34a; }

.result-list li { padding: 10px 0; padding-left: 28px; color: rgba(255, 255, 255, 0.8); font-size: 14px; position: relative; line-height: 1.5; transition: color 0.3s ease; }
body.light-mode .result-list li { color: #374151; }
.result-list li:before { content: ""→""; position: absolute; left: 8px; color: #00d4ff; font-weight: bold; font-size: 16px; transition: color 0.3s ease; }
body.light-mode .result-list li:before { color: #22c55e; }

.extracted-text { background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 12px; margin: 12px 0; max-height: none; overflow: visible; border: 1px solid rgba(0, 212, 255, 0.15); font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); white-space: pre-wrap; word-break: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; transition: all 0.3s ease; }
body.light-mode .extracted-text { background: rgba(34, 197, 94, 0.03); border-color: rgba(34, 197, 94, 0.2); color: #1f2937; }

.error { background: rgba(255, 0, 110, 0.1); color: #ff9aa2; padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 0, 110, 0.3); font-size: 14px; transition: all 0.3s ease; }
body.light-mode .error { background: rgba(220, 53, 69, 0.1); color: #dc2626; border-color: rgba(220, 53, 69, 0.3); }

.loading { text-align: center; color: #00d4ff; font-weight: 600; font-size: 15px; animation: glow 1.5s ease-in-out infinite; transition: color 0.3s ease; }
body.light-mode .loading { color: #16a34a; }

#result { margin-top: 32px; display: none; animation: slideInUp 0.6s ease-out; max-height: none; overflow: visible; }
#result.show { display: block; }

@media (max-width: 768px) { .card { padding: 32px 24px; } .header h1 { font-size: 32px; } textarea { height: 120px; } .file-input-label { padding: 32px 20px; } .toggle-btn { font-size: 12px; padding: 10px 16px; } .result-card { padding: 24px; } .risk-score { font-size: 36px; } .risk-score-container { padding: 12px; margin: 16px 0 20px 0; } }

/* === crystal bubbles background === */
#bubble-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bubble { position: absolute; border-radius: 50%; will-change: transform, left, top; mix-blend-mode: screen; opacity: 0.95; /* high visibility */ filter: blur(2px) saturate(1.5); box-shadow: 0 10px 40px rgba(0,0,0,0.18), inset 0 2px 8px rgba(255,255,255,0.14); transition: transform 200ms linear; }
.bubble::after { content: ''; position: absolute; inset: 10% 10% auto auto; width: 50%; height: 50%; border-radius: 50%; background: rgba(255,255,255,0.9); opacity: 0.14; transform: rotate(-20deg); }
@media (prefers-color-scheme: dark) {
  /* softer, more natural look on dark backgrounds */
  .bubble { opacity: 0.78; filter: blur(1px) saturate(1.05); mix-blend-mode: normal; box-shadow: 0 8px 30px rgba(0,0,0,0.28), inset 0 1px 4px rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.04); }
  .bubble::after { opacity: 0.06; }
}
body.light-mode .bubble { opacity: 0.95; filter: blur(0px) saturate(1.25); mix-blend-mode: normal; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 18px 40px rgba(0,0,0,0.08), inset 0 1px 6px rgba(255,255,255,0.06); }
/* bubbles visible on all screen sizes — sizes are scaled by JS for small screens */
@keyframes bubblePulse { 0% { transform: translateZ(0) scale(1); } 50% { transform: translateZ(0) scale(1.06); } 100% { transform: translateZ(0) scale(1); } }
.bubble.pulse { animation: bubblePulse 4.6s ease-in-out infinite; }

/* visually hidden (screen-reader only) utility */
.sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }

/* Site logo (circular badge aligned with theme-toggle) */
#logo-link { position: fixed; top: 20px; left: 18px; z-index: 10000; display: inline-flex; align-items: center; justify-content: center; padding: 6px; border-radius: 9999px; overflow: hidden; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); -webkit-tap-highlight-color: transparent; pointer-events: auto; transition: transform .12s ease, filter .12s ease, background .15s ease, border-color .15s ease; backdrop-filter: blur(4px); }
#logo-link:focus { outline: 3px solid rgba(0,212,255,0.3); outline-offset: 3px; border-radius: 9999px; }
#site-logo { display: block; width: 50px; height: 50px; object-fit: cover; border-radius: 9999px; transition: transform .12s ease, filter .12s ease; will-change: transform, filter; }
#logo-link:hover #site-logo { transform: scale(1.06); }
@media (max-width: 480px) { #logo-link { top: 16px; left: 16px; } #site-logo { width: 44px; height: 44px; } }
@media (prefers-color-scheme: light) { #logo-link { background: rgba(34,197,94,0.10); border-color: rgba(34,197,94,0.18); } #site-logo { filter: drop-shadow(0 2px 6px rgba(16,24,40,0.06)); } }
@media (prefers-color-scheme: dark) { #logo-link { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); } #site-logo { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.45)) brightness(.98) saturate(1.05); } }

/* Back-to-top button */
#back-to-top {
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 24px rgba(2,6,23,0.45);
  cursor: pointer;
  transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease;
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px) scale(.98);
  z-index: 110;
  color: #fff;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

#back-to-top.visible { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
#back-to-top:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 30px rgba(2,6,23,0.6); }
#back-to-top:focus { outline: none; box-shadow: 0 0 0 6px rgba(0,212,255,0.10); }

#back-to-top svg { width: 20px; height: 20px; display: block; stroke: currentColor; color: #fff; }

body.light-mode #back-to-top {
  /* friendly green accent for visibility in light mode */
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  border: 1px solid rgba(16,24,40,0.06);
  box-shadow: 0 10px 30px rgba(34,197,94,0.16);
}

body.light-mode #back-to-top:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 18px 48px rgba(34,197,94,0.22); }
body.light-mode #back-to-top:focus { outline: none; box-shadow: 0 0 0 6px rgba(34,197,94,0.12); }

@media (prefers-color-scheme: dark) { #back-to-top { background: rgba(255,255,255,0.06); } }


================================================================================
FILE: styles/main.scss
================================================================================
/*
 * main.scss
 * Extracted from inline styles in test.html.
 * You can refactor this into smaller partials (variables, components, utilities) later.
 */

/* === extracted styles === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Reset list bullets globally */
ul {
    list-style: none;
    padding-left: 0;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(30px); }
}

@keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
}

    @keyframes glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(-45deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    padding: 40px 20px;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    transition: background 0.5s ease, color 0.5s ease;
}

body.light-mode { background: linear-gradient(-45deg, #f0fdf4 0%, #ffffff 25%, #ecfdf5 50%, #f0fdf4 75%, #ffffff 100%); }

.bg-elements { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden; }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.1; }
.blob-1 { width: 300px; height: 300px; background: linear-gradient(135deg, #00d4ff, #0099ff); top: -100px; left: -100px; animation: float 20s ease-in-out infinite; }
.blob-2 { width: 250px; height: 250px; background: linear-gradient(135deg, #ff006e, #ff00bb); top: 50%; right: -50px; animation: float 25s ease-in-out infinite reverse; }
.blob-3 { width: 200px; height: 200px; background: linear-gradient(135deg, #00ff88, #00d4ff); bottom: -50px; left: 10%; animation: float 30s ease-in-out infinite; }

.container { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; animation: slideInUp 0.8s ease-out; padding-bottom: 60px; }

.theme-toggle { position: fixed; top: 20px; right: 20px; z-index: 100; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 50px; padding: 10px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #00d4ff; transition: all 0.3s ease; backdrop-filter: blur(10px); }

@media (max-width: 768px) { .theme-toggle { top: 20px; right: 20px; padding: 8px 12px; font-size: 12px; } }

.theme-toggle:hover { background: rgba(0, 212, 255, 0.2); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);} 
.theme-toggle-icon { font-size: 16px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
body.light-mode .theme-toggle { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.4); color: #16a34a; }
body.light-mode .theme-toggle:hover { background: rgba(34, 197, 94, 0.25); box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }

.header { text-align: center; margin-bottom: 40px; position: relative; }
.header-badge { display: inline-block; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); color: #00d4ff; padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; backdrop-filter: blur(10px); transition: all 0.3s ease; }
body.light-mode .header-badge { background: rgba(34, 197, 94, 0.12); border-color: rgba(34, 197, 94, 0.35); color: #16a34a; }
.header h1 { font-size: 48px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00ff88 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; letter-spacing: -1px; transition: all 0.3s ease; }
body.light-mode .header h1 { background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.header p { font-size: 16px; color: rgba(255, 255, 255, 0.7); font-weight: 300; transition: color 0.3s ease; }
body.light-mode .header p { color: rgba(45, 55, 72, 0.7); }

.card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-radius: 24px; padding: 48px; box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); animation: slideInUp 0.8s ease-out 0.1s both; transition: all 0.3s ease; }
body.light-mode .card { background: rgba(255, 255, 255, 0.95); box-shadow: 0 8px 32px rgba(34, 197, 94, 0.12), inset 0 1px 1px rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.25); }

.toggle-container { display: flex; gap: 8px; margin-bottom: 32px; background: rgba(0, 0, 0, 0.3); padding: 6px; border-radius: 16px; border: 1px solid rgba(0, 212, 255, 0.1); }
body.light-mode .toggle-container { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.2); }

.toggle-btn { flex: 1; padding: 12px 24px; border: none; background: transparent; color: rgba(255, 255, 255, 0.6); font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all 0.3s ease; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
body.light-mode .toggle-btn { color: #374151; }
.toggle-btn:hover { color: rgba(255, 255, 255, 0.9); }
body.light-mode .toggle-btn:hover { color: #16a34a; }
.toggle-btn.active { background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 255, 0.2)); color: #00d4ff; box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); }
body.light-mode .toggle-btn.active { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2)); color: #16a34a; box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), inset 0 1px 1px rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); }

label { display: block; font-size: 12px; font-weight: 700; color: #00d4ff; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; transition: color 0.3s ease; }
body.light-mode label { color: #16a34a; }

textarea { width: 100%; height: 140px; padding: 16px; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; resize: vertical; transition: all 0.3s ease; color: rgba(255, 255, 255, 0.9); background: rgba(255, 255, 255, 0.05); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
body.light-mode textarea { border-color: rgba(34, 197, 94, 0.3); color: #1f2937; background: rgba(34, 197, 94, 0.03); }
textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
body.light-mode textarea::placeholder { color: rgba(31, 41, 55, 0.5); }
textarea:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.05); background: rgba(255, 255, 255, 0.08); }
body.light-mode textarea:focus { border-color: #16a34a; box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.08); background: rgba(34, 197, 94, 0.05); }

.input-section { display: none; }
.input-section.active { display: block; }

.form-group { margin-bottom: 28px; }

.file-input-wrapper { position: relative; display: inline-block; width: 100%; }
.file-input-label { display: flex; align-items: center; justify-content: center; width: 100%; padding: 40px; border: 2px dashed rgba(0, 212, 255, 0.3); border-radius: 16px; background: rgba(0, 212, 255, 0.05); cursor: pointer; transition: all 0.3s ease; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
body.light-mode .file-input-label { border-color: rgba(34, 197, 94, 0.35); background: rgba(34, 197, 94, 0.06); }
.file-input-label:hover { border-color: #00d4ff; background: rgba(0, 212, 255, 0.1); box-shadow: 0 0 20px rgba(0, 212, 255, 0.2); }
body.light-mode .file-input-label:hover { border-color: #22c55e; background: rgba(34, 197, 94, 0.12); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }

.file-input-label.dragover { border-color: #00d4ff; background: rgba(0, 212, 255, 0.15); box-shadow: 0 0 30px rgba(0, 212, 255, 0.3); }
body.light-mode .file-input-label.dragover { border-color: #16a34a; background: rgba(34, 197, 94, 0.15); box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); }

#imageFile { display: none; }

.file-input-text { text-align: center; color: #00d4ff; font-weight: 600; transition: color 0.3s ease; }
body.light-mode .file-input-text { color: #16a34a; }
.file-input-text small { display: block; color: rgba(255, 255, 255, 0.5); font-size: 12px; margin-top: 6px; font-weight: 400; transition: color 0.3s ease; }
body.light-mode .file-input-text small { color: rgba(31, 41, 55, 0.6); }

.file-name { margin-top: 12px; padding: 10px; background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 10px; color: #00d4ff; font-size: 13px; text-align: center; display: none; transition: all 0.3s ease; }
body.light-mode .file-name { background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); color: #16a34a; }
.file-name.show { display: block; }

.analyze-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%); color: #0f3460; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; position: relative; overflow: hidden; }
body.light-mode .analyze-btn { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; }
.analyze-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); transition: left 0.5s; }
.analyze-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 212, 255, 0.4); }
body.light-mode .analyze-btn:hover { box-shadow: 0 15px 40px rgba(34, 197, 94, 0.4); }
.analyze-btn:hover::before { left: 100%; }
.analyze-btn:active { transform: translateY(-1px); }
.analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.result-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; border: 1px solid rgba(0, 212, 255, 0.2); transition: all 0.3s ease; display: flex; flex-direction: column; max-height: none; overflow: visible; }
body.light-mode .result-card { background: rgba(255, 255, 255, 0.95); border-color: rgba(34, 197, 94, 0.25); }
.result-card.high-risk { border-color: rgba(255, 0, 110, 0.3); box-shadow: 0 0 30px rgba(255, 0, 110, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }
.result-card.medium-risk { border-color: rgba(255, 154, 0, 0.3); box-shadow: 0 0 30px rgba(255, 154, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }
.result-card.low-risk { border-color: rgba(0, 255, 136, 0.3); box-shadow: 0 0 30px rgba(0, 255, 136, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05); }

.result-title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.5px; transition: color 0.3s ease; }
body.light-mode .result-title { color: #1f2937; }

.risk-score-container { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0 24px 0; padding: 16px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.04)); border-radius: 14px; border: 1px solid rgba(0, 212, 255, 0.15); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); transition: all 0.3s ease; }
body.light-mode .risk-score-container { background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04)); border-color: rgba(34, 197, 94, 0.15); }
.risk-score-container:hover { background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 212, 255, 0.08)); border-color: rgba(0, 212, 255, 0.25); transform: translateY(-2px); }
body.light-mode .risk-score-container:hover { background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.08)); border-color: rgba(34, 197, 94, 0.25); }
.risk-score { font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #0099ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -1px; }
body.light-mode .risk-score { background: linear-gradient(135deg, #22c55e, #16a34a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.risk-label { font-size: 16px; font-weight: 600; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.5px; transition: color 0.3s ease; }
body.light-mode .risk-label { color: rgba(31, 41, 55, 0.7); }

.result-section { background: rgba(22, 33, 62, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: background 0.3s; max-height: none; overflow: visible; }
body.light-mode .result-section { background: rgba(236, 253, 245, 0.7); }
.result-section h3 { font-size: 12px; font-weight: 700; color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; transition: color 0.3s ease; }
body.light-mode .result-section h3 { color: #16a34a; }

.result-list li { padding: 10px 0; padding-left: 28px; color: rgba(255, 255, 255, 0.8); font-size: 14px; position: relative; line-height: 1.5; transition: color 0.3s ease; }
body.light-mode .result-list li { color: #374151; }
.result-list li:before { content: ""→""; position: absolute; left: 8px; color: #00d4ff; font-weight: bold; font-size: 16px; transition: color 0.3s ease; }
body.light-mode .result-list li:before { color: #22c55e; }

.extracted-text { background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 12px; margin: 12px 0; max-height: none; overflow: visible; border: 1px solid rgba(0, 212, 255, 0.15); font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); white-space: pre-wrap; word-break: break-word; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; transition: all 0.3s ease; }
body.light-mode .extracted-text { background: rgba(34, 197, 94, 0.03); border-color: rgba(34, 197, 94, 0.2); color: #1f2937; }

.error { background: rgba(255, 0, 110, 0.1); color: #ff9aa2; padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 0, 110, 0.3); font-size: 14px; transition: all 0.3s ease; }
body.light-mode .error { background: rgba(220, 53, 69, 0.1); color: #dc2626; border-color: rgba(220, 53, 69, 0.3); }

.loading { text-align: center; color: #00d4ff; font-weight: 600; font-size: 15px; animation: glow 1.5s ease-in-out infinite; transition: color 0.3s ease; }
body.light-mode .loading { color: #16a34a; }

#result { margin-top: 32px; display: none; animation: slideInUp 0.6s ease-out; max-height: none; overflow: visible; }
#result.show { display: block; }

@media (max-width: 768px) { .card { padding: 32px 24px; } .header h1 { font-size: 32px; } textarea { height: 120px; } .file-input-label { padding: 32px 20px; } .toggle-btn { font-size: 12px; padding: 10px 16px; } .result-card { padding: 24px; } .risk-score { font-size: 36px; } .risk-score-container { padding: 12px; margin: 16px 0 20px 0; } }

/* === crystal bubbles background === */
#bubble-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bubble { position: absolute; border-radius: 50%; will-change: transform, left, top; mix-blend-mode: screen; opacity: 0.95; /* high visibility */ filter: blur(2px) saturate(1.5); box-shadow: 0 10px 40px rgba(0,0,0,0.18), inset 0 2px 8px rgba(255,255,255,0.14); transition: transform 200ms linear; }

/* crystal look + slight glass highlight */
.bubble::after { content: ''; position: absolute; inset: 10% 10% auto auto; width: 50%; height: 50%; border-radius: 50%; background: rgba(255,255,255,0.9); opacity: 0.14; transform: rotate(-20deg); }

/* use different palettes for dark / light mode */
@media (prefers-color-scheme: dark) {
    /* softer, more natural look on dark backgrounds */
    .bubble { opacity: 0.78; filter: blur(1px) saturate(1.05); mix-blend-mode: normal; box-shadow: 0 8px 30px rgba(0,0,0,0.28), inset 0 1px 4px rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.04); }
    .bubble::after { opacity: 0.06; }
}
body.light-mode .bubble { opacity: 0.95; filter: blur(0px) saturate(1.25); mix-blend-mode: normal; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 18px 40px rgba(0,0,0,0.08), inset 0 1px 6px rgba(255,255,255,0.06); }

/* bubbles visible on all screen sizes — sizes are scaled by JS for small screens */

/* a tiny float/pulse to add life */
@keyframes bubblePulse { 0% { transform: translateZ(0) scale(1); } 50% { transform: translateZ(0) scale(1.06); } 100% { transform: translateZ(0) scale(1); } }

.bubble.pulse { animation: bubblePulse 4.6s ease-in-out infinite; }

/* visually hidden (screen-reader only) utility */
.sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}

/* Site logo (circular badge aligned with theme toggle) */
#logo-link {
    position: fixed;
    top: 20px;
    left: 18px;
    z-index: 10000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 9999px; /* round */
    overflow: hidden;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    -webkit-tap-highlight-color: transparent;
    pointer-events: auto;
    transition: transform 0.12s ease, filter 0.12s ease, background 0.15s ease, border-color 0.15s ease;
    backdrop-filter: blur(4px);
}

#logo-link:focus { outline: 3px solid rgba(0,212,255,0.3); outline-offset: 3px; border-radius: 9999px; }
#site-logo { display: block; width: 50px; height: 50px; object-fit: cover; border-radius: 9999px; transition: transform 0.12s ease, filter 0.12s ease; will-change: transform, filter; }
#logo-link:hover #site-logo { transform: scale(1.06); }

@media (max-width: 480px) { #logo-link { top: 16px; left: 16px; } #site-logo { width: 44px; height: 44px; } }

body.light-mode #logo-link { background: rgba(34,197,94,0.10); border-color: rgba(34,197,94,0.18); }
body.light-mode #site-logo { filter: drop-shadow(0 2px 6px rgba(16,24,40,0.06)); }

body:not(.light-mode) #logo-link { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); }
body:not(.light-mode) #site-logo { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.45)) brightness(0.98) saturate(1.05); }

/* Back-to-top button */
#back-to-top {
    position: fixed;
    right: 20px;
    bottom: 24px;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 24px rgba(2,6,23,0.45);
    cursor: pointer;
    transition: transform .18s ease, opacity .18s ease, box-shadow .18s ease;
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px) scale(.98);
    z-index: 110;
    color: #fff;
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
}

#back-to-top.visible { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
#back-to-top:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 30px rgba(2,6,23,0.6); }
#back-to-top:focus { outline: none; box-shadow: 0 0 0 6px rgba(0,212,255,0.10); }

#back-to-top svg { width: 20px; height: 20px; display: block; stroke: currentColor; color: #fff; }

body.light-mode #back-to-top {
    /* Use a friendly green accent for visibility in light mode */
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
    border: 1px solid rgba(16,24,40,0.06);
    box-shadow: 0 10px 30px rgba(34,197,94,0.16);
}

/* stronger hover and focus for light mode */
body.light-mode #back-to-top:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 18px 48px rgba(34,197,94,0.22);
}
body.light-mode #back-to-top:focus { outline: none; box-shadow: 0 0 0 6px rgba(34,197,94,0.12); }

@media (prefers-color-scheme: dark) {
    #back-to-top { background: rgba(255,255,255,0.06); }
}



================================================================================
FILE: test-api.js
================================================================================
// API Test Script
// Make sure the server is running first: npm run dev

const API_URL = 'http://localhost:3000/api/analyze';

const testCases = [
  {
    name: 'Suspicious package scam',
    message: 'URGENT! Your package has arrived. Click http://bit.ly/pakage123 to claim it. Contact: 0987654321'
  },
  {
    name: 'Bank phishing attempt',
    message: 'Your bank account has been locked. Please visit https://secure-bank-verify.com immediately. Call 0912345678'
  },
  {
    name: 'Legitimate message',
    message: 'Hi! Thanks for your order. It will arrive tomorrow. Contact us at 02-2345-6789 if you have questions.'
  },
  {
    name: 'Prize scam',
    message: 'Congratulations! You won $10,000! Claim at http://winner-prize.net or call 0999888777 now!'
  }
];

async function testAPI(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Test: ${testCase.name}`);
  console.log(`📝 Message: ""${testCase.message}""`);
  console.log('-'.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testCase.message })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`\n🎯 Risk Level: ${data.riskLevel.toUpperCase()}`);
    console.log(`📊 Risk Score: ${data.riskScore}/100`);
    
    console.log(`\n📋 Evidence:`);
    data.evidence.forEach(item => console.log(`   ${item}`));
    
    console.log(`\n💡 ${data.action.title}`);
    console.log(`   Suggestions:`);
    data.action.suggestions.forEach(item => console.log(`   • ${item}`));

    console.log(`\n✅ Test passed!`);
    return true;

  } catch (error) {
    console.log(`\n❌ Test failed!`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting API Tests...');
  console.log(`Target: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await testAPI(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total: ${testCases.length}`);
  console.log(`${'='.repeat(60)}\n`);

  if (failed > 0) {
    console.log('⚠️  Make sure the server is running: npm run dev');
  }
}

// Run tests
runAllTests();


================================================================================
FILE: test-services.js
================================================================================
// Test individual service APIs
import dotenv from 'dotenv';
import { parseMessage } from './src/services/parser.js';
import { checkUrlSafety } from './src/services/safeBrowsing.js';
import { lookupPhone } from './src/services/twilioLookup.js';
import { analyzeWithOpenAI } from './src/services/openaiCheck.js';

dotenv.config();

console.log('\n🧪 Testing Individual APIs\n');
console.log('='.repeat(70));

// Test data
const testMessage = 'URGENT! Package waiting. Visit http://suspicious-site.com or call 0912345678';
const parsed = parseMessage(testMessage);

const testMalwareUrl = 'http://testsafebrowsing.appspot.com/s/malware.html';
const testMalwarePhone = '+44 7799 829460';

console.log('\n📝 Parsed Message:');
console.log('   URL:', parsed.url || 'None');
console.log('   Phone:', parsed.phone || 'None');
console.log('   Content:', parsed.content.substring(0, 50) + '...');

// Test 1: Google Safe Browsing
console.log('\n' + '='.repeat(70));
console.log('🔍 Test 1: Google Safe Browsing API');
console.log('-'.repeat(70));
if (parsed.url) {
  try {
    const result = await checkUrlSafety(parsed.url);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    const resultMal = await checkUrlSafety(testMalwareUrl);
    console.log('✅ Result:', JSON.stringify(resultMal, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
} else {
  console.log('⚠️  No URL found in message');
}

// Test 2: Twilio Lookup
console.log('\n' + '='.repeat(70));
console.log('📞 Test 2: Twilio Lookup API');
console.log('-'.repeat(70));
if (parsed.phone) {
  try {
    const result = await lookupPhone(parsed.phone);
    console.log('✅ Result:', JSON.stringify(result, null, 2));
    const resultMel = await lookupPhone(testMalwarePhone);
    console.log('✅ Result:', JSON.stringify(resultMel, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
} else {
  console.log('⚠️  No phone number found in message');
}

// Test 3: OpenAI
console.log('\n' + '='.repeat(70));
console.log('🤖 Test 3: OpenAI Scam Detection API');
console.log('-'.repeat(70));
try {
  const result = await analyzeWithOpenAI(parsed.content);
  console.log('✅ Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n' + '='.repeat(70));
console.log('✨ All tests completed!\n');


================================================================================
FILE: test.html
================================================================================
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Scam Detection System</title>
    <link rel=""stylesheet"" href=""styles/main.css"">
</head>
<body>
    <div id=""bubble-bg"" aria-hidden=""true""></div>
    <div class=""bg-elements"">
        <div class=""blob blob-1""></div>
        <div class=""blob blob-2""></div>
        <div class=""blob blob-3""></div>
    </div>

    <!-- Site logo (place the provided Lumos PNG at assets/lumos-logo.png) -->
    <a href=""/"" id=""logo-link"" aria-label=""Lumos home"">
        <img id=""site-logo"" src=""assets/lumos-logo.png"" alt=""Lumos logo"">
    </a>

    <div class=""theme-toggle"" onclick=""toggleTheme()"" title=""Toggle dark/light mode"" role=""button"" aria-pressed=""false"">
        <span class=""theme-toggle-icon"" aria-hidden=""true""></span>
        <span id=""theme-label"" class=""sr-only"">Toggle color theme</span>
    </div>
    <div class=""container"">
        <div class=""header"">
            <div class=""header-badge"">Advanced Threat Detection</div>
            <h1>Scam Detection System</h1>
            <p>AI-powered analysis for suspicious messages and images</p>
        </div>

        <div class=""card"">
            <div class=""toggle-container"">
                <button class=""toggle-btn active"" onclick=""switchMode('text')"">Text Analysis</button>
                <button class=""toggle-btn"" onclick=""switchMode('image')"">Image Analysis</button>
            </div>

            <div id=""text-section"" class=""input-section active"">
                <div class=""form-group"">
                    <label for=""message"">Enter suspicious message</label>
                    <textarea id=""message"" placeholder=""Paste your message here..."">URGENT! Your package is waiting. Click http://suspicious-site.com to claim. Contact: 0912345678</textarea>
                </div>
                <button class=""analyze-btn"" onclick=""analyzeMessage()"">Analyze Message</button>
            </div>

            <div id=""image-section"" class=""input-section"">
                <div class=""form-group"">
                    <label for=""imageFile"">Upload image</label>
                    <div class=""file-input-wrapper"">
                        <label for=""imageFile"" class=""file-input-label"" id=""dropZone"">
                            <div>
                                <div class=""file-input-text"">
                                    Click to upload or drag and drop
                                    <small>JPG, PNG, GIF, WebP, TIFF (max 10MB)</small>
                                </div>
                                <div class=""file-name"" id=""fileName""></div>
                            </div>
                        </label>
                        <input type=""file"" id=""imageFile"" accept=""image/*"">
                    </div>
                </div>
                <button class=""analyze-btn"" onclick=""analyzeImage()"">Extract and Analyze</button>
            </div>

            <div id=""result""></div>
        </div>
    </div>

    <!-- Back to top button (appears after scrolling past one viewport) -->
    <button id=""back-to-top"" aria-label=""Back to top"" title=""Back to top"" tabindex=""0"">
        <svg viewBox=""0 0 24 24"" fill=""none"" xmlns=""http://www.w3.org/2000/svg"" aria-hidden=""true"" focusable=""false"">
            <line x1=""12"" y1=""19"" x2=""12"" y2=""6"" stroke=""currentColor"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"" />
            <polyline points=""5 12 12 5 19 12"" stroke=""currentColor"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"" fill=""none"" />
        </svg>
    </button>

    <script src=""scripts/bubbles.js"" defer></script>

    <script>
        // Helper: set theme icon (sun for light, moon for dark)
        function setThemeIcon(isLight) {
            const icon = document.querySelector('.theme-toggle-icon');
            if (!icon) return;
            if (isLight) {
                // Sun icon
                icon.innerHTML = `
                    <svg viewBox=""0 0 24 24"" fill=""none"" xmlns=""http://www.w3.org/2000/svg"" aria-hidden=""true"" focusable=""false"">
                        <circle cx=""12"" cy=""12"" r=""4"" fill=""currentColor"" />
                        <g stroke=""currentColor"" stroke-width=""2"" stroke-linecap=""round"">
                            <line x1=""12"" y1=""2"" x2=""12"" y2=""5"" />
                            <line x1=""12"" y1=""19"" x2=""12"" y2=""22"" />
                            <line x1=""2"" y1=""12"" x2=""5"" y2=""12"" />
                            <line x1=""19"" y1=""12"" x2=""22"" y2=""12"" />
                            <line x1=""4.2"" y1=""4.2"" x2=""6.3"" y2=""6.3"" />
                            <line x1=""17.7"" y1=""17.7"" x2=""19.8"" y2=""19.8"" />
                            <line x1=""17.7"" y1=""6.3"" x2=""19.8"" y2=""4.2"" />
                            <line x1=""4.2"" y1=""19.8"" x2=""6.3"" y2=""17.7"" />
                        </g>
                    </svg>`;
                icon.style.color = '';
            } else {
                // Moon icon
                icon.innerHTML = `
                    <svg viewBox=""0 0 24 24"" fill=""none"" xmlns=""http://www.w3.org/2000/svg"" aria-hidden=""true"" focusable=""false"">
                        <path d=""M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"" fill=""currentColor"" />
                    </svg>`;
                icon.style.color = '';
            }
        }

        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            setThemeIcon(true);
            document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('light-mode');
            setThemeIcon(false);
            document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'false');
        }

        function toggleTheme() {
            const willBeLight = !document.body.classList.contains('light-mode');
            if (willBeLight) {
                document.body.classList.add('light-mode');
                setThemeIcon(true);
                localStorage.setItem('theme', 'light');
                document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'true');
            } else {
                document.body.classList.remove('light-mode');
                setThemeIcon(false);
                localStorage.setItem('theme', 'dark');
                document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'false');
            }
        }

        function switchMode(mode) {
            const textSection = document.getElementById('text-section');
            const imageSection = document.getElementById('image-section');
            const buttons = document.querySelectorAll('.toggle-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            
            if (mode === 'text') {
                textSection.classList.add('active');
                imageSection.classList.remove('active');
                buttons[0].classList.add('active');
            } else {
                textSection.classList.remove('active');
                imageSection.classList.add('active');
                buttons[1].classList.add('active');
            }
            
            document.getElementById('result').classList.remove('show');
        }

        const dropZone = document.getElementById('dropZone');
        const imageFile = document.getElementById('imageFile');
        const fileName = document.getElementById('fileName');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            imageFile.files = files;
            updateFileName(files[0]);
        }, false);

        imageFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                updateFileName(e.target.files[0]);
            }
        });

        function updateFileName(file) {
            if (file) {
                fileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)';
                fileName.style.display = 'block';
            } else {
                fileName.style.display = 'none';
            }
        }

        async function analyzeMessage() {
            const message = document.getElementById('message').value;
            const resultDiv = document.getElementById('result');
            
            if (!message.trim()) {
                resultDiv.innerHTML = '<div class=""error"">Please enter a message to analyze</div>';
                resultDiv.classList.add('show');
                return;
            }
            
            resultDiv.innerHTML = '<div class=""loading"">Analyzing message...</div>';
            resultDiv.classList.add('show');
            
            try {
                const response = await fetch('http://localhost:3000/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    resultDiv.innerHTML = `<div class=""error"">${data.error}</div>`;
                } else {
                    const riskClass = getRiskClass(data.riskLevel);
                    resultDiv.innerHTML = `
                        <div class=""result-card ${riskClass}"">
                            <div class=""result-title"">${getStatusTitle(data.riskLevel)}</div>
                            <div class=""risk-score-container"">
                                <span class=""risk-score"">${data.riskScore}</span><span class=""risk-label"">/ 100</span>
                            </div>
                            
                            <div class=""result-section"">
                                <h3>Analysis Evidence</h3>
                                <ul class=""result-list"">
                                    ${data.evidence.map(e => `<li>${e}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class=""result-section"">
                                <h3>Recommendations</h3>
                                <ul class=""result-list"">
                                    ${data.action.suggestions.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class=""error"">Error: ${error.message}</div>`;
            }
        }

        async function analyzeImage() {
            const fileInput = document.getElementById('imageFile');
            const resultDiv = document.getElementById('result');
            
            if (!fileInput.files.length) {
                resultDiv.innerHTML = '<div class=""error"">Please select an image file</div>';
                resultDiv.classList.add('show');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            
            resultDiv.innerHTML = '<div class=""loading"">Extracting text and analyzing image...</div>';
            resultDiv.classList.add('show');
            
            try {
                const response = await fetch('http://localhost:3000/api/ocr', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    resultDiv.innerHTML = `<div class=""error"">${data.error}</div>`;
                } else {
                    const riskClass = getRiskClass(data.riskLevel);
                    resultDiv.innerHTML = `
                        <div class=""result-card ${riskClass}"">
                            <div class=""result-section"">
                                <h3>Extracted Text</h3>
                                <div class=""extracted-text"">${escapeHtml(data.text)}</div>
                            </div>
                            
                            <div style=""margin-top: 16px;"">
                                <div class=""result-title"">${getStatusTitle(data.riskLevel)}</div>
                                <div class=""risk-score-container"">
                                    <span class=""risk-score"">${data.riskScore}</span><span class=""risk-label"">/ 100</span>
                                </div>
                            </div>
                            
                            <div class=""result-section"">
                                <h3>Analysis Evidence</h3>
                                <ul class=""result-list"">
                                    ${data.evidence.map(e => `<li>${e}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class=""result-section"">
                                <h3>Recommendations</h3>
                                <ul class=""result-list"">
                                    ${data.action.suggestions.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class=""error"">Error: ${error.message}</div>`;
            }
        }

        function getRiskClass(riskLevel) {
            if (riskLevel === 'red') return 'high-risk';
            if (riskLevel === 'yellow') return 'medium-risk';
            return 'low-risk';
        }

        function getStatusTitle(riskLevel) {
            if (riskLevel === 'red') return 'High Risk Detected';
            if (riskLevel === 'yellow') return 'Medium Risk Detected';
            return 'Low Risk';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Initialize theme on page load
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme === 'light') {
                document.body.classList.add('light-mode');
                setThemeIcon(true);
                document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'true');
            } else {
                document.body.classList.remove('light-mode');
                setThemeIcon(false);
                document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'false');
            }
            // Back-to-top behavior: show when scrolled beyond one viewport height
            const backBtn = document.getElementById('back-to-top');
            if (backBtn) {
                function updateBackBtn() {
                    const scrolled = window.scrollY || document.documentElement.scrollTop;
                    const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                    // show immediately when user scrolls, but only if page is taller than viewport
                    if (docHeight > window.innerHeight && scrolled > 0) backBtn.classList.add('visible');
                    else backBtn.classList.remove('visible');
                }

                // show/hide on load/scroll/resize
                updateBackBtn();
                window.addEventListener('scroll', updateBackBtn, { passive: true });
                window.addEventListener('resize', updateBackBtn);

                // click and keyboard activation
                backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
                backBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        backBtn.click();
                    }
                });
            }
        });
    </script>
</body>
</html>

================================================================================
FILE: training/README.md
================================================================================
# Training Data Collection

Tools for collecting and preparing training data for the XGBoost scam detection model.

## Structure

```
training/
├── routes/          # API routes
├── services/        # Feature extraction
├── utils/           # CSV writing utilities
├── scripts/         # Test and batch processing scripts
└── index.js         # Training server entry point
```

## Usage

### 1. Start the training server

```bash
node training/index.js
```

Server runs on `http://localhost:3001`

### 2. Collect training data

```bash
# Test with sample messages
node training/scripts/test-collect.js
```

### 3. Check output

Training data is saved to `training_data.csv` in the project root.

## API Endpoints

- `POST /api/collect-training-data` - Collect one training sample
  ```json
  {
    ""ocr_text"": ""Message text..."",
    ""label"": 1,
    ""image_path"": ""data_pics/fraud/IMG_001.PNG""
  }
  ```

- `GET /api/training-stats` - Get collection statistics

## Features Extracted

Total: **45 features**

- Text features (14)
- URL features (8)
- Phone features (7)
- OpenAI AI features (12)
- Statistical features (3)

## Output

CSV file with all extracted features, ready for XGBoost training in Python.


================================================================================
FILE: training/index.js
================================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import collectDataRouter from './routes/collectData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', collectDataRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Training data collection server is running',
    endpoints: [
      'POST /api/collect-training-data',
      'GET /api/training-stats'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎓 Training server is running on http://localhost:${PORT}`);
  console.log(`📊 CSV output: training_data.csv`);
});


================================================================================
FILE: training/routes/collectData.js
================================================================================
import express from 'express';
import { parseMessage } from '../../src/services/parser.js';
import { checkUrlSafety } from '../../src/services/safeBrowsing.js';
import { lookupPhone } from '../../src/services/twilioLookup.js';
import { analyzeWithOpenAI } from '../../src/services/openaiCheck.js';
import { extractFeatures } from '../services/featureExtractor.js';
import { initCSV, appendToCSV, getRowCount } from '../utils/csvWriter.js';

const router = express.Router();

// Initialize CSV on server start
initCSV();

router.post('/collect-training-data', async (req, res) => {
  try {
    const { image_path, ocr_text, label } = req.body;

    if (!ocr_text || label === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: ocr_text, label' 
      });
    }

    console.log(`\n📝 Processing training data: ${image_path || 'unknown'}`);

    // 1. Parse message
    const parsed = parseMessage(ocr_text);

    // 2. Call APIs in parallel
    const [urlResult, phoneResult, aiResult] = await Promise.all([
      parsed.url ? checkUrlSafety(parsed.url) : Promise.resolve(null),
      parsed.phone ? lookupPhone(parsed.phone) : Promise.resolve(null),
      analyzeWithOpenAI(ocr_text),
    ]);

    // 3. Extract all features
    const features = extractFeatures(ocr_text, parsed, urlResult, phoneResult, aiResult);

    // 4. Prepare row data
    const rowData = {
      message_id: getRowCount() + 1,
      label: label,
      source: image_path || 'unknown',
      message_text: ocr_text,
      ...features
    };

    // 5. Append to CSV
    appendToCSV(rowData);

    console.log(`✅ Added row ${rowData.message_id} to training_data.csv`);

    res.json({
      success: true,
      message_id: rowData.message_id,
      features: features,
      apis_called: {
        url: !!urlResult,
        phone: !!phoneResult,
        openai: !!aiResult
      }
    });

  } catch (error) {
    console.error('❌ Error collecting training data:', error);
    res.status(500).json({
      error: 'Failed to collect training data',
      message: error.message
    });
  }
});

// Get CSV statistics
router.get('/training-stats', (req, res) => {
  try {
    const totalRows = getRowCount();
    res.json({
      total_samples: totalRows,
      csv_file: 'training_data.csv'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


================================================================================
FILE: training/scripts/scan-images.js
================================================================================
// Batch process all images in data_pics folder with OCR
// This script will:
// 1. Read all images from data_pics/fraud and data_pics/normal
// 2. Extract text using OCR for each image
// 3. Send to training API with correct label

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromImage } from '../../src/services/ocrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PICS_DIR = path.join(__dirname, '../../data_pics');
const API_URL = 'http://localhost:3000/api/training/collect-training-data';

// Get all image files from a directory
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
  }).map(file => path.join(dir, file));
}

// Collect all images with their labels
function collectAllImages() {
  const images = {
    fraud: [],
    normal: []
  };

  // Fraud images
  const fraudDir = path.join(DATA_PICS_DIR, 'fraud');
  if (fs.existsSync(fraudDir)) {
    images.fraud = getImageFiles(fraudDir).map(filePath => ({
      path: filePath.replace(/\\/g, '/'),
      label: 1,
      category: 'fraud'
    }));
  }

  // Normal images
  const normalDir = path.join(DATA_PICS_DIR, 'normal');
  if (fs.existsSync(normalDir)) {
    images.normal = getImageFiles(normalDir).map(filePath => ({
      path: filePath.replace(/\\/g, '/'),
      label: 0,
      category: 'normal'
    }));
  }

  return [...images.fraud, ...images.normal];
}

// Process a single image
async function processImage(image, index, total) {
  try {
    console.log(`\n[${index + 1}/${total}] Processing: ${path.basename(image.path)}`);
    console.log(`  Category: ${image.category} (label=${image.label})`);
    
    // Read image file
    const imageBuffer = fs.readFileSync(image.path);
    
    // Extract text using OCR
    console.log('  🔍 Running OCR...');
    const ocrText = await extractTextFromImage(imageBuffer);
    
    if (!ocrText || ocrText.trim().length === 0) {
      console.log('  ⚠️  No text extracted, skipping...');
      return { success: false, reason: 'No text found' };
    }
    
    console.log(`  📄 Extracted text (${ocrText.length} chars)`);
    
    // Send to training API
    console.log('  📤 Sending to API...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_path: image.path,
        ocr_text: ocrText,
        label: image.label
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`  ❌ API error: ${error}`);
      return { success: false, reason: error };
    }
    
    const result = await response.json();
    console.log(`  ✅ Success! Row added to CSV`);
    
    return { success: true, result };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 Starting batch processing...\n');
  console.log('📁 Scanning data_pics directory...');
  
  const allImages = collectAllImages();
  
  if (allImages.length === 0) {
    console.log('❌ No images found in data_pics/fraud or data_pics/normal');
    return;
  }
  
  console.log(`\n📊 Found ${allImages.length} images:`);
  console.log(`  - Fraud: ${allImages.filter(img => img.label === 1).length}`);
  console.log(`  - Normal: ${allImages.filter(img => img.label === 0).length}`);
  console.log('\n' + '='.repeat(70));
  
  // Check if server is running
  try {
    await fetch('http://localhost:3000/health');
  } catch (error) {
    console.log('\n❌ Server is not running!');
    console.log('Please start the server first: npm run dev');
    return;
  }
  
  // Process all images
  const results = {
    total: allImages.length,
    success: 0,
    failed: 0,
    skipped: 0
  };
  
  for (let i = 0; i < allImages.length; i++) {
    const result = await processImage(allImages[i], i, allImages.length);
    
    if (result.success) {
      results.success++;
    } else if (result.reason === 'No text found') {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Processing Complete!');
  console.log(`  Total images: ${results.total}`);
  console.log(`  ✅ Successfully processed: ${results.success}`);
  console.log(`  ⚠️  Skipped (no text): ${results.skipped}`);
  console.log(`  ❌ Failed: ${results.failed}`);
  console.log('\n✨ Training data saved to: training_data.csv');
}

main().catch(console.error);


================================================================================
FILE: training/scripts/test-collect.js
================================================================================
// Test the training data collection endpoint

const API_URL = 'http://localhost:3000/api/training/collect-training-data';

// Test with a few sample messages
const testSamples = [
  {
    image_path: 'data_pics/fraud/IMG_2417.PNG',
    ocr_text: 'Congratulations! You won a prize! Click http://bit.ly/prize123 to claim NOW or call 0912345678',
    label: 1  // fraud
  },
  {
    image_path: 'data_pics/normal/normal_001.PNG',
    ocr_text: 'Hello, your order has been shipped. Contact customer service at 02-2345-6789 for tracking',
    label: 0  // normal
  },
  {
    image_path: 'data_pics/fraud/IMG_2419.PNG',
    ocr_text: 'URGENT! Your package is waiting. Click http://suspicious-link.com NOW! Call 0987654321',
    label: 1  // fraud
  }
];

async function testCollectData() {
  console.log('🚀 Testing Training Data Collection API\n');
  console.log('='.repeat(70));

  for (const sample of testSamples) {
    console.log(`\n📝 Processing: ${sample.image_path}`);
    console.log(`   Label: ${sample.label} (${sample.label === 1 ? 'FRAUD' : 'NORMAL'})`);
    console.log(`   Text: ${sample.ocr_text.substring(0, 50)}...`);
    console.log('-'.repeat(70));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sample)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Success! Message ID: ${data.message_id}`);
      console.log(`   APIs Called:`, data.apis_called);
      console.log(`\n   📊 Key Features:`);
      console.log(`      Text Features:`);
      console.log(`        - Message Length: ${data.features.message_length}`);
      console.log(`        - Has URL: ${data.features.has_url}`);
      console.log(`        - Has Phone: ${data.features.has_phone}`);
      console.log(`        - Urgent Words: ${data.features.contains_urgent_words}`);
      console.log(`        - Money Keywords: ${data.features.contains_money_keywords}`);
      console.log(`\n      AI Analysis:`);
      console.log(`        - Is Scam: ${data.features.openai_is_scam} (${data.features.openai_confidence}%)`);
      console.log(`        - Urgency Level: ${data.features.openai_urgency_level}/10`);
      console.log(`        - Threat Level: ${data.features.openai_threat_level}/10`);
      console.log(`        - Temptation Level: ${data.features.openai_temptation_level}/10`);
      console.log(`        - Impersonation: ${data.features.openai_impersonation_type || 'none'}`);
      console.log(`        - Action Requested: ${data.features.openai_action_requested || 'none'}`);
      console.log(`        - Grammar Quality: ${data.features.openai_grammar_quality}/10`);
      console.log(`        - Emotion Triggers: ${data.features.openai_emotion_triggers || 'none'}`);
      console.log(`        - Credibility Score: ${data.features.openai_credibility_score}/10`);

    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Get statistics
  console.log('\n' + '='.repeat(70));
  console.log('📊 Getting Statistics...\n');
  
  try {
    const statsResponse = await fetch('http://localhost:3000/api/training/training-stats');
    const stats = await statsResponse.json();
    console.log(`✅ Total samples collected: ${stats.total_samples}`);
    console.log(`📁 CSV file: ${stats.csv_file}`);
  } catch (error) {
    console.log(`❌ Failed to get stats: ${error.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Test completed! Check training_data.csv in project root.\n');
}

testCollectData();


================================================================================
FILE: training/services/featureExtractor.js
================================================================================
/**
 * Extract features from message text for ML training
 */
export function extractFeatures(text, parsed, urlResult, phoneResult, aiResult) {
  // Text features
  const urgentWords = ['urgent', 'immediate', 'now', 'asap', 'hurry', 'fast', 'quick', 'alert', 'warning', 'action required'];
  const moneyWords = ['money', 'prize', 'win', 'won', 'cash', 'reward', 'bonus', 'free', 'gift', 'claim', 'dollar', 'payment'];
  const linkWords = ['click', 'link', 'visit', 'url', 'website', 'site', 'open', 'access'];
  const prizeWords = ['congratulations', 'winner', 'selected', 'lucky', 'chosen', 'qualified'];
  const bankWords = ['bank', 'account', 'password', 'verify', 'confirm', 'secure', 'credential', 'login'];
  const packageWords = ['package', 'delivery', 'parcel', 'shipment', 'courier', 'shipping', 'tracking'];

  const lowerText = text.toLowerCase();
  
  const features = {
    // Text features
    message_length: text.length,
    contains_urgent_words: urgentWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    contains_money_keywords: moneyWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    contains_link_text: linkWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    contains_prize_keywords: prizeWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    contains_bank_keywords: bankWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    contains_package_keywords: packageWords.some(w => lowerText.includes(w.toLowerCase())) ? 1 : 0,
    special_char_count: (text.match(/[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]/g) || []).length,
    exclamation_count: (text.match(/!/g) || []).length,
    question_count: (text.match(/\?/g) || []).length,
    
    // URL features
    has_url: parsed.url ? 1 : 0,
    url_count: parsed.url ? 1 : 0,
    url_domain: parsed.url ? new URL(parsed.url).hostname : null,
    url_is_shortened: parsed.url ? isShortUrl(parsed.url) : 0,
    url_has_ip: parsed.url ? hasIPAddress(parsed.url) : 0,
    url_length: parsed.url ? parsed.url.length : 0,
    google_safe_browsing_is_safe: urlResult?.response?.matches ? 0 : 1,
    google_safe_browsing_threat: urlResult?.response?.matches?.[0]?.threatType || null,
    
    // Phone features
    has_phone: parsed.phone ? 1 : 0,
    phone_count: parsed.phone ? 1 : 0,
    phone_number: parsed.phone,
    phone_is_mobile: phoneResult?.line_type_intelligence?.type === 'mobile' ? 1 : 0,
    phone_is_voip: phoneResult?.line_type_intelligence?.type === 'voip' ? 1 : 0,
    phone_is_valid: phoneResult?.valid ? 1 : 0,
    phone_carrier: phoneResult?.line_type_intelligence?.carrier_name || null,
    phone_country_code: phoneResult?.country_code || null,
    
    // OpenAI features
    openai_is_scam: aiResult?.isScam ? 1 : 0,
    openai_confidence: aiResult?.confidence || 0,
    openai_reason: aiResult?.reason || null,
    openai_keywords: aiResult?.keywords ? aiResult.keywords.join(', ') : null,
    openai_urgency_level: aiResult?.urgency_level || 0,
    openai_threat_level: aiResult?.threat_level || 0,
    openai_temptation_level: aiResult?.temptation_level || 0,
    openai_impersonation_type: aiResult?.impersonation_type || null,
    openai_action_requested: aiResult?.action_requested || null,
    openai_grammar_quality: aiResult?.grammar_quality || 0,
    openai_emotion_triggers: aiResult?.emotion_triggers ? aiResult.emotion_triggers.join(', ') : null,
    openai_credibility_score: aiResult?.credibility_score || 0,
    
    // Statistical features
    avg_word_length: calculateAvgWordLength(text),
    digit_ratio: calculateDigitRatio(text),
    uppercase_ratio: calculateUppercaseRatio(text),
  };
  
  return features;
}

function isShortUrl(url) {
  const shortDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'reurl.cc', 't.co', 'short.link'];
  try {
    const hostname = new URL(url).hostname;
    return shortDomains.some(d => hostname.includes(d)) ? 1 : 0;
  } catch {
    return 0;
  }
}

function hasIPAddress(url) {
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  return ipPattern.test(url) ? 1 : 0;
}

function calculateAvgWordLength(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return (totalLength / words.length).toFixed(2);
}

function calculateDigitRatio(text) {
  if (text.length === 0) return 0;
  const digitCount = (text.match(/\d/g) || []).length;
  return (digitCount / text.length).toFixed(3);
}

function calculateUppercaseRatio(text) {
  const letters = text.match(/[a-zA-Z]/g) || [];
  if (letters.length === 0) return 0;
  const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
  return (uppercaseCount / letters.length).toFixed(3);
}


================================================================================
FILE: training/utils/csvWriter.js
================================================================================
import fs from 'fs';
import path from 'path';

const CSV_FILE = path.join(process.cwd(), 'training_data.csv');

// CSV column headers
const HEADERS = [
  'message_id',
  'label',
  'source',
  'message_text',
  'message_length',
  'contains_urgent_words',
  'contains_money_keywords',
  'contains_link_text',
  'contains_prize_keywords',
  'contains_bank_keywords',
  'contains_package_keywords',
  'special_char_count',
  'exclamation_count',
  'question_count',
  'has_url',
  'url_count',
  'url_domain',
  'url_is_shortened',
  'url_has_ip',
  'url_length',
  'google_safe_browsing_is_safe',
  'google_safe_browsing_threat',
  'has_phone',
  'phone_count',
  'phone_number',
  'phone_is_mobile',
  'phone_is_voip',
  'phone_is_valid',
  'phone_carrier',
  'phone_country_code',
  'openai_is_scam',
  'openai_confidence',
  'openai_reason',
  'openai_keywords',
  'openai_urgency_level',
  'openai_threat_level',
  'openai_temptation_level',
  'openai_impersonation_type',
  'openai_action_requested',
  'openai_grammar_quality',
  'openai_emotion_triggers',
  'openai_credibility_score',
  'avg_word_length',
  'digit_ratio',
  'uppercase_ratio'
];

/**
 * Initialize CSV file with headers if it doesn't exist
 */
export function initCSV() {
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, HEADERS.join(',') + '\n', 'utf8');
    console.log('✅ Created training_data.csv');
  }
}

/**
 * Append a row to the CSV file
 */
export function appendToCSV(data) {
  const row = HEADERS.map(header => {
    let value = data[header];
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }
    
    // Escape strings containing commas or quotes
    if (typeof value === 'string') {
      if (value.includes(',') || value.includes('""') || value.includes('\n')) {
        value = `""${value.replace(/""/g, '""""')}""`;
      }
    }
    
    return value;
  }).join(',');
  
  fs.appendFileSync(CSV_FILE, row + '\n', 'utf8');
}

/**
 * Get current row count (excluding header)
 */
export function getRowCount() {
  if (!fs.existsSync(CSV_FILE)) {
    return 0;
  }
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.trim().split('\n');
  return Math.max(0, lines.length - 1); // Exclude header
}


</code>",2026/01/05 09:44:14,kenet.hsurreyclm36@gmail.com