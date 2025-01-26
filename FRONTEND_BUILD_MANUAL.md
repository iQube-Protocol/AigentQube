# AigentQube Frontend Build Manual

## Project Overview
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Integration**: Web3.js
- **HTTP Requests**: Axios

## Prerequisite Installations
1. Node.js (v16+ recommended)
2. npm (v8+ recommended)
3. Web3 wallet (MetaMask preferred)

## Detailed Setup Process

### 1. Project Initialization Challenges and Solutions

#### Common Initialization Errors
- **Error**: Module resolution issues
- **Symptoms**: 
  - Cannot find module './App'
  - Webpack configuration problems
- **Root Causes**:
  1. Case-sensitivity in file imports
  2. Incorrect webpack configuration
  3. Symlink or path resolution issues

#### Definitive Solution Steps
1. **File Naming Convention**
   - Use exact case matching for imports
   - Prefer `app.tsx` over `App.tsx`
   - Ensure import statements match exact filename

2. **Webpack Configuration**
   ```javascript
   // In tailwind.config.js
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     // ... other configurations
   }
   ```

3. **Dependency Management**
   - Always use `npm install` with clean cache
   - Remove `node_modules` and reinstall if persistent issues
   ```bash
   npm cache clean -f
   rm -rf node_modules
   npm install
   ```

### 2. Project Structure

```
aigentqube-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── app.tsx           # Main React component
│   ├── index.tsx         # Entry point
│   └── index.css         # Tailwind and global styles
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### 3. Key Configuration Files

#### package.json
- Ensure these key dependencies are present:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5",
    "web3": "^4.3.0",
    "axios": "^1.6.3",
    "tailwindcss": "^3.4.0"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### 4. Troubleshooting Checklist

#### Common Debugging Steps
1. Verify file case-sensitivity
2. Check import statements
3. Clean npm cache
4. Reinstall dependencies
5. Verify webpack/tailwind configurations

#### Potential Pitfalls
- Mixing uppercase and lowercase filenames
- Incorrect import paths
- Outdated dependency versions
- Incomplete webpack content configuration

### 5. Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### 6. Deployment Considerations
- Use `npm run build` to create production build
- Configure environment-specific variables
- Ensure Web3 wallet compatibility

### 7. Known Limitations
- Requires backend API for full functionality
- Dependent on Web3 wallet injection
- Potential cross-browser compatibility issues

## Agent Specialization and Context Transformation

### Specialized Agent Domains

AigentQube now supports four specialized agent domains, each with unique capabilities and tailored interaction strategies:

1. **Financial Advisor** 💰
   - Focus: Investment strategy, financial planning, and risk management
   - Key Capabilities:
     - Portfolio optimization
     - Risk assessment
     - Retirement planning
     - Tax strategy development
     - Investment diversification

2. **Tech Consultant** 💻
   - Focus: Technology innovation and digital transformation
   - Key Capabilities:
     - Emerging technology trend analysis
     - Digital transformation assessment
     - Cloud migration strategies
     - Cybersecurity evaluation
     - AI integration roadmapping

3. **Crypto Analyst** ₿
   - Focus: Cryptocurrency and blockchain technology
   - Key Capabilities:
     - Crypto market trend analysis
     - Blockchain innovation assessment
     - Cryptocurrency investment strategies
     - DeFi opportunity evaluation
     - Regulatory landscape understanding

4. **Agentic AI Advisor** 🤖
   - Focus: AI system design and ethical AI development
   - Key Capabilities:
     - AI agent workflow design
     - AI interaction protocol development
     - Ethical AI framework assessment
     - AI learning strategy optimization
     - Multi-agent collaboration planning

### Context Transformation Mechanism

#### Dynamic Prompt Generation
The Context Transformation Panel now generates user-friendly, conversational prompts tailored to each specialized domain. These prompts are designed to:
- Provide clear, actionable guidance
- Adapt to user-specific contexts
- Facilitate more natural AI interactions

#### Recommended Actions
Each specialized domain offers five key recommended actions, presented as intuitive, user-centric prompts. Users can:
- View detailed recommendations
- Insert prompts directly into the chat interface
- Customize and refine AI interactions

### Technical Implementation

#### State Management
```typescript
interface AgentContext {
  baseState: 'Generic AI' | 'Personalized AI';
  specializedState: string;
  iQubeDetails?: IQubeDetails;
}

