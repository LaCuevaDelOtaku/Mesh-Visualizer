# Project Roadmap & Enhancements

## 🎨 Visual & UX Overhaul
- [ ] **1. Theme Overhaul (Metallic/Industrial)**
    - Replace the current "blue/indigo" palette with a "Metallic Black, Grey, White" aesthetic.
    - Goal: A cleaner, professional, "Cooler" look suitable for portfolio showcasing.
- [ ] **2. Environment & Studio Lighting (HDRI)**
    - Implement Image-Based Lighting (IBL) using `<Environment />`.
    - Allow switching between Studio, City, and Outdoor lighting.
- [ ] **3. Persistent Repo History**
    - Automatically save entered repository links to local storage.
    - Create a "Quick Load" sidebar for favorites (e.g., `MrKaizen7/meshes`).
- [ ] **4. Deep Linking & State Sharing**
    - Sync state to URL parameters (e.g., `?repo=...&file=...`).
    - Enable sharing exact views via link.

## 🛠 3D Viewer Capabilities
- [ ] **5. Animation Support**
    - Auto-detect animations in GLB/GLTF files.
    - Add playback controls (Play, Pause, Scrub, Clip Selection).
- [ ] **6. Model Transform Controls (Gizmos)**
    - Add `<TransformControls>` to allow users to Move, Rotate, and Scale the model manually.
- [ ] **7. Mesh Inspection Modes**
    - Toggle materials: Wireframe, Normal Map, UV Grid.
    - Inspect topology and shading artifacts.
- [ ] **8. Multi-File / Sidecar Support**
    - Support loading `.obj` + `.mtl` + textures simultaneously.
- [ ] **9. Composition Mode**
    - **Major Feature**: Allow loading multiple meshes onto the same canvas.
    - Requires refactoring state from `selectedFile` to `sceneObjects[]`.
- [ ] **10. Scene Graph Explorer**
    - Visualize the hierarchy of the 3D file (nodes, groups, meshes).
    - Toggle visibility of specific sub-parts.

## ⚙️ Core Functionality
- [ ] **11. Capture Tool V2 (Video)**
    - Extend screenshot functionality to support recording video (WebM/MP4) of the canvas interaction.
- [ ] **12. Snapshot / Screenshot Tool**
    - Quick button to download a high-res PNG of the current view.
- [ ] **13. GitHub Authentication**
    - Add OAuth or Token input to increase API rate limits.
    - Enable access to Private Repositories.
- [ ] **14. Drag-and-Drop Local Fallback**
    - Support dropping local files directly onto the canvas for quick preview.

## 🏗 Refactoring Tasks
- [ ] **Modularize MeshViewer**: Split into `Lighting`, `Controls`, and `Model` sub-components.
- [ ] **Global State**: Move from local `useState` to a Context or Store to handle Composition Mode.
