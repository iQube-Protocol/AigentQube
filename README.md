# AigentQube: Contextual Intelligence Agent Framework

## Technical Foundation: iQube Protocol

AigentQube introduces a new class of context and risk intelligent agents underpinned by the iQube protocol.

### Core Vision

To create a unified, secure, and adaptive framework that revolutionizes how intelligence systems understand, process, and interact with complex information landscapes. Our mission is to create an agent ecosystem that prioritizes:
- Comprehensive risk and value analysis
- Dynamic semantic context generation
- Secure and verifiable data interactions


### Key Technologies

- **iQubes**: Reliable and verifiable decentralized information assets
- **Smart Agents**: Intelligent, context-aware autonomous agents
- **LangChain**: Advanced natural language understanding
- **DB-GPT**: Semantic database querying and analysis
- **AWEL**: Adaptive Workflow Execution Layer

### Architectural Model

1. **Context Layer**
   - Driven by iQube and blakQube content
   - Dynamic context generation
   - Retrieval Augmented Generation (RAG)
   - Web search and information aggregation

2. **Service Layer**
   - API integration and service discovery
   - Wallet and blockchain interactions
   - CRUD operations management

3. **State Layer**
   - Blockchain-backed state persistence
   - Immutable transaction logging
   - Agent memory management
  
## Technologies:

### 1. Blockchains
- Robust data encapsulation
- Cryptographic information management
- Decentralized governance
- Verifiable risk assessment
- Immutavle programmability 

### 2. Smart Agents
- Context-aware decision making
- Dynamic intelligence generation
- Adaptive reasoning capabilities

### 3. Machine Reasoning
- Multi-model and multi-modal inference and automation
- Complex prompt engineering
- Advanced natural language and non-linguistic processing

### 4. Semantic Intelligence
- Semantic context vectorization
- Natural language query processing
- Advanced database interaction

### 5. Workflow Orchestration
- Dynamic service composition
- Granular task management
- Fault-tolerant execution

## iQube Components

## Primitives
1. **MetaQube**: Public, verifiable metadata
2. **BlakQube**: Private, encrypted data
3. **TokenQube**: Token-gated data decryption and access

## Types
1. **DataQube**: Alpha-numeric data representation
2. **ContentQube**: Multi-modal content (blob) representation
3. **AgentQube**: AI agent performance and complaince tracking

## Project Overview
AigentQube is an advanced AI-powered contextual intelligence platform that dynamically adapts to user contexts, providing personalized, intelligent interactions.

## Key Features
- Dynamic Contextual Intelligence
- Payload-Driven Agent Transformation
- Secure iQube Memory Management
- Adaptive Interaction Model

## Technical Architecture
- Contextual Intelligence Engine
- BlakQube Payload Integration
- TokenQube Retrieval
- Personalized Interaction Mechanisms

## Design Principles
- Adaptive Intelligence
- Transparent Transformation
- Contextual Depth
- User Privacy
- Secure Data Management

## Quick Start

### Prerequisites
- **Python 3.11.7** (Strongly Recommended)
  - Performance optimizations
  - Stable library compatibility
  - Enhanced type hinting
- Web3-compatible wallet
- Ethereum-compatible blockchain access

### Installation

```bash
# Clone the repository
git clone https://github.com/your-organization/AigentQube.git
cd AigentQube

# Create virtual environment
python3.11 -m venv aigentqube_env
source aigentqube_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

```bash
# Copy example configuration
cp config.example.yml config.yml

# Edit configuration with your settings
vim config.yml
```

### Running the Application

```bash
# Start web interface
python run_web_interface.py

# Run tests
pytest tests/
```

## AigentQube Web Dashboard

## Prerequisites
- **Python 3.11.7** (Strongly Recommended)
  - Performance optimizations
  - Stable library compatibility
  - Enhanced type hinting
- pip
- virtualenv

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/YourUsername/AigentQube.git
cd AigentQube
```

2. Create and Activate Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
```

3. Install Dependencies
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

4. Run Development Server
```bash
# Using the provided start script
./start_dev_server.sh

# Or manually
python3 web_dashboard.py
```

## Prototype Version 0.1.0

### Project Overview
AigentQube is a revolutionary decentralized AI agent framework that integrates advanced contextual intelligence, blockchain-backed state management, and tokenized information access.

### Key Features
- FastAPI-based backend
- WebSocket real-time agent monitoring
- Blockchain integration (Sepolia Testnet)
- Structured logging
- iQube token creation and management

### Prerequisites
- Python 3.13+
- Node.js 16+
- MetaMask Browser Extension
- Sepolia Testnet Wallet

### Setup Instructions

1. Clone the Repository
```bash
git clone https://github.com/your-org/AigentQube.git
cd AigentQube
```

2. Create Virtual Environment
```bash
python3 -m venv aigentqube_env
source aigentqube_env/bin/activate
```

3. Install Dependencies
```bash
pip install -r requirements.txt
```

4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your blockchain credentials
```

