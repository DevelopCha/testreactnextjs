import { Character, CharacterFactory } from './CharacterFactory';
import { TileData, BuildingType } from './MapTypes';

export class CharacterManager {
    private static instance: CharacterManager;

    private hero: Character;
    private npcs: Character[] = [];

    private constructor() {
        // Initialize Hero
        this.hero = CharacterFactory.createHero("Player");
    }

    public static getInstance(): CharacterManager {
        if (!CharacterManager.instance) {
            CharacterManager.instance = new CharacterManager();
        }
        return CharacterManager.instance;
    }

    // --- Hero Management ---
    public getHero(): Character {
        return this.hero;
    }

    public updateHeroPosition(scene: string, x: number, y: number, locationName?: string) {
        this.hero.scene = scene;
        this.hero.x = x;
        this.hero.y = y;
        if (locationName) this.hero.locationName = locationName;
    }

    // --- NPC Management ---
    public generateNPCsForMap(mapData: TileData[][], width: number, height: number, count: number) {
        this.npcs = []; // Reset on new map gen? Or append if persistent world? 
        // For now, reset to support "New Game" flow.

        const cities = this.findCities(mapData, width, height);
        if (cities.length === 0) return;

        for (let i = 0; i < count; i++) {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const level = Math.floor(Math.random() * 10) + 1;

            const npc = CharacterFactory.createNPC(
                `npc_${i}`,
                level,
                city.name || 'Unknown City',
                city.x,
                city.y
            );
            this.npcs.push(npc);
        }
        console.log(`CharacterManager: Generated ${this.npcs.length} NPCs.`);
    }

    public getAllNPCs(): Character[] {
        return this.npcs;
    }

    public getNPCsAt(x: number, y: number): Character[] {
        return this.npcs.filter(c => c.x === x && c.y === y);
    }

    public getNPCsInCity(cityName: string): Character[] {
        return this.npcs.filter(c => c.locationName === cityName);
    }

    private findCities(map: TileData[][], width: number, height: number): TileData[] {
        const cities: TileData[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (map[y][x].buildingType === BuildingType.CITY ||
                    map[y][x].buildingType === BuildingType.KINGDOM) {
                    cities.push(map[y][x]);
                }
            }
        }
        return cities;
    }
}