interface DomainRecommendation {
  action: string;
  prompt: string;
}
```

#### Interaction Flow
1. User selects a specialized agent domain
2. Context is dynamically transformed
3. Recommended actions are updated
4. AI adapts interaction style and capabilities

### Best Practices
- Leverage domain-specific expertise
- Maintain flexible, adaptive AI interactions
- Ensure ethical and responsible AI development

### Recommended Development Workflow
1. Clean install dependencies
2. Verify import paths
3. Check TypeScript configuration
4. Run with verbose logging
5. Test wallet connection
6. Implement comprehensive error handling

## Troubleshooting Specific Frontend Issues

### Module and Type Resolution Challenges

#### Symptom 1: TypeScript Import and Module Resolution Errors

**Problem Scenarios**:
1. Case-sensitivity in file imports
2. Incorrect file extensions
3. Missing type declarations
4. Webpack/TypeScript configuration issues

**Detailed Troubleshooting Steps**:

##### 1. File Naming and Import Conventions
- Use lowercase for component files (e.g., `app.tsx` instead of `App.tsx`)
- Avoid explicit file extensions in imports
- Maintain consistent casing across import statements and file system

**Example of Correct Import**:
```typescript
// Incorrect
import App from './App.tsx';

// Correct
import App from './app';
```

##### 2. TypeScript Type Declaration Management
- Install comprehensive type declaration packages
- Update `tsconfig.json` to include necessary type libraries

**Recommended Dev Dependencies**:
```bash
npm install -D @types/jest @types/node @types/react @types/react-dom @types/testing-library__jest-dom
```

**tsconfig.json Configuration**:
```json
{
  "compilerOptions": {
    "types": [
      "jest",
      "node",
      "@testing-library/jest-dom"
    ]
  }
}
```

##### 3. Testing Library Type Resolution
- Import `@testing-library/jest-dom/extend-expect` in test files
- Ensure type declarations are correctly installed

**Test File Setup**:
```typescript
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
```

#### Symptom 2: Development Server Connection Issues

**Common Causes**:
- Blocked port 3000
- Stale node processes
- Dependency conflicts

**Troubleshooting Workflow**:
1. Kill existing node processes
```bash
killall -9 node
```

2. Clear npm cache
```bash
npm cache clean -f
```

3. Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

4. Restart development server
```bash
npm start
```

#### Dependency Management Best Practices

##### Version Consistency
- Regularly update dependencies
- Use `npm audit fix` to address vulnerabilities
- Pin specific versions in `package.json`

##### Recommended Dependency Versions
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^4.9.5",
    "web3": "^1.10.2"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "tailwindcss": "^3.3.5"
  }
}
```

#### Performance and Optimization Tips
- Use React development tools
- Enable source maps
- Monitor bundle size
- Implement code splitting

#### Security Considerations
- Keep dependencies updated
- Use `npm audit` regularly
- Be cautious with external packages
- Implement proper error boundaries

### Debugging Checklist
1. ✅ Verify file naming conventions
2. ✅ Check import statements
3. ✅ Validate type declarations
4. ✅ Ensure dependency compatibility
5. ✅ Clear cache and reinstall dependencies
6. ✅ Restart development server

### Common Error Resolution Patterns
- Type declaration issues → Install @types packages
- Import errors → Standardize file naming
- Server connection problems → Kill node processes
- Dependency conflicts → Clean install

### Recommended Development Environment
- Node.js LTS
- npm 8.x or higher
- Latest stable React and TypeScript versions
- Visual Studio Code with ESLint and Prettier extensions

## Troubleshooting Common Setup Issues

### Module Resolution Challenges

#### Symptom 1: Cannot Find Module './App'
**Problem**: TypeScript and React were unable to resolve the App component import.

**Root Causes**:
- Case-sensitivity in file imports
- Incorrect file extension
- Webpack configuration issues

**Solution Steps**:
1. **Import Correction**
   ```typescript
   // Incorrect
   import App from './App.tsx';
   
   // Correct
   import App from './app';
   ```

2. **File Naming Convention**
   - Use lowercase for component files
   - Avoid explicit `.tsx` extension in imports
   - Ensure consistent naming across import statements and file system

3. **TypeScript Configuration**
   Update `tsconfig.json` to improve module resolution:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true
     }
   }
   ```

#### Symptom 2: Port Conflicts
**Problem**: Development server unable to start due to port 3000 being in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]
```

### Dependency Management

#### Common Dependency Issues
- Ensure all dependencies are correctly installed
- Remove `node_modules` and reinstall if persistent problems
```bash
npm cache clean -f
rm -rf node_modules
npm install
```

### Web3 Wallet Connection Considerations

#### Initialization Challenges
- Always wrap Web3 initialization in try-catch
- Provide fallback for users without MetaMask
- Handle different wallet connection scenarios

```typescript
useEffect(() => {
  const initWeb3 = async () => {
    if ((window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Create Web3 instance
        const web3Instance = new Web3((window as any).ethereum);
        
        // Get connected wallet address
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Web3 Initialization Failed", error);
      }
    }
  };
  
  initWeb3();
}, []);

### Performance and Security Notes
- Always use environment-specific configurations
- Implement proper error handling
- Use TypeScript for type safety
- Keep dependencies updated

### Recommended Development Workflow
1. Clean install dependencies
2. Verify import paths
3. Check TypeScript configuration
4. Run with verbose logging
5. Test wallet connection
6. Implement comprehensive error handling

## Version Compatibility
- **React**: ^18.2.0
- **TypeScript**: ^4.9.5
- **Web3.js**: ^4.3.0
- **Tailwind CSS**: ^3.4.0

**Last Updated**: 2025-01-04
**Build Stability**: Stable

## Recommended Next Steps
1. Implement comprehensive error handling
2. Add unit and integration tests
3. Create mock API for development
4. Enhance Web3 wallet connection logic

## Contribution Guidelines
- Follow TypeScript strict mode
- Use meaningful variable names
- Write comprehensive comments
- Maintain consistent code formatting

## Technical Challenges and Resolutions

#### Duplicate Agent Evolution Module
**Challenge**: Multiple instances of the AgentEvolutionPanel were appearing on the page, causing UI redundancy and potential state management issues.

**Resolution**:
- Removed duplicate AgentEvolutionPanel from `app.tsx`
- Updated `DashboardLayout` to manage a single instance of the panel
- Ensured consistent placement in the sidebar

**Code Changes**:
```typescript
// In DashboardLayout.tsx
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  context, 
  onContextChange, 
  agentId 
}) => {
  // Added default handler to prevent TypeScript errors
  const handleContextChange = onContextChange || ((context: any) => {});

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <AgentEvolutionPanel 
          context={context}
          onContextChange={handleContextChange}
          agentId={agentId || undefined}
        />
      </div>
      {/* Rest of the layout */}
    </div>
  );
};
```

#### TypeScript Prop Type Incompatibility
**Challenge**: TypeScript type errors with optional props, specifically with `agentId` and `onContextChange`.

**Specific Errors**:
1. `Type 'string | null' is not assignable to type 'string | undefined'`
2. `Type '((context: any) => void) | undefined' is not assignable to type '(context: any) => void'`

**Resolution**:
- Used optional chaining and nullish coalescing
- Implemented a default no-op function for `onContextChange`
- Explicitly handled `null` and `undefined` cases

**Code Example**:
```typescript
// Handling potentially null agentId
agentId={agentId || undefined}

// Providing a default function to prevent type errors
const handleContextChange = onContextChange || ((context: any) => {});
```

#### Domain Specialization Refinement
**Challenge**: Initial domain specialization felt too technical and impersonal.

**Resolution**:
- Renamed domains to be more intuitive
  - "Healthcare Analyst" → "Crypto Analyst"
  - "Legal Assistant" → "Agentic AI Advisor"
- Rewrote recommendation prompts to be more conversational
- Added user-friendly, context-specific action descriptions

**Example of Prompt Transformation**:
```typescript
// Before
action: 'Optimize Investment Portfolio'
prompt: 'Analyze current investment portfolio...'

