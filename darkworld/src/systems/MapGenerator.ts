import { PoliticalSystem } from './PoliticalSystem'; // Import PoliticalSystem
import { BaseTerrain, FeatureType, ResourceType, BuildingType, TileData } from './MapTypes';

export class MapGenerator {
    private width: number;
    private height: number;
    private map: TileData[][] = [];
    private random: any; // SimplexNoise
    public politicalSystem?: PoliticalSystem; // Expose publicly

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    generate(): TileData[][] {
        // Init Map
        this.map = [];
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = {
                    x, y,
                    baseType: BaseTerrain.OCEAN,
                    featureType: FeatureType.NONE,
                    resourceType: ResourceType.NONE,
                    buildingType: BuildingType.NONE,
                    height: 0
                };
            }
        }

        // Noise Generators
        const simplexElevation = new SimplexNoise();
        const simplexMoisture = new SimplexNoise();

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.map[y][x];

                // --- 1. Elevation (Continent Shape) ---
                let nx = x / this.width - 0.5;
                let ny = y / this.height - 0.5;

                // Base Noise
                let e = simplexElevation.noise2D(nx * 3, ny * 3);
                // Detail Noise
                e += 0.5 * simplexElevation.noise2D(nx * 8, ny * 8);
                // Normalize roughly to 0-1
                e = (e + 1) / 2;

                // Radial Mask (Make it an island world)
                const d = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / (maxDist * 0.85);
                e = e * (1 - d * 1.2);

                // --- 2. Moisture ---
                // Distinct noise for wet/dry areas
                let m = simplexMoisture.noise2D(nx * 4 + 100, ny * 4 + 100);
                m = (m + 1) / 2; // 0 to 1

                // --- 3. Temperature (Latitude based) ---
                // 0 (Pole) to 1 (Equator)
                // Map Height is from 0 (North Pole?) to Height (South Pole?) or Centered?
                // Let's assume Top/Bottom are poles. Center is Equator.
                const latitude = Math.abs((y - centerY) / centerY); // 0 at center, 1 at poles
                let temp = 1 - latitude; // 1 at Equator, 0 at Poles

                // Height Effect: Higher is colder
                // We don't have final height yet, but we use 'elevation' as proxy
                if (e > 0.8) temp -= 0.2;

                // --- 4. Biome Determination ---

                // Water
                if (e < 0.15) {
                    cell.baseType = BaseTerrain.OCEAN;
                    cell.height = -5; // Deep Ocean
                } else if (e < 0.3) {
                    cell.baseType = BaseTerrain.OCEAN;
                    cell.height = -1; // Shallow Ocean
                } else {
                    // Land
                    // Elevation Height Logic
                    let displayHeight = 1;
                    if (e > 0.6) displayHeight = 2; // Hills
                    if (e > 0.85) displayHeight = 4; // High Peaks

                    // Biome Logic table
                    if (temp < 0.25) {
                        // Polar / Tundra
                        cell.baseType = BaseTerrain.TUNDRA;
                        if (e > 0.8) cell.baseType = BaseTerrain.VOLCANIC; // Snowy Peaks? Or just Tundra
                    } else if (temp < 0.6) {
                        // Temperate
                        if (m < 0.3) cell.baseType = BaseTerrain.WASTELAND; // Dry
                        else if (m < 0.6) cell.baseType = BaseTerrain.PLAINS; // Medium
                        else if (m < 0.8) cell.baseType = BaseTerrain.GRASSLAND; // Wet
                        else cell.baseType = BaseTerrain.SWAMP; // Very Wet
                    } else {
                        // Tropical / Hot
                        if (m < 0.3) cell.baseType = BaseTerrain.DESERT;
                        else if (m < 0.6) cell.baseType = BaseTerrain.PLAINS; // Savanna-ish
                        else cell.baseType = BaseTerrain.GRASSLAND; // Jungle can be here later
                    }

                    // Mountain Overrides
                    if (e > 0.85) {
                        cell.baseType = BaseTerrain.VOLCANIC; // Using Volcanic as "Rock/Mountain Base"
                        if (Math.random() > 0.5) cell.featureType = FeatureType.MOUNTAIN;
                    }


                    if (cell.baseType === BaseTerrain.GRASSLAND || cell.baseType === BaseTerrain.PLAINS) {
                        // More forests in wet areas
                        if (m > 0.6 && Math.random() < 0.4) cell.featureType = FeatureType.FOREST;
                        // Lake in balanced areas
                        else if (m > 0.4 && Math.random() < 0.05) cell.featureType = FeatureType.LAKE;
                    }

                    if (cell.baseType === BaseTerrain.DESERT) {
                        // Oasis in desert
                        if (Math.random() < 0.03) cell.featureType = FeatureType.OASIS;
                    }

                    if (cell.baseType === BaseTerrain.TUNDRA) {
                        if (Math.random() < 0.2) cell.featureType = FeatureType.FOREST; // Pine
                        else if (Math.random() < 0.05) cell.featureType = FeatureType.ICE;
                    }

                    if (cell.baseType === BaseTerrain.VOLCANIC) {
                        if (Math.random() < 0.1) cell.featureType = FeatureType.ICE; // High altitude glacier
                    }

                    cell.height = displayHeight;
                }

                // Ocean Features
                if (cell.baseType === BaseTerrain.OCEAN && cell.height === -1) {
                    // Reefs in shallow water
                    if (Math.random() < 0.1) cell.featureType = FeatureType.REEF;
                }
            }
        }

        // 5. Populate Resources
        this.populateResources();

        // 6. Political System (Kingdoms, Cities, Territories)
        const politicalSystem = new PoliticalSystem(this.map, this.width, this.height);
        politicalSystem.generate(8); // Generate 8 cities/kingdoms logic
        this.politicalSystem = politicalSystem; // FIX: Assign to instance property

        return this.map;
    }

    public getMapData(): TileData[][] {
        return this.map;
    }

    private populateResources() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.map[y][x];

                // Skip Water
                if (cell.baseType === BaseTerrain.OCEAN) continue;

                // Probability Check
                const rand = Math.random();

                // IRON: Common in Mountains, Wastelands
                if (cell.featureType === FeatureType.MOUNTAIN && rand < 0.3) {
                    cell.resourceType = ResourceType.IRON;
                } else if (cell.baseType === BaseTerrain.WASTELAND && rand < 0.2) {
                    cell.resourceType = ResourceType.IRON;
                }

                // GOLD: Rare, Volcanic or Mountain
                else if (cell.baseType === BaseTerrain.VOLCANIC && rand < 0.2) {
                    cell.resourceType = ResourceType.GOLD;
                } else if (cell.featureType === FeatureType.MOUNTAIN && rand > 0.9) {
                    cell.resourceType = ResourceType.GOLD;
                }

                // WHEAT: Plains and Grassland
                else if (cell.baseType === BaseTerrain.PLAINS && rand < 0.15) {
                    cell.resourceType = ResourceType.WHEAT;
                } else if (cell.baseType === BaseTerrain.GRASSLAND && rand < 0.1) {
                    cell.resourceType = ResourceType.WHEAT;
                }
            }
        }
    }
}

// Simple Simplex Noise Helper (Permutation table based)
// Minimal implementation for portability
export class SimplexNoise {
    private p: number[] = new Array(256);
    private perm: number[] = new Array(512);

    constructor() {
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    dot(g: number[], x: number, y: number) {
        return g[0] * x + g[1] * y;
    }

    noise2D(xin: number, yin: number) {
        let n0, n1, n2;
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;

        const ii = i & 255;
        const jj = j & 255;

        // Gradient table (simplified)
        const grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];

        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else { t0 *= t0; n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0); }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else { t1 *= t1; n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1); }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else { t2 *= t2; n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2); }

        return 70.0 * (n0 + n1 + n2);
    }
}
