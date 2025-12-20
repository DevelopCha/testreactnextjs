import { TileData, BuildingType } from './MapTypes';

export interface Kingdom {
    id: number;
    name: string;
    rulerName: string;
    title: string;
    color: number;
    capitalCityId?: string;
}

export interface City {
    id: string;
    name: string;
    x: number;
    y: number;
    kingdomId: number;
    isCapital: boolean;
    color: number;
}

export class PoliticalSystem {
    private map: TileData[][];
    private width: number;
    private height: number;
    public kingdoms: Kingdom[] = [];
    public cities: City[] = [];

    constructor(map: TileData[][], width: number, height: number) {
        this.map = map;
        this.width = width;
        this.height = height;
    }

    generate(cityCount: number = 10) {
        // 1. Create Kingdoms
        this.createKingdoms();

        // 2. Place Cities & Assign to Kingdoms
        this.placeCities(cityCount);

        // 3. Generate Territories
        this.generateTerritories();
    }

    public getKingdomCenters(): { kingdomId: number, x: number, y: number }[] {
        const centers: { kingdomId: number, x: number, y: number }[] = [];
        this.kingdoms.forEach(k => {
            let sumX = 0;
            let sumY = 0;
            let count = 0;

            // Iterate map to find all tiles for this kingdom
            // Optimization: We could store this during generation, but iteration is safe for 60x50.
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.map[y][x].kingdomId === k.id) {
                        sumX += x;
                        sumY += y;
                        count++;
                    }
                }
            }

            if (count > 0) {
                centers.push({
                    kingdomId: k.id,
                    x: sumX / count,
                    y: sumY / count
                });
            }
        });
        return centers;
    }

    private createKingdoms() {
        const kingdomNames = ["Aethelgard", "Vorexia", "Ironbound", "Sylvaris"];
        const rulerNames = ["Alaric", "Valerius", "Thorin", "Elara"]; // Simplistic
        const titles = ["King", "Emperor", "Lord", "Queen"];
        const colors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00]; // Red, Blue, Yellow, Green

        for (let i = 0; i < kingdomNames.length; i++) {
            this.kingdoms.push({
                id: i + 1,
                name: kingdomNames[i],
                rulerName: rulerNames[i],
                title: titles[i],
                color: colors[i]
            });
        }
    }

    private placeCities(count: number) {
        let placed = 0;
        let attempts = 0;
        const cityNames = ["Ravenrock", "Mistport", "Cloudspire", "Windfall", "Oakhaven", "Ironhold", "Stormwatch", "Brightwater", "Shadowfen", "Highgarden"];

        // Helper to find valid spot
        const isValidParams = (cell: TileData) => {
            return cell.baseType !== 0 // Ocean
                && cell.buildingType === BuildingType.NONE;
        };

        while (placed < count && attempts < 500) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            const cell = this.map[y][x];

            if (isValidParams(cell)) {
                // Assign to random kingdom
                const kingdom = this.kingdoms[Math.floor(Math.random() * this.kingdoms.length)];

                // First city of a kingdom is Capital? Or random?
                // For simplicity, let's make the first assigned city of a kingdom the capital if it doesn't have one.
                let isCapital = false;
                if (!kingdom.capitalCityId) {
                    isCapital = true;
                }

                const cityId = `city_${placed}`;
                const city: City = {
                    id: cityId,
                    name: cityNames[placed] || `City ${placed}`,
                    x, y,
                    kingdomId: kingdom.id,
                    isCapital,
                    color: kingdom.color
                };

                if (isCapital) kingdom.capitalCityId = cityId;

                this.cities.push(city);

                // Update Map Tile
                cell.buildingType = isCapital ? BuildingType.CAPITAL : BuildingType.CITY;
                cell.cityId = cityId;
                cell.kingdomId = kingdom.id;
                cell.name = city.name;

                placed++;
            }
            attempts++;
        }
    }

    private generateTerritories() {
        // Simple expanding territory (Breadth-First Search / Flood Fill) from each city
        // We run rounds of expansion

        let queue: { x: number, y: number, kId: number, cId: string, dist: number }[] = [];

        // Init queue with city centers
        this.cities.forEach(city => {
            queue.push({ x: city.x, y: city.y, kId: city.kingdomId, cId: city.id, dist: 0 });
            // Mark city tile ownership (already done in placeCities but good to ensure)
            this.map[city.y][city.x].kingdomId = city.kingdomId;
            this.map[city.y][city.x].cityId = city.id;
        });

        // Loop until queue empty or max distance
        const maxDist = 8; // Territory reach

        // Using a visited set might be expensive for whole map. 
        // We can just check if tile already has a kingdomId.

        while (queue.length > 0) {
            // Sort queue? No, simple BFS is fine if we push in order. 
            // Better to use two arrays for 'current edge' and 'next edge' to ensure fair expansion
            // But strict queue is also roughly fair.

            const current = queue.shift();
            if (!current) break;
            if (current.dist >= maxDist) continue;


            // Using simple 4-way for code simplicity first, or 8-way.
            // Actually, hex neighbors are better for the map look.
            // Odd-R layout assumption (common in Phaser examples)
            // Even-R? 
            // WorldMapScene uses `calculateHexPosition` which usually implies a specific layout.
            // Let's use simple 4-way for data model propagation to start.
            const directNeighbors = [
                { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 }
            ];

            for (const n of directNeighbors) {
                if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
                    const tile = this.map[n.y][n.x];
                    if (tile.baseType !== 0 && !tile.kingdomId) {
                        // Claim it
                        tile.kingdomId = current.kId;
                        tile.cityId = current.cId;
                        queue.push({ x: n.x, y: n.y, kId: current.kId, cId: current.cId, dist: current.dist + 1 });
                    }
                }
            }
        }
    }
}
