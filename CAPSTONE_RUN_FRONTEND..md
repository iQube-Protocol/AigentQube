For the Capstone Team, Dele's notes on how to run the frontend. 

### Installation

Clone the staging branch
```bash
git clone -b staging https://github.com/iQube-Protocol/AigentQube.git .
```

If you cloned the entire repo just switch to the staging branch. 
```bash
git checkout staging
```

If you have already tried to run the frontend you may need to cleanup the current build
```bash
rm -rf src/frontend/aigentqube-dashboard/node_modules
rm -rf src/frontend/aigentqube-dashboard/.vite
rm -rf src/frontend/aigentqube-dashboard/dist
rm -f src/frontend/aigentqube-dashboard/package-lock.json
```

Navigate to the dashboard directory
```bash
cd src/frontend/aigentqube-dashboard
```

Update the port to 3001 in package.json (will deploy to http://localhost:3001/)
```bash
sed -i '' 's/"start": "react-scripts start"/"start": "PORT=3001 react-scripts start"/' package.json
```

Install Dependencies
```bash
npm install --legacy-peer-deps
```

Next, make sure you are in the right directory 
(cd /Users/hal1/Desktop/CascadeProjects/AigentQube-Staging/src/frontend/aigentqube-dashboard)

Create/update the .env file with the configuration we had earlier: (Copy the entire text into terminal) (Will provide in email)


Run the Development server (will deploy to http://localhost:3001/)
```bash
npm run start
```

## Troubleshooting

If you encounter errors that prevent the development server from deploying (this happened to me because a dependency was missing or incorrect)

Delete and Reinstall node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

Try again to run the Development server
```bash
npm run start
```