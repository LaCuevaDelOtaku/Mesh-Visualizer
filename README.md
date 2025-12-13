
# GitHub Mesh Visualizer

A lightweight, browser-based application to visualize 3D mesh files (`.obj`, `.glb`, `.gltf`) directly from public GitHub repositories. 

Powered by **React**, **Three.js**, and **@react-three/fiber**.

![App Screenshot](https://via.placeholder.com/800x400?text=GitHub+Mesh+Visualizer+Preview)

## ✨ Features

- **Direct GitHub Integration**: Load repositories using standard HTTPS URLs or SSH style URLs (e.g., `git@github.com:user/repo.git`).
- **File Discovery**: Automatically scans the repository tree for supported 3D file formats.
- **Format Support**:
  - Wavefront (.obj)
  - GL Transmission Format (.gltf, .glb)
- **Interactive Viewer**:
  - Orbit controls (rotate, zoom, pan).
  - Dynamic lighting and shadows.
  - Infinite grid reference.
  - Performance statistics (FPS).

## 🚀 How to Run

Since this application uses ES Modules and `importmap`, it does not require a complex build step (like Webpack or a full Vite build) to run, but it **must** be served over HTTP/HTTPS to avoid CORS issues with module loading.

1. **Clone the repository** (or download the files).
2. **Serve the directory**:
   You can use any static file server. For example:
   
   Using Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node (http-server):
   ```bash
   npx http-server .
   ```
   
   Using VS Code:
   Install the "Live Server" extension and click "Go Live".

3. Open your browser at `http://localhost:8000`.

## 🛠 Technical Implementation & Version Management

This project uses a "Buildless" approach for dependencies, utilizing the browser's native **ES Modules** and an **Import Map** (`<script type="importmap">`) defined in `index.html`. This allows the application to run directly in the browser without a `node_modules` folder or a bundler output.

### Version Strategy

To ensure stability and compatibility between the 3D ecosystem libraries, specific versions are pinned via `esm.sh`:

#### 1. React (v18.2.0)
We explicitly pin React to **v18.2.0**.
*   **Reason**: While React 19 is available, the ecosystem for `@react-three/fiber` (R3F) is most stable on React 18.
*   **Implementation**: We map both `react` and `react/jsx-runtime`. 
    *   *Critical Fix*: Mapping `react/jsx-runtime` explicitly is necessary to solve `Uncaught TypeError: Failed to resolve module specifier "react/jsx-runtime"`. This ensures that when compiled JSX code tries to import the runtime, it receives the exact same version as the main React import.

```json
"react": "https://esm.sh/react@18.2.0",
"react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
"react-dom/client": "https://esm.sh/react-dom@18.2.0/client"
```

#### 2. Three.js (v0.164.1)
We use Three.js **v0.164.1**.
*   **Reason**: This version provides a balance of modern features and compatibility with the `OBJLoader` and `GLTFLoader` modules.
*   **Implementation**: We map both the core library and the specific loaders to the same version to avoid "multiple instances of Three.js" warnings, which can break textures and rendering context.

```json
"three": "https://esm.sh/three@0.164.1",
"three/examples/jsm/loaders/OBJLoader.js": "https://esm.sh/three@0.164.1/examples/jsm/loaders/OBJLoader.js"
```

#### 3. React Three Fiber & Drei
These libraries interact closely with the React reconciler. By using `esm.sh` with the `?external=react,react-dom,three` query parameter, we ensure they do not bundle their own copies of React or Three.js. Instead, they use the versions defined in our import map.

```json
"@react-three/fiber": "https://esm.sh/@react-three/fiber@8.16.6?external=react,react-dom,three",
"@react-three/drei": "https://esm.sh/@react-three/drei@9.105.6?external=react,react-dom,three,@react-three/fiber"
```

## 📝 License

MIT
