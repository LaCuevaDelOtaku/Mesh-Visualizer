# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-05-20

### Added
- **GitHub Integration**: Direct loading of public repositories via HTTPS or SSH URLs.
- **File Discovery**: Recursive scanning of repository trees for `.obj`, `.glb`, and `.gltf` files.
- **Interactive 3D Viewer**:
  - Orbit controls (Zoom, Pan, Rotate).
  - Environment lighting presets (Studio, City, Sunset, Dawn).
  - Wireframe mode toggle.
  - Infinite grid toggle.
  - Contact shadows.
- **Repo History**: Persistent local storage of recently accessed repositories.
- **UI/UX**: 
  - Metallic/Industrial dark theme.
  - Responsive layout with sidebar file list.
  - Loading states and error handling.

### Changed
- Migrated visual theme from Indigo to Zinc/Metallic.
- Optimized lighting setup with HDRI and directional key lights.

### Fixed
- Addressed CORS issues by using `esm.sh` for dependencies.
- Fixed React 18/19 compatibility issues in import maps.