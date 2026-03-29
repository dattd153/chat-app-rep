const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'apps', 'web');

// Clean existing
if (fs.existsSync(ROOT)) {
  fs.rmSync(ROOT, { recursive: true, force: true });
}
fs.mkdirSync(ROOT, { recursive: true });

const pkgJson = `{
  "name": "web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "lucide-react": "^0.363.0",
    "zustand": "^4.5.2",
    "socket.io-client": "^4.7.5",
    "axios": "^1.6.8",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2",
    "@chat-app/shared": "*"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`;

const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;

const tsConfigNode = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`;

const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const baseCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}`;

const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

const appTsx = `function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Chat App Frontend initialized!</h1>
    </div>
  )
}

export default App;`;

const srcDirs = [
  'components/ui', 'components/chat', 'components/layout',
  'pages', 'hooks', 'store', 'services', 'sockets', 'utils', 'types', 'assets'
];

fs.writeFileSync(path.join(ROOT, 'package.json'), pkgJson);
fs.writeFileSync(path.join(ROOT, 'tsconfig.json'), tsConfig);
fs.writeFileSync(path.join(ROOT, 'tsconfig.node.json'), tsConfigNode);
fs.writeFileSync(path.join(ROOT, 'vite.config.ts'), viteConfig);
fs.writeFileSync(path.join(ROOT, 'tailwind.config.js'), tailwindConfig);
fs.writeFileSync(path.join(ROOT, 'postcss.config.js'), postcssConfig);
fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml);

const srcDir = path.join(ROOT, 'src');
fs.mkdirSync(srcDir, { recursive: true });
fs.writeFileSync(path.join(srcDir, 'index.css'), baseCSS);
fs.writeFileSync(path.join(srcDir, 'main.tsx'), mainTsx);
fs.writeFileSync(path.join(srcDir, 'App.tsx'), appTsx);

srcDirs.forEach(dir => {
  const dPath = path.join(srcDir, dir);
  fs.mkdirSync(dPath, { recursive: true });
  fs.writeFileSync(path.join(dPath, '.gitkeep'), '');
});

console.log('✅ React Web generated successfully');
