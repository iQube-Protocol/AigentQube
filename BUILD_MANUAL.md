# AigentQube Build Manual

## 1. Development Environment Setup

### 1.1 Prerequisites
- Python 3.13+
- pip
- virtualenv
- Node.js 16+
- npm
- MetaMask Browser Extension

### 1.2 Recommended Development Tools
- Visual Studio Code
- PyCharm Professional
- Docker Desktop
- Postman

## 2. Repository Cloning

```bash
git clone https://github.com/your-org/AigentQube.git
cd AigentQube
```

## 3. Python Environment Setup

### 3.1 Create Virtual Environment
```bash
python3 -m venv aigentqube_env
source aigentqube_env/bin/activate  # On macOS/Linux
# OR
aigentqube_env\Scripts\activate     # On Windows
```

### 3.2 Install Python Dependencies
```bash
pip install -r requirements.txt
```

## 4. Frontend Setup

### 4.1 Install Node Dependencies
```bash
npm install
npm install web3.js
```

### 4.2 Environment Configuration
```bash
cp .env.example .env
# Edit .env with your specific configurations
```

## 5. Blockchain Configuration

### 5.1 MetaMask Setup
1. Install MetaMask Browser Extension
2. Create a new wallet or import existing
3. Connect to Polygon Amoy Testnet
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency Symbol: MATIC

## 6. Database Initialization

### 6.1 DB-GPT Configuration
```bash
python -m dbgpt.setup
dbgpt init-database
```

### 6.2 AWEL Framework Setup
```bash
python -m awel.initialize
awel configure
```

## 7. Running the Application

### 7.1 Development Server
```bash
# Start backend
python app.py

# Start frontend (in separate terminal)
npm run start
```

### 7.2 Production Deployment
```bash
# Build frontend
npm run build

# Start production server
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

## 8. Testing

### 8.1 Run Unit Tests
```bash
pytest tests/
```

### 8.2 Run Integration Tests
```bash
pytest integration_tests/
```

## 9. Troubleshooting

### 9.1 Common Issues
- Ensure all dependencies are installed
- Check `.env` file configurations
- Verify MetaMask network settings
- Confirm Python and Node.js versions

### 9.2 Debugging
- Use `logging.basicConfig(level=logging.DEBUG)` for verbose logging
- Check browser console for frontend errors
- Review backend logs for server-side issues

## 10. Continuous Integration

### 10.1 GitHub Actions
- Automated testing on pull requests
- Build and deployment workflows
- Security scanning

## 11. Performance Optimization

### 11.1 Caching Strategies
- Implement Redis caching
- Use memoization for expensive computations
- Optimize database queries

## 12. Security Best Practices

### 12.1 Secrets Management
- Never commit sensitive information
- Use environment variables
- Rotate API keys and credentials regularly

## 13. Documentation

### 13.1 Generating Docs
```bash
sphinx-build -b html docs/ docs/_build
```

## 14. Contribution Guidelines

1. Create feature branch
2. Write tests
3. Implement feature
4. Run tests
5. Update documentation
6. Submit pull request

## 15. Version Management

Use semantic versioning:
- Major version: Significant architectural changes
- Minor version: New features, backwards compatible
- Patch version: Bug fixes and minor improvements

## 16. Monitoring and Logging

### 16.1 Recommended Tools
- Sentry for error tracking
- Prometheus for metrics
- ELK Stack for log management

## 17. Appendix

### 17.1 Recommended Reading
- Web3.js Documentation
- DB-GPT Guides
- AWEL Framework Specifications
- LangChain Best Practices

## 18. System Requirements

### 18.1 Hardware and Operating System
- Supported Platforms: macOS, Linux, Windows
- Minimum Python Version: 3.8+
- Recommended Python Version: 3.13+

### 18.2 Software Prerequisites
- Python 3.8 or higher
- Node.js 14+ (for web3 integration)
- Git
- pip
- virtualenv
- MetaMask Browser Extension (recommended)

### 18.3 Recommended Development Tools
- Visual Studio Code
- PyCharm Professional
- Docker Desktop
- Postman

## 19. Repository Setup

### 19.1 Clone Repository
```bash
git clone https://github.com/your-org/AigentQube.git
cd AigentQube
```

## 20. Python Environment Configuration

### 20.1 Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv aigentqube_env

# Activate environment
# On macOS/Linux
source aigentqube_env/bin/activate

# On Windows
aigentqube_env\Scripts\activate
```

### 20.2 Install Python Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install project dependencies
pip install -r requirements.txt
```

### 20.3 Required Python Packages
- Flask==2.0.1
- web3==7.6.1
- cryptography==44.0.0
- python-dotenv==1.0.0

## 21. Environment Configuration

### 21.1 Create Environment File
Create a `.env` file in the project root with the following configurations:
```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Blockchain Configuration
INFURA_PROJECT_ID=your-infura-project-id
CONTRACT_ADDRESS=your-contract-address
```

### 21.2 Blockchain Configuration
Configure blockchain settings in `config.py`:
```python
NETWORK_URL = f"https://sepolia.infura.io/v3/{INFURA_PROJECT_ID}"
CONTRACT_ABI_PATH = "contracts/TokenQube.json"
```

## 22. Frontend Setup

### 22.1 Install Node Dependencies
```bash
# Install frontend dependencies
npm install
npm install web3.js
```

### 22.2 Environment Configuration
```bash
# Copy example environment file
cp .env.example .env
```

## 23. Development Workflow

### 23.1 Running the Application
```bash
# Start Flask development server
flask run

# OR
python app.py
```

### 23.2 Running Tests
```bash
# Run unit tests
pytest tests/

# Run integration tests
pytest tests/integration
```

## 24. Deployment Considerations

### 24.1 Production Environment
- Use gunicorn or uWSGI for production
- Configure proper environment variables
- Set `FLASK_ENV=production`
- Use a production-grade web server

### 24.2 Docker Deployment
```bash
# Build Docker image
docker build -t aigentqube .

# Run Docker container
docker run -p 5000:5000 aigentqube
```

## 25. Troubleshooting

### 25.1 Common Issues
- Ensure all dependencies are installed
- Check Python and Node.js versions
- Verify `.env` file configurations
- Restart virtual environment if dependencies fail

### 25.2 Logging
- Check application logs for detailed error information
- Use `logging` module for tracking issues

## 26. Contributing

### 26.1 Code Style
- Follow PEP 8 guidelines
- Use type hints
- Write comprehensive docstrings

### 26.2 Pull Request Process
- Fork the repository
- Create a feature branch
- Submit pull request with detailed description

## 27. License and Acknowledgments
- Review LICENSE file in the repository
- Acknowledge all third-party libraries used

**Last Updated**: 2025-01-03
**Version**: 1.0.0
