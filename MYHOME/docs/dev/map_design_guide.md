# Hexagonal Map Implementation Standards

## Core Layout
*   **Orientation**: **Pointy Topped** (Points up/down, flat sides left/right).
*   **Coordinate System**: **Odd-R** (Odd rows are shifted right).
*   **Math**:
    *   `Hex Width` = `sqrt(3) * size`
    *   `Hex Height` = `2 * size`
    *   `Horizontal Spacing` = `Hex Width`
    *   `Vertical Spacing` = `1.5 * size`

## Geometry & Rendering
### 2D Shape Generation
When generating a `THREE.Shape` for a hexagon:
1.  **Start Angle**: `Math.PI / 6` (30 degrees).
2.  **Effect**: This creates a **Pointy Topped** hexagon shape directly.
3.  **Rotation Rule**: **DO NOT rotate** the mesh around the Z-axis. The generated shape is already correctly oriented.
    *   `mesh.rotation.x = -Math.PI / 2` (To lay flat on ground)
    *   `mesh.rotation.z = 0` (CORRECT)
    *   `mesh.rotation.z = Math.PI / 6` (WRONG - causes overlaps)

### 3D Extrusion
*   Use `THREE.ExtrudeGeometry` with the *same* 2D shape.
*   **Bevels**: Enabled for visual quality.
*   **Radius**: Use `size * 0.98` or similar to create clean gaps if bevels cause "inflation", or rely on `gap` logic in 2D.

## Reference
*   **Grid Logic**: See `MapGenerator.ts`.
*   **Rendering Logic**: See `WorldMapScene.ts`.