// After
action: 'Help Me Optimize My Investment Portfolio'
prompt: 'I want to improve my investment strategy. Can you help me analyze my current portfolio...'
```

#### Context Management Improvements
**Challenge**: Inconsistent context handling across components.

**Resolution**:
- Standardized `AgentContext` interface
- Implemented consistent context transformation logic
- Added more robust state management

**Interface Definition**:
```typescript
interface AgentContext {
  baseState: 'Generic AI' | 'Personalized AI';
  specializedState: string;
  iQubeDetails?: IQubeDetails;
}
```

### Lessons Learned
- Always use TypeScript's strict mode to catch type-related issues early
- Design UI components with flexibility and reusability in mind
- Focus on user-centric language and interactions
- Implement comprehensive error handling and default states

### Performance Considerations
- Minimal overhead from context transformation
- Lazy loading of domain-specific capabilities
- Efficient state management through React hooks

**Debugging Tips**:
- Use console logging during development
- Leverage TypeScript's type checking
- Implement comprehensive error boundaries
- Use React DevTools for state inspection

**Known Limitations**:
- Current implementation supports four specialized domains
- Context transformation is primarily frontend-driven
- Requires backend support for full feature implementation

**Recommended Next Steps**:
- Implement more granular domain specializations
- Develop backend logic for context-aware interactions
- Create more sophisticated prompt generation mechanisms
- Enhance multi-agent collaboration features

## Troubleshooting Common Restoration Issues

### Environment Variable Conflicts
One of the most critical issues when restoring the application is handling environment variable conflicts. If you encounter a blank page after restoration:

1. Check for duplicate environment variables in `.env`:
   ```plaintext
   # Common Issue: Duplicate API keys
   REACT_APP_OPENAI_API_KEY="actual-key-here"
   REACT_APP_OPENAI_API_KEY=placeholder-value  # Remove this duplicate
   ```

2. Ensure only one instance of each environment variable exists:
   - REACT_APP_OPENAI_API_KEY
   - REACT_APP_METIS_API_KEY
   - REACT_APP_API_BASE_URL

### Webpack and Build Issues
If encountering `Module not found` errors or blank pages:

1. Clean existing build artifacts:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean -f
   ```

2. Install dependencies with specific versions:
   ```bash
   npm install react@18.2.0 react-dom@18.2.0 typescript@4.9.5 --save-exact
   npm install @types/react@18.2.45 @types/react-dom@18.2.18 --save-dev --save-exact
   ```

3. Install necessary webpack polyfills:
   ```bash
   npm install --save-dev crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process
   ```

### File Casing Issues
React and webpack can be sensitive to file casing. Ensure consistent casing:

1. Use lowercase for component files:
   - Rename `App.tsx` to `app.tsx`
   - Update imports in `index.tsx` accordingly

### Cache Clearing
If changes aren't reflecting:

1. Clear npm cache:
   ```bash
   npm cache clean -f
   ```

2. Clear React cache:
   ```bash
   rm -rf node_modules/.cache
   ```

3. Clear browser cache:
   - Firefox: Open DevTools (F12) -> Storage -> Clear Storage
   - Or perform a hard reload (Command+Shift+R)

### Complete Restoration Process
Follow these steps in order when restoring the application:

1. Clean environment:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean -f
   ```

2. Verify .env configuration:
   - Remove duplicate entries
   - Ensure API keys are properly set
   - Verify API endpoints

3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Start development server:
   ```bash
   BROWSER=firefox npm start
   ```

5. If blank page appears:
   - Check browser console for errors
   - Verify environment variables
   - Clear browser cache
   - Restart development server

### Prevention Strategies
To prevent these issues in future restorations:

1. Maintain a clean .env template
2. Use exact versions in package.json
3. Document API key requirements
4. Keep consistent file naming conventions
