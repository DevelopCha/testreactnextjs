import Phaser from 'phaser';
import * as THREE from 'three';
import { MapGenerator } from '../systems/MapGenerator';
import { BaseTerrain, FeatureType, BuildingType, TileData, ResourceType } from '../systems/MapTypes';
import { CharacterManager } from '../systems/CharacterManager';
import { Character } from '../systems/CharacterFactory';
import { ThreeSystem } from '../systems/ThreeSystem';
import { ConfigLoader } from '../systems/ConfigLoader';
import { SkySystem } from '../systems/SkySystem';
import { TurnManager } from '../systems/TurnManager';

export class WorldMapScene extends Phaser.Scene {
    // 120x80 = 9600 tiles. Dense Globe.
    private mapWidth: number = 120;
    private mapHeight: number = 80;
    private mapData: TileData[][] = [];
    private characters: Character[] = [];
    private mapGenerator?: MapGenerator; // Added property
    private skySystem?: SkySystem;


    // Three.js objects references
    private terrainGroup: THREE.Group = new THREE.Group();
    private characterGroup: THREE.Group = new THREE.Group();
    private textGroup: THREE.Group = new THREE.Group();

    // Configuration
    private terrainConfig: Record<string, { texture?: THREE.Texture, color: number }> = {};
    private resourceConfig: Record<string, { texture?: THREE.Texture, name: string }> = {};


    // ===================================
    // MAP DESIGN STANDARDS
    // Orientation: Pointy Topped
    // Coordinates: Odd-R
    // ===================================

    constructor() {
        super('WorldMapScene');
    }

    preload() {
        this.load.image('unit_hero', '/assets/unit_hero.png');
    }

