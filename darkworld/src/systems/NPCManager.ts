export interface NPC {
    id: string;
    name: string;
    job: string;
    stats: {
        prowess: number;
        charm: number;
        intrigue: number;
    };
    traits: string[]; // 'Lazy', 'Greedy', 'Honest'
    relationships: Record<string, number>; // ID -> value (-100 to 100)
    currentLocation: string; // 'blacksmith', 'tavern', 'plaza'
    schedule: Record<string, string>; // 'Morning' -> 'plaza'
    state: string; // 'WORKING', 'IDLE', 'SLEEPING'
}

export class NPCManager {
    private static instance: NPCManager;
    public npcs: NPC[] = [];

    private constructor() {
        this.initializeNPCs();
    }

    static getInstance(): NPCManager {
        if (!NPCManager.instance) {
            NPCManager.instance = new NPCManager();
        }
        return NPCManager.instance;
    }

    private initializeNPCs() {
        this.npcs = [
            {
                id: 'blacksmith_boris',
                name: 'Boris',
                job: 'Blacksmith',
                stats: { prowess: 8, charm: 2, intrigue: 1 },
                traits: ['Honest', 'Grumpy'],
                relationships: { 'hero': 0 },
                currentLocation: 'blacksmith',
                schedule: { 'Morning': 'blacksmith', 'Afternoon': 'blacksmith', 'Evening': 'tavern', 'Night': 'home' },
                state: 'IDLE'
            },
            {
                id: 'mayor_elena',
                name: 'Elena',
                job: 'Mayor Granddaughter',
                stats: { prowess: 2, charm: 9, intrigue: 5 },
                traits: ['Optimistic', 'Nosy'],
                relationships: { 'hero': 10 },
                currentLocation: 'plaza',
                schedule: { 'Morning': 'plaza', 'Afternoon': 'plaza', 'Evening': 'home', 'Night': 'home' },
                state: 'IDLE'
            }
        ];
    }

    simulateTurn(timeOfDay: string) {
        this.npcs.forEach(npc => {
            // 1. Move based on schedule
            const intendedLocation = npc.schedule[timeOfDay] || 'home';
            npc.currentLocation = intendedLocation;

            // 2. Trait check (Simulation Logic)
            if (npc.traits.includes('Lazy') && Math.random() < 0.3) {
                npc.currentLocation = 'home'; // Skipped work
                console.log(`${npc.name} felt lazy and stayed home.`);
            }

            // 3. Social Interaction (if in same location)
            // Need a simpler logic for now. 
            // If they are in the tavern, boost relationship with everyone else in tavern?
        });
    }

    getNPCsAt(location: string): NPC[] {
        return this.npcs.filter(npc => npc.currentLocation === location);
    }
}
