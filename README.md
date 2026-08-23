Live Site:
PURGED

### TODO

-   🟨 Make a dropdown to quickly select new nodes when a handle is dragged

### ✅ Recently Completed Improvements

-   ✅ Removed duplicate React Flow package dependencies (`react-flow-renderer`, `@xyflow/react`)
-   ✅ Fixed broken default test in `App.test.js`
-   ✅ Fixed `separator` typo throughout `DataInput.js`
-   ✅ Added `.gitignore` rules for large data files (`*.csv`, `*.xlsx`, etc.) and Jupyter notebooks
-   ✅ Created shared `BaseNode` component to eliminate boilerplate in all node files
-   ✅ Refactored static nodes (`TrainModel`, `LabelEncoder`, `ClassificationReport`, `RemoveNa`) to use `BaseNode` and `useEffect` instead of direct `data` mutation
-   ✅ Improved sidebar button labels with human-readable spacing (e.g. "Random Forest" instead of "RandomForest")


## ✅ **AI Pipeline Builder – Node Checklist**

### 🟢 Data Input Nodes

- [x]  CSV Loader
- [x]  Excel Loader
- [x]  JSON Loader
- [ ]  SQL Query (MySQL, PostgreSQL, SQLite)
- [ ]  NoSQL Connector (MongoDB, Firebase)
- [x]  API Fetch (REST/GraphQL)
- [ ]  Web Scraper
- [ ]  File Upload (Local files)
- [ ]  Cloud Storage Connector (S3, GCP, Azure)
- [ ]  Synthetic Data Generator

---

### 🟡 Data Transformation / Preprocessing Nodes

- [x]  Missing Value Imputer (mean, median, mode, etc.)
- [ ]  Data Type Converter
- [x]  One-Hot Encoder  
- [x]  Label Encoder
- [ ]  Custom Mapping
- [x]  Standard Scaler
- [ ]  MinMax Scaler
- [x]  Robust Scaler
- [ ]  Normalizer
- [ ]  Log Transformer
- [ ]  PCA / Dimensionality Reduction
- [ ]  Row Filter / Query
- [x]  Duplicate Remover
- [ ]  Feature Engineering Node
- [x]  Train-Test Split
- [x]  Stratified Split
- [x]  Cross Validator
- [ ]  Time Series Split
- [ ]  Text Preprocessing (tokenization, stopwords, etc.)
- [ ]  Outlier Remover
- [ ]  Sampling Node (SMOTE, up/downsampling)

---

### 🔵 Model Nodes – Classical ML

- [ ]  Linear Regression
- [ ]  Logistic Regression
- [x]  Decision Tree
- [x]  Random Forest
- [ ]  Gradient Boosting (GBM)
- [ ]  XGBoost
- [ ]  LightGBM
- [x]  Support Vector Machine (SVM)
- [x]  K-Nearest Neighbors (KNN)
- [ ]  Naive Bayes
- [ ]  K-Means Clustering
- [ ]  DBSCAN
- [ ]  Isolation Forest
- [ ]  ARIMA / SARIMA
- [ ]  HMM (Hidden Markov Model)

---

### 🔵 Model Nodes – Deep Learning

- [ ]  Neural Network (Keras/PyTorch)
- [ ]  CNN Classifier
- [ ]  RNN / LSTM
- [ ]  Transformer Encoder
- [ ]  BERT / HuggingFace Model
- [ ]  GAN (Generator + Discriminator)
- [ ]  Autoencoder

---

### 🟣 Model Training & Tuning

- [x]  Model Trainer
- [x]  Cross-Validator
- [ ]  Hyperparameter Tuner (Grid/Random/Optuna)
- [ ]  Early Stopping
- [ ]  Model Checkpoint Saver

---

### 🟠 Evaluation Nodes

- [ ]  Confusion Matrix
- [x]  Classification Report
- [ ]  ROC-AUC Curve
- [ ]  Precision-Recall Curve
- [ ]  Accuracy Score
- [ ]  F1 Score
- [ ]  MAE / RMSE / R2 Score
- [ ]  Loss Curve Viewer
- [ ]  SHAP / Feature Importance
- [ ]  Residual Plot
- [ ]  Prediction vs Actual Viewer

---

### 🟤 Utility / Control Flow

- [x]  Custom Python Code
- [ ]  If Condition / Logic Node
- [ ]  Loop / Iterator Node
- [ ]  Variable Setter / Getter
- [ ]  Data Logger
- [ ]  Timer / Scheduler
- [ ]  Debug / Print Output
- [ ]  Annotation / Comment Block
- [ ]  Node Group / Subgraph
- [ ]  Trigger Node

---

### 🔘 Output & Export

- [ ]  Model Export (Pickle, ONNX, etc.)
- [ ]  Python Script Generator
- [ ]  Jupyter Notebook Export
- [ ]  API Generator (Flask/FastAPI)
- [ ]  Dockerfile Generator
- [ ]  Visualization Output
- [ ]  Cloud Upload
- [ ]  Pipeline JSON Export/Import

---

### 🟓 Integration / Deployment

- [ ]  MLflow Logger
- [ ]  DVC Tracker
- [ ]  GitHub Push
- [ ]  CI/CD Trigger
- [ ]  SageMaker Deployment
- [ ]  Vertex AI Deployment
- [ ]  Lambda Function Export
- [ ]  Docker Build & Push
- [ ]  Monitoring Hook
- [ ]  Streamlit App Export

---

### 🧬 LLM & AutoML (Optional / Advanced)

- [ ]  AutoML Pipeline Node
- [ ]  Text-to-Pipeline Node (Prompt-based)
- [ ]  Model Explainer (GPT-based)
- [ ]  Code-to-Graph Generator
- [ ]  Graph-to-Code Assistant
- [ ]  Prompt Node (for inference with LLMs)

---

## Getting Started

### 1. Development Server (React Dev Mode)

Run the frontend in development mode with hot-reloading:

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

---

### 2. Building the Application

Create an optimized production build of the React app:

```bash
npm run build
```

This compiles and bundles static assets into the `build/` directory.

---

### 3. Serving with Python

#### Option A: Built-in Pluto Server (Recommended - UI + Backend Execution)

The included Python backend serves the static build while also enabling file management APIs and Python code execution nodes:

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build the frontend (if not already built)
npm run build

# 3. Launch the Pluto server
python -m server
```

The server starts at [http://localhost:8765](http://localhost:8765) and automatically opens in your default browser.

**Configuration Options:**

- **Custom Port:**
  ```bash
  PLUTO_PORT=9000 python -m server
  ```
- **Custom Workspace Directory:**
  ```bash
  PLUTO_WORKSPACE=/path/to/custom/workspace python -m server
  ```

#### Option B: Standalone Static HTTP Server (UI Only)

If you only need to serve the built static web app without backend API and code execution capabilities:

```bash
# Python 3
python3 -m http.server 8000 --directory build
```

Or navigate to the build directory directly:

```bash
cd build
python3 -m http.server 8000
```

Access the UI at [http://localhost:8000](http://localhost:8000).


