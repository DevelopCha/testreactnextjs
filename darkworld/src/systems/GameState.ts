import { CharacterManager } from './CharacterManager';

export interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'consumable' | 'equipment' | 'material';
}

// PlayerState mainly tracks "Session/Economy" data now, 
// while "Entity" data (Stats, HP) is in CharacterManager.
export interface PlayerEconomy {
    gold: number;
    inventory: { item: Item, count: number }[];
    exp: number;
}

export class GameState {
    private static instance: GameState;

    public economy: PlayerEconomy;
    public logs: string[] = [];

    private constructor() {
        this.economy = {
            gold: 500,
            inventory: [],
            exp: 0
        };

        // Add some starter items
        this.addItem({ id: 'potion_hp', name: 'Health Potion', description: 'Restores 50 HP', price: 50, type: 'consumable' }, 3);
    }

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    // --- Inventory ---
    public get inventory() { return this.economy.inventory; }
    public get gold() { return this.economy.gold; }

    public addItem(item: Item, count: number = 1) {
        const existing = this.economy.inventory.find(i => i.item.id === item.id);
        if (existing) {
            existing.count += count;
        } else {
            this.economy.inventory.push({ item, count });
        }
        this.addLog(`Obtained ${item.name} x${count}`);
    }

    public removeItem(itemId: string, count: number = 1): boolean {
        const index = this.economy.inventory.findIndex(i => i.item.id === itemId);
        if (index === -1) return false;

        if (this.economy.inventory[index].count >= count) {
            this.economy.inventory[index].count -= count;
            if (this.economy.inventory[index].count === 0) {
                this.economy.inventory.splice(index, 1);
            }
            return true;
        }
        return false;
    }

    // --- Gold ---
    public addGold(amount: number) {
        this.economy.gold += amount;
        this.addLog(`Gained ${amount} Gold`);
    }

    public removeGold(amount: number): boolean {
        if (this.economy.gold >= amount) {
            this.economy.gold -= amount;
            this.addLog(`Spent ${amount} Gold`);
            return true;
        }
        return false;
    }

    // --- Logs ---
    public addLog(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift(`[${timestamp}] ${message}`);
        if (this.logs.length > 50) this.logs.pop();
    }
}