5. Run Backend
```bash
uvicorn src.backend.main:app --reload
```

### Development Roadmap
- [ ] Complete blockchain integration
- [ ] Develop frontend dashboard
- [ ] Implement AI agent context management
- [ ] Add comprehensive testing

### Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.

## Troubleshooting

### PyTorch Installation
If you encounter issues installing PyTorch, try:
```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### Virtual Environment
- Ensure you're using Python 3.11.7
- Always activate the virtual environment before running the project

## Troubleshooting Common Installation Issues

### Python Version Compatibility
- Ensure you're using Python 3.11.7
- Avoid using Python 3.12+ and Python 3.9-

### Dependency Installation
If you encounter issues installing dependencies:

1. Upgrade pip and setuptools:
```bash
pip install --upgrade pip setuptools wheel
```

2. Install PyTorch separately:
```bash
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

3. Install dependencies with verbose output:
```bash
pip install -r requirements.txt -v
```

### Common Error Resolutions

#### ModuleNotFoundError
- Ensure you're in the virtual environment
- Verify all dependencies are installed
- Check that the virtual environment uses the correct Python version

#### Gevent/Cython Compilation Errors
- Install build dependencies:
```bash
pip install cython
pip install --no-cache-dir gevent
```

#### Socket.IO and Flask-SocketIO Issues
- Ensure compatible versions of flask-socketio and python-socketio
- Try reinstalling:
```bash
pip uninstall flask-socketio python-socketio
pip install flask-socketio python-socketio
```

### Manual Dependency Check
```bash
python3.11 -m pip list  # Check installed packages
python3.11 -c "import flask; import flask_socketio; print('Imports successful')"
```

If problems persist, please open an issue with:
- Your Python version
- Full error traceback
- Operating system details

## Features
- Real-time Agent Dashboard
- WebSocket-based Updates
- Natural Language Chatbot Interface
- Blockchain and iQube Processing Monitoring

## Security Principles

- Minimum disclosure by default
- Network level anonymity with contextually dynamic application level identifiability
- Contextually dynamic encryption and access control
- Risk driven rules and context assessment
- Quantum readiness

## Security Tools

- Zero-knowledge encryption
- Homomorphic encryption support
- Multi-party computation
- Differential Privacy
- Comprehensive risk assessment

## Performance Characteristics

- Microservices architecture
- Horizontal scaling
- Event-driven design
- Adaptive resource allocation

## Future Roadmap

- Expanded multi-modal support
- Enhanced cross-agent collaboration
- Advanced predictive intelligence
- Decentralized AI governance models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Write comprehensive tests
5. Submit pull request

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

[Specify your licensing model]

## Contact

- Project Lead: [Your Name]
- Community: [Discord/Slack Link]
- Support: [Email/Support Channel]

---

**Note**: This is a living project. We encourage collaborative improvement and innovation.

## Recommended Python Version

- **Python 3.11.7** (Strongly Recommended)
  - Performance optimizations
  - Stable library compatibility
  - Enhanced type hinting

### Version Compatibility
- Minimum supported version: Python 3.10
- Maximum supported version: Python 3.11.x
- **Avoid Python 3.12+ and Python 3.9-**

### Installation Options

#### macOS
1. Download Python 3.11.7 from [python.org](https://www.python.org/downloads/release/python-3117/)
2. Use [Homebrew](https://brew.sh/):
```bash
brew install python@3.11
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install python3.11 python3.11-venv python3.11-dev

# Fedora
sudo dnf install python3.11 python3.11-devel
```

#### Windows
1. Download Python 3.11.7 installer from [python.org](https://www.python.org/downloads/release/python-3117/)
2. Ensure "Add Python to PATH" is checked during installation

## Version Verification

```bash
# Check Python version
python3.11 --version

# Verify pip
python3.11 -m pip --version
```

## Troubleshooting Python Version

### Multiple Python Versions
If you have multiple Python versions:
- Use `pyenv` for version management
- Create virtual environments with specific Python versions

### Virtual Environment Best Practices
```bash
# Create virtual environment with specific Python version
python3.11 -m venv venv
source venv/bin/activate
```

### Potential Compatibility Issues
- Some libraries may have specific version constraints
- Always check library documentation for Python version support
- Use `pip list` to verify installed package versions

## Recommended Development Environment
- IDE: Visual Studio Code
- Extensions: 
  - Python
  - Pylance
  - Python Test Explorer
- Linters: 
  - Flake8
  - Black
  - MyPy

**Version**: 0.1.0
**Last Updated**: 2025-01-03