    create() {
        console.log("[WorldMapScene] create() START");
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

        const width = this.scale.width;
        const height = this.scale.height;

        // Init 3D
        const three = ThreeSystem.getInstance();
        three.init(width, height);
        three.resetScene();

        // Adjust Camera to see Globe
        three.camera.position.set(0, 0, 400); // Orbit radius ~400
        three.camera.lookAt(0, 0, 0);

        // Zoom Control
        if (three.controls) {
            three.controls.minDistance = 160; // Just above surface
            three.controls.maxDistance = 800; // Allow full map view
            three.controls.enablePan = false; // Pan moves center, we want orbit center 0,0,0
        }

        // Lighting - Moved to SkySystem
        // const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        // three.scene.add(ambient);

        // Init SkySystem
        this.skySystem = new SkySystem(three.scene);

        // Subscribe to Time Changes
        // Subscribe to Time Changes
        TurnManager.getInstance().subscribe((turnData: any) => {
            this.skySystem?.updateTime(turnData.timeOfDay);
        });

        // Initial update
        this.skySystem.updateTime(TurnManager.getInstance().timeOfDay);

        // Generate Map
        try {
            const mapGenerator = new MapGenerator(this.mapWidth, this.mapHeight);
            mapGenerator.generate();
            this.mapData = mapGenerator.getMapData();
            this.mapGenerator = mapGenerator; // Store instance
            console.log(`[WorldMapScene] Map Generated: ${this.mapData.length}x${this.mapData[0].length}`);
        } catch (e) {
            console.error("[WorldMapScene] Map Generation Failed:", e);
            // Initialize empty map data to prevent downstream errors
            this.mapData = [];
        }

        CharacterManager.getInstance().generateNPCsForMap(this.mapData, this.mapWidth, this.mapHeight, 40);
        this.characters = CharacterManager.getInstance().getAllNPCs();

        // Build 3D World
        try {
            this.build3DWorld(three.scene);
        } catch (e) {
            console.error("[WorldMapScene] Failed to build 3D World:", e);
        }

        try {
            this.create3DCharacters(three.scene);
        } catch (e) {
            console.error("[WorldMapScene] Failed to create characters:", e);
        }

        try {
            this.createKingdomLabels(three.scene);
        } catch (e) {
            console.error("[WorldMapScene] Failed to create kingdom labels:", e);
        }

        // UI Overlay
        this.add.text(10, 10, '3D World Map (60x50)\nRight Click to Rotate\nScroll to Zoom\nLeft Click to Select', {
            fontSize: '16px', color: '#fff', stroke: '#000', strokeThickness: 3
        });

        // Resize
        this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
            three.resize(gameSize.width, gameSize.height);
        });

        // Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown()) return;
            this.handleClick(pointer.x, pointer.y);
        });

        // Hover
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.handleRaycast(pointer.x, pointer.y);
        });
        console.log("[WorldMapScene] create() END");
    }

    update() {
        ThreeSystem.getInstance().render();
    }

    // State for toggling modes


    // World Radius
    private worldRadius: number = 150;

    build3DWorld(scene: THREE.Scene) {
        if (!this.mapData || this.mapData.length === 0) {
            console.warn("[WorldMapScene] No map data to build.");
            return;
        }
        console.log(`[WorldMapScene] Building 3D Globe. Radius: ${this.worldRadius}`);
        this.renderMap(scene);
    }

    async renderMap(scene: THREE.Scene) {
        this.cleanupGroup(this.terrainGroup);
        this.cleanupGroup(this.textGroup);

        scene.remove(this.terrainGroup);
        scene.remove(this.textGroup);
        this.terrainGroup = new THREE.Group();
        this.textGroup = new THREE.Group();
        scene.add(this.terrainGroup);
        scene.add(this.textGroup);

        console.log("[WorldMapScene] renderMap: Loading Config...");

        // Load Configuration
        const iniData = await ConfigLoader.loadIni('/settings/terrain.ini');
        const resData = await ConfigLoader.loadIni('/settings/resources.ini');

        // Loader
        const loader = new THREE.TextureLoader();

        // Inner Sphere (Core) to hide gaps
        const coreGeo = new THREE.SphereGeometry(this.worldRadius - 1, 64, 64);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x001133 }); // Deep ocean color
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        this.terrainGroup.add(coreMesh);


        // UPDATED: Organized Assets into Folders
        const overlayTextures: Record<string, THREE.Texture> = {
            'forest': loader.load('/assets/features/feat_forest.png'),
            'mountain': loader.load('/assets/features/feat_mountain.png'),
            'lake': loader.load('/assets/features/feat_lake.png'),
            'oasis': loader.load('/assets/features/feat_oasis.png'),
            'reef': loader.load('/assets/features/feat_reef.png'),
            'ice': loader.load('/assets/features/feat_ice.png'),
            'city': loader.load('/assets/buildings/feat_city.png'),
            'capital': loader.load('/assets/buildings/feat_capital.png'),
            'ruin': loader.load('/assets/buildings/build_ruin.png'),
        };

        // Parse Resource Config
        this.resourceConfig = {};
        for (const key in ResourceType) {
            if (isNaN(Number(key)) && key !== 'NONE') {
                const resName = key;
                const config = resData[resName];
                let texPath = `/assets/resources/res_${resName.toLowerCase()}.png`;
                const tex = loader.load(texPath, undefined, undefined, (err) => {
                    console.warn("Failed to load resource texture, using config fallback", err);
                });

                this.resourceConfig[resName] = {
                    texture: tex,
                    name: config ? config['name'] : resName
                };
            }
        }

        // Parse Terrain Config: Load ASYNC
        this.terrainConfig = {};
        const terrainKeys = Object.keys(BaseTerrain).filter(k => isNaN(Number(k)));

        const loadPromises = terrainKeys.map(async (terrainName) => {
            const configSection = iniData[terrainName];
            let color = 0xffffff;
            let texture: THREE.Texture | undefined = undefined;

            if (configSection) {
                if (configSection['color']) color = parseInt(configSection['color'].replace('#', '0x'), 16);
                if (configSection['texture']) {
                    try {
                        texture = await loader.loadAsync(`/assets/${configSection['texture']}`);
                        texture.colorSpace = THREE.SRGBColorSpace;
                    } catch (e) {
                        texture = undefined;
                    }
                }
            } else {
                // Fallbacks
                if (terrainName === 'GRASSLAND') color = 0x55aa55;
                else if (terrainName === 'OCEAN') color = 0x224488;
                else if (terrainName === 'DESERT') color = 0xeedd88;
                else if (terrainName === 'VOLCANIC') color = 0x884444;
                else if (terrainName === 'TUNDRA') color = 0xddffff;
                else if (terrainName === 'SWAMP') color = 0x445544;
                else if (terrainName === 'PLAINS') color = 0xaa9977;
                else if (terrainName === 'WASTELAND') color = 0x666666;
            }
            this.terrainConfig[terrainName] = { color, texture };
        });

        await Promise.all(loadPromises);
        console.log('[WorldMapScene] renderMap: Textures Loaded. Building Globe...');

        // Size logic for Sphere
        // We map Width -> Longitude (0 to 2PI)
        // We map Height -> Latitude (PI/6 to 5PI/6) - Excluding extreme poles improves hex look

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const cell = this.mapData[y][x];
                this.createTileGlobe(cell, x, y, overlayTextures);
            }
        }
        console.log("Globe rendering complete.");
    }

    private calculateSphericalPosition(mapX: number, mapY: number, radius: number): THREE.Vector3 {
        // Map 0..width to 0..2PI
        const theta = (mapX / this.mapWidth) * Math.PI * 2;

        // Map 0..height to PI..0 (Top to Bottom)
        // Restricted Band: 0.1PI to 0.9PI (Leaving 10% cap area)
        const minPhi = 0.1 * Math.PI;
        const maxPhi = 0.9 * Math.PI;
        const phi = minPhi + (mapY / this.mapHeight) * (maxPhi - minPhi);

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);

        return new THREE.Vector3(x, y, z);
    }

    private cleanupGroup(group: THREE.Group) {
        group.traverse((child: any) => {
            if (child.isMesh || child.isSprite) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
                    else child.material.dispose();
                }
            }
        });
        group.clear();
    }

    createTileGlobe(cell: TileData, x: number, y: number, textures: any) {
        let displayHeight = cell.height !== undefined ? cell.height : 0;
        if (cell.baseType === BaseTerrain.OCEAN) displayHeight = 0;

        const tileRadius = 5.1; // Reduced from 5.5 to minimize Z-fighting overlap

        // Position
        const pos = this.calculateSphericalPosition(x, y, this.worldRadius);

        // Orientation: Look away from center
        const lookTarget = pos.clone().multiplyScalar(2);

        // --- 1. Base Mesh (Hexagon on sphere surface) ---
        // We use a cylinder or circle, or custom hex shape.
        // Since we are high poly now, CylinderGeometry(rad, rad, height, 6) works.
        // Heights:
        const scaleHeight = 2.0;
        const geoHeight = Math.max(1, 4 + (displayHeight * scaleHeight));

        // We need to position base so its TOP is at `worldRadius + height`
        // Or Bottom at `worldRadius`.
        // Cylinder pivot is center.

        const hexGeo = new THREE.CylinderGeometry(tileRadius, tileRadius * 0.8, geoHeight, 6);
        // Rotate Cylinder to align with "Y" up when we lookAt?
        // Default Cylinder is upright along Y.
        // If we lookAt(target), the object's +Z points to target.
        // We want the Cylinder's "Top" (+Y) to point to target.
        // So we rotate geometry X by -90?
        hexGeo.rotateX(-Math.PI / 2); // Now +Z is the "Top" face.

        let sideColor = 0x444444;
        const terrainName = BaseTerrain[cell.baseType];
        const config = this.terrainConfig[terrainName];
        if (cell.baseType === BaseTerrain.OCEAN) sideColor = 0x112244;
        else if (cell.baseType === BaseTerrain.VOLCANIC) sideColor = 0x220000;

        const matSide = new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.9 });
        const baseMesh = new THREE.Mesh(hexGeo, matSide);

        // Align
        baseMesh.position.copy(pos);
        baseMesh.lookAt(lookTarget);
        // Cylinder is now pointing +Z at lookTarget.
        // Shift it 'out' so the bottom is at radius.
        // Current center is at `radius`. Length is `geoHeight`.
        // So we shift out by `geoHeight / 2`.
        baseMesh.translateZ(geoHeight / 2 - 2); // -2 to sink slightly into core

        baseMesh.userData = { x: cell.x, y: cell.y, type: 'terrain' };
        this.terrainGroup.add(baseMesh);

        // --- 2. Cap (The surface) ---
        // Similar to before, but we place it at the outer edge
        // OFFSET ADDED: +0.05 to prevent Z-fighting with Base Top
        const capDist = this.worldRadius + geoHeight - 2 + 0.05;
        const capPos = this.calculateSphericalPosition(x, y, capDist);

        const capGeo = new THREE.CircleGeometry(tileRadius, 6);
        // Default Circle is on XY plane, Normal +Z.
        // We want Normal to point Out.
        // lookAt points +Z to target. Perfect.

        let topColor = config.color || 0xffffff;
        let topTexture = config.texture || null;

        const matTop = new THREE.MeshStandardMaterial({
            map: topTexture,
            color: topColor,
            roughness: 0.8,
            side: THREE.FrontSide
        });

        const capMesh = new THREE.Mesh(capGeo, matTop);
        capMesh.position.copy(capPos);
        capMesh.lookAt(lookTarget);
        capMesh.userData = { x: cell.x, y: cell.y, type: 'terrain_cap' };
        this.terrainGroup.add(capMesh);

        // --- 3. Billboards ---

        // Calculate surface position for objects
        const surfaceR = capDist;

        // 1. Buildings
        if (cell.buildingType === BuildingType.CAPITAL && textures['capital']) {
            this.createBillboardGlobe(textures['capital'], x, y, surfaceR, 8.0);
        } else if (cell.buildingType === BuildingType.CITY && textures['city']) {
            this.createBillboardGlobe(textures['city'], x, y, surfaceR, 5.0);
        } else if (cell.buildingType === BuildingType.RUIN && textures['ruin']) {
            this.createBillboardGlobe(textures['ruin'], x, y, surfaceR, 4.0);
        }

        // 2. Features
        if (cell.featureType !== FeatureType.NONE) {
            const texName = FeatureType[cell.featureType].toLowerCase();
            if (textures[texName]) {
                this.createBillboardGlobe(textures[texName], x, y, surfaceR, 6.0);
            }
        }

        // 3. Resources
        if (cell.resourceType !== ResourceType.NONE) {
            const resName = ResourceType[cell.resourceType];
            const config = this.resourceConfig[resName];
            if (config && config.texture) {
                // Offset slightly? Complex on sphere. Just overlapping is okay for now.
                this.createBillboardGlobe(config.texture, x, y, surfaceR, 4.0);
            }
        }

        // Border?
        if (cell.kingdomId) {
            const colors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00, 0xff00ff, 0x00ffff];
            const kColor = colors[(cell.kingdomId - 1) % colors.length];
            this.createHexBorderGlobe(x, y, surfaceR + 0.1, tileRadius, kColor, lookTarget);
        }
    }

    private createBillboardGlobe(texture: THREE.Texture, x: number, y: number, r: number, scale: number) {
        // Position at surface
        const pos = this.calculateSphericalPosition(x, y, r);

        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            color: 0xffffff
        });

        const sprite = new THREE.Sprite(mat);
        // Move OUT by half scale so bottom touches surface
        const spritePos = pos.clone().add(pos.clone().normalize().multiplyScalar(scale / 2));

        sprite.position.copy(spritePos);
        sprite.scale.set(scale, scale, 1);
        sprite.userData = { x, y, type: 'billboard' };

        this.terrainGroup.add(sprite);
    }

    private createHexBorderGlobe(mapX: number, mapY: number, r: number, radius: number, color: number, lookTarget: THREE.Vector3) {
        const shape = this.createHexagonShape(radius);
        const points = shape.getPoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: color });
        const line = new THREE.Line(geometry, material);

        const pos = this.calculateSphericalPosition(mapX, mapY, r);
        line.position.copy(pos);
        line.lookAt(lookTarget);

        this.terrainGroup.add(line);
    }

    createHexagonShape(radius: number): THREE.Shape {
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + (Math.PI / 6);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }

    // --- Characters ---

    create3DCharacters(scene: THREE.Scene) {
        scene.remove(this.characterGroup);
        this.characterGroup = new THREE.Group();
        scene.add(this.characterGroup);

        const loader = new THREE.TextureLoader();
        const heroTexture = loader.load('/assets/unit_hero.png');

        this.characters.forEach(char => {
            // Surface Radius
            let r = this.worldRadius;
            if (this.mapData[char.y] && this.mapData[char.y][char.x]) {
                const cell = this.mapData[char.y][char.x];
                const displayHeight = cell.height !== undefined ? cell.height : 0;
                const geoHeight = Math.max(1, 5 + (displayHeight * 2.0));
                r = this.worldRadius + geoHeight - 2;
            }

            const scale = 6.0;
            const pos = this.calculateSphericalPosition(char.x, char.y, r);
            const spritePos = pos.clone().add(pos.clone().normalize().multiplyScalar(scale / 2));

            const spriteMat = new THREE.SpriteMaterial({
                map: heroTexture,
                transparent: true,
                alphaTest: 0.5
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(spritePos);
            sprite.scale.set(scale, scale, 1);
            this.characterGroup.add(sprite);
        });
    }

    createKingdomLabels(scene: THREE.Scene) {
        if (!this.mapGenerator || !this.mapGenerator.politicalSystem) return;
        const centers = this.mapGenerator.politicalSystem.getKingdomCenters();

        const r = this.worldRadius + 20; // Float high above

        centers.forEach(center => {
            const kingdom = this.mapGenerator?.politicalSystem?.kingdoms.find(k => k.id === center.kingdomId);
            if (!kingdom) return;

            const pos = this.calculateSphericalPosition(center.x, center.y, r);

            const label = this.createTextSprite(kingdom.name, { fontsize: 64, bold: true });
            label.position.copy(pos);
            label.scale.set(40, 20, 1);
            scene.add(label);
        });
    }

    createTextSprite(text: string, options: any): THREE.Sprite {
        const fontface = "Arial";
        const fontsize = options.fontsize || 32;
        const borderThickness = options.strokeWidth || 4;
        const borderColor = options.strokeColor || { r: 0, g: 0, b: 0, a: 1.0 };
        const textColor = options.color || "#ffffff";

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return new THREE.Sprite();

        // Canvas size - large enough for text
        canvas.width = 512;
        canvas.height = 256;

        context.font = (options.bold ? "bold " : "") + (options.italic ? "italic " : "") + fontsize + "px " + fontface;

        // Measure text
        const metrics = context.measureText(text);
        const textWidth = metrics.width;

        // Stroke
        context.lineWidth = borderThickness;
        context.strokeStyle = typeof borderColor === 'string' ? borderColor : `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
        context.strokeText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2 + fontsize / 3);

        // Fill
        context.fillStyle = typeof textColor === 'string' ? textColor : `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
        context.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2 + fontsize / 3);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter; // Crucial for text clarity
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);

        return sprite;
    }

    handleClick(pointerX: number, pointerY: number) {
        const hit = this.raycast(pointerX, pointerY);
        if (hit && hit.userData) {
            console.log("Clicked Tile:", hit.userData);
            // Select logic or move logic here
        }
    }

    handleRaycast(pointerX: number, pointerY: number) {
        const hit = this.raycast(pointerX, pointerY);
        if (hit && hit.userData && hit.userData.x !== undefined) {
            const cell = this.mapData[hit.userData.y][hit.userData.x];
            // Emit event for UI
            this.game.events.emit('map-hover', {
                x: hit.userData.x,
                y: hit.userData.y,
                cell: cell,
                screenX: pointerX,
                screenY: pointerY
            });
        } else {
            this.game.events.emit('map-hover', null);
        }
    }

    private raycast(pointerX: number, pointerY: number): any {
        const three = ThreeSystem.getInstance();
        if (!three.camera) return null;
        const width = this.scale.width;
        const height = this.scale.height;
        const mouse = new THREE.Vector2();
        mouse.x = (pointerX / width) * 2 - 1;
        mouse.y = -(pointerY / height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, three.camera);
        const intersects = raycaster.intersectObjects(this.terrainGroup.children, true); // Recursive checking

        if (intersects.length > 0) {
            const validHit = intersects.find(hit => hit.object.userData && hit.object.userData.x !== undefined);
            if (validHit) {
                return validHit.object;
            }
        }
        return null;
    }
}
