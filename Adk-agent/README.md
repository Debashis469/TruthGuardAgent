# Multi-Agent Fact and News Verification System

A hierarchical, parallel agent workflow built with **Google Agent Development Kit (ADK)** for automated news verification, fact-checking, and scam detection.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Agent Structure](#agent-structure)
- [Deployment](#deployment)
- [Testing and Evaluation](#testing-and-evaluation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This system implements a sophisticated multi-agent verification pipeline that:
- **Validates news** against multiple news APIs and fact-check databases
- **Verifies factual claims** using Google Fact Check Tools API and LLM reasoning
- **Detects scams** through sentiment analysis, malicious link detection, and pattern recognition
- **Generates comprehensive reports** with evidence and confidence scores

Built on Google's ADK framework, the system leverages parallel processing, hierarchical agent orchestration, and integration with Google Cloud services for scalability and reliability.

---

## 🏗️ System Architecture

```
User Input
    ↓
Processing Agent (Main Controller)
    ├── News Check Agent (Parallel)
    │   ├── News APIs Agent
    │   ├── Google Fact Checker Agent
    │   └── Perplexity Agent
    │
    ├── Fact-Check Agent (Parallel)
    │   ├── Google Fact Checker Agent
    │   └── Perplexity Agent
    │
    └── Scam-Check Agent (Parallel)
        ├── Fake Sentiment Agent
        ├── Malicious Link Detector Agent
        └── Perplexity Agent
    ↓
Final Reporting Agent
    ↓
Verification Report
```

### Workflow Flow:
1. **Processing Agent** receives and classifies user input
2. **Specialized agents** run parallel sub-agents for multi-source verification
3. **Sub-agents** execute concurrently using APIs, fact-check databases, and LLM reasoning
4. **Results aggregate** back to Processing Agent
5. **Final Reporting Agent** synthesizes comprehensive verification report

---

## ✨ Features

- **🔄 Parallel Processing**: Multiple agents verify content simultaneously for speed and redundancy
- **🌐 Multi-Source Verification**: Cross-references news APIs, fact-check databases, and LLM reasoning
- **🛡️ Scam Detection**: Sentiment analysis, malicious link scanning, and fraud pattern recognition
- **📊 Comprehensive Reports**: Detailed verdicts with confidence scores and supporting evidence
- **🚀 Scalable Deployment**: Deploy locally, on Cloud Run, or Vertex AI Agent Engine
- **🔒 Built-in Security**: Role-based access, secure API handling, and prompt injection protection
- **📈 Evaluation Support**: Built-in testing and metrics for agent performance

---

## 📦 Prerequisites

- Python 3.10+
- Google Cloud Project with billing enabled
- API Keys:
  - Google Fact Check Tools API
  - News APIs (NewsAPI, GNews, Webz.io, etc.)
  - Google Web Risk API (for malicious link detection)
  - Gemini API or Vertex AI access
- Docker (for containerized deployment)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/fact-verification-agent.git
cd fact-verification-agent
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install ADK
```bash
pip install google-adk
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```env
# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# API Keys
GOOGLE_FACT_CHECK_API_KEY=your-fact-check-api-key
NEWS_API_KEY=your-news-api-key
GNEWS_API_KEY=your-gnews-api-key
WEBZ_API_KEY=your-webz-api-key
GOOGLE_WEB_RISK_API_KEY=your-web-risk-api-key

# Gemini/Vertex AI
GEMINI_API_KEY=your-gemini-api-key
VERTEX_AI_LOCATION=us-central1

# Agent Configuration
LOG_LEVEL=INFO
MAX_PARALLEL_REQUESTS=10
TIMEOUT_SECONDS=30
```

### 2. Agent Configuration Files

Each agent has its own configuration in `config/`:
- `processing_agent.yaml`
- `news_check_agent.yaml`
- `fact_check_agent.yaml`
- `scam_check_agent.yaml`
- `reporting_agent.yaml`

---

## 💻 Usage

### Running Locally

```bash
# Start the agent system
python main.py

# Or use ADK CLI
adk run processing_agent
```

### API Usage

```python
from agents.processing_agent import ProcessingAgent

# Initialize agent
agent = ProcessingAgent()

# Verify content
result = agent.verify({
    "content": "Breaking: Major event happened today",
    "type": "news",
    "source": "social_media"
})

print(result)
```

### Example Input/Output

**Input:**
```json
{
  "content": "Crime has doubled in the last 2 years",
  "type": "claim",
  "context": "Political debate"
}
```

**Output:**
```json
{
  "verdict": "False",
  "confidence": 0.92,
  "sources": [
    {
      "agent": "GoogleFactChecker",
      "verdict": "False",
      "url": "https://factcheck.example/crime-stats",
      "publisher": "FactCheck.org"
    },
    {
      "agent": "PerplexityAgent",
      "analysis": "Official crime statistics show...",
      "confidence": 0.89
    }
  ],
  "report": "The claim has been fact-checked and rated False..."
}
```

---

## 🗂️ Agent Structure

```
project/
├── agents/
│   ├── processing_agent/
│   │   ├── __init__.py
│   │   └── agent.py
│   ├── news_check_agent/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── news_api_agent.py
│   │   ├── google_fact_checker_agent.py
│   │   └── perplexity_agent.py
│   ├── fact_check_agent/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── google_fact_checker_agent.py
│   │   └── perplexity_agent.py
│   ├── scam_check_agent/
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── fake_sentiment_agent.py
│   │   ├── malicious_link_detector.py
│   │   └── perplexity_agent.py
│   └── reporting_agent/
│       ├── __init__.py
│       └── agent.py
├── config/
│   └── *.yaml
├── tests/
│   └── *.py
├── utils/
│   ├── api_clients.py
│   ├── aggregation.py
│   └── logging.py
├── .env
├── .env.example
├── Dockerfile
├── requirements.txt
├── main.py
└── README.md
```

---

## 🚢 Deployment

### Local Development
```bash
python main.py
```

### Docker
```bash
# Build image
docker build -t fact-verification-agent .

# Run container
docker run -p 8080:8080 --env-file .env fact-verification-agent
```

### Vertex AI Agent Engine
```bash
# Deploy to Vertex AI
gcloud ai agent-engines deploy \
  --agent-config=config/processing_agent.yaml \
  --region=us-central1
```

### Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy fact-verification-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🧪 Testing and Evaluation

### Unit Tests
```bash
pytest tests/
```

### Agent Evaluation
```bash
# Run built-in ADK evaluation
adk eval --agent processing_agent --testset tests/evalset.yaml
```

### Manual Testing
```bash
# Test individual agents
python -m agents.news_check_agent.agent --test
```

---

## 🔒 Security

- **API Key Management**: All keys stored in `.env` and environment variables
- **Service Accounts**: Read-only permissions for API access
- **Input Sanitization**: All user inputs validated and sanitized
- **Rate Limiting**: Configured per API to prevent abuse
- **Audit Logging**: All agent actions logged for traceability
- **Prompt Injection Protection**: Input filtering and validation layers

---

## 🛠️ Development

### Adding a New Sub-Agent

1. Create agent file in appropriate directory
2. Implement agent class inheriting from `BaseAgent`
3. Register in parent agent's configuration
4. Add tests in `tests/` directory
5. Update documentation

### Example Sub-Agent Template
```python
from google.adk.agents import BaseAgent

class CustomAgent(BaseAgent):
    def __init__(self, name="CustomAgent"):
        super().__init__(name=name)
        
    async def verify(self, content):
        # Your verification logic
        return result
```

---

## 📊 Monitoring and Logging

- **Structured Logging**: JSON format for parsing and analysis
- **Metrics**: Latency, success rate, confidence scores
- **Tracing**: Full execution path for debugging
- **Alerts**: Configured for failures and anomalies

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📚 Additional Resources

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Vertex AI Agent Engine](https://cloud.google.com/vertex-ai/docs/agents)
- [Google Fact Check Tools API](https://developers.google.com/fact-check/tools/api)
- [Best Practices for Agent Security](https://google.github.io/adk-docs/security/)

---

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Contact: your-email@example.com
- Documentation: [Wiki](https://github.com/your-org/fact-verification-agent/wiki)

---

**Built with ❤️ using Google Agent Development Kit**