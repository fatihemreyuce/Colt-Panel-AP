# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Configuration Features

### 🚀 Development Server

- **Port**: Runs on `localhost:3000`
- **Hot Module Replacement**: Enabled for fast development
- **Host**: Configured to accept external connections

### 🔗 Path Aliases

- **@ imports**: Use `@/` to import from the `src/` directory
- **Examples**:
  ```typescript
  import { Button } from "@/components/Button";
  import { formatDate } from "@/utils/helpers";
  import { apiService } from "@/services/api";
  ```

### 🌐 API Proxy Configuration

- **Target**: `localhost:8080`
- **Path**: `/api/*` requests are proxied to `http://localhost:8080/api/*`
- **CORS**: Handled automatically by the proxy
- **Example API calls**:
  ```typescript
  // These will be proxied to localhost:8080
  fetch("/api/users");
  fetch("/api/users/123");
  ```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Button.tsx      # Example component with @ import
├── services/           # API services
│   └── api.ts         # API service with proxy examples
├── utils/             # Utility functions
│   └── helpers.ts     # Helper functions with @ import
├── App.tsx            # Main app with @ import demos
└── main.tsx           # Entry point
```

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Configuration Files

### vite.config.ts

- Development server configuration (port 3000)
- Path alias configuration (`@` → `src/`)
- Proxy configuration for localhost:8080

### tsconfig.app.json

- TypeScript path mapping for `@` imports
- Base URL configuration

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			// Other configs...

			// Remove tseslint.configs.recommended and replace with this
			...tseslint.configs.recommendedTypeChecked,
			// Alternatively, use this for stricter rules
			...tseslint.configs.strictTypeChecked,
			// Optionally, add this for stylistic rules
			...tseslint.configs.stylisticTypeChecked,

			// Other configs...
		],
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.node.json", "./tsconfig.app.json"],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			// Other configs...
			// Enable lint rules for React
			reactX.configs["recommended-typescript"],
			// Enable lint rules for React DOM
			reactDom.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.node.json", "./tsconfig.app.json"],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
]);
```
# admin-panel-base
