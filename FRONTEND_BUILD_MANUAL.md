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
