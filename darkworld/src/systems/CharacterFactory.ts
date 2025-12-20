import { TileData } from './MapTypes';

export enum CharacterType {
    HERO = 0,
    MERCHANT = 1,
    VILLAGER = 2,
    SOLDIER = 3,
    NOBLE = 4
}

export interface CharacterStats {
    str: number;
    dex: number;
    int: number;
    hp: number;
    maxHp: number;
}

export interface Character {
    id: string;
    name: string;
    type: CharacterType;
    job: string;
    level: number;
    stats: CharacterStats;

    // Location
    scene: string; // 'WorldMap', 'TownMap'
    x: number;     // Grid X or Local X
    y: number;     // Grid Y or Local Y
    locationName?: string; // e.g., "Cloudspire"
}

export class CharacterFactory {

    public static createHero(name: string): Character {
        return {
            id: 'hero_main',
            name: name,
            type: CharacterType.HERO,
            job: 'Adventurer',
            level: 1,
            stats: {
                str: 10, dex: 10, int: 10,
                hp: 100, maxHp: 100
            },
            scene: 'WorldMap',
            x: 0, y: 0
        };
    }

    public static createNPC(id: string, level: number, locationName: string, x: number, y: number): Character {
        const jobTitles = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Merchant', 'Blacksmith', 'Guard'];
        const firstNames = ['Arin', 'Bael', 'Cael', 'Dora', 'Elian', 'Fiora', 'Gorn', 'Hera', 'Ivor', 'Jora'];
        const lastNames = ['Stone', 'Wind', 'Fire', 'Water', 'Leaf', 'Star', 'Moon', 'Sun'];

        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const job = jobTitles[Math.floor(Math.random() * jobTitles.length)];

        return {
            id: id,
            name: name,
            type: Math.random() < 0.2 ? CharacterType.NOBLE : (Math.random() < 0.4 ? CharacterType.MERCHANT : CharacterType.VILLAGER),
            job: job,
            level: level,
            stats: {
                str: 5 + Math.floor(Math.random() * 10),
                dex: 5 + Math.floor(Math.random() * 10),
                int: 5 + Math.floor(Math.random() * 10),
                hp: 50 + (level * 10),
                maxHp: 50 + (level * 10)
            },
            scene: 'WorldMap',
            locationName: locationName,
            x: x,
            y: y
        };
    }
}
