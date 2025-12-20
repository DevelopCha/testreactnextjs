import { TileData, BuildingType } from './MapTypes';

export enum CharacterType {
    HERO = 0,
    MERCHANT = 1,
    VILLAGER = 2,
    SOLDIER = 3
}

export interface CharacterData {
    id: string;
    name: string;
    type: CharacterType;
    job: string;
    level: number;
    // Position
    x: number;
    y: number;
}

export class CharacterGenerator {
    private map: TileData[][];
    private width: number;
    private height: number;

    constructor(map: TileData[][], width: number, height: number) {
        this.map = map;
        this.width = width;
        this.height = height;
    }

    generate(count: number): CharacterData[] {
        const characters: CharacterData[] = [];
        const cities = this.findCities();

        if (cities.length === 0) return [];

        const jobTitles = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Merchant', 'Blacksmith'];
        const firstNames = ['Arin', 'Bael', 'Cael', 'Dora', 'Elian', 'Fiora', 'Gorn', 'Hera'];

        for (let i = 0; i < count; i++) {
            // Pick random city
            const city = cities[Math.floor(Math.random() * cities.length)];

            // Random attributes
            const type = Math.random() < 0.2 ? CharacterType.HERO : CharacterType.VILLAGER;
            const job = jobTitles[Math.floor(Math.random() * jobTitles.length)];
            const level = Math.floor(Math.random() * 10) + 1;
            const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${i}`;

            characters.push({
                id: `char_${i}`,
                name: name,
                type: type,
                job: job,
                level: level,
                x: city.x,
                y: city.y
            });
        }

        return characters;
    }

    private findCities(): TileData[] {
        const cities: TileData[] = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x].buildingType === BuildingType.CITY ||
                    this.map[y][x].buildingType === BuildingType.KINGDOM) {
                    cities.push(this.map[y][x]);
                }
            }
        }
        return cities;
    }
}
