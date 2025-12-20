export class TurnManager {
    private static instance: TurnManager;
    private currentTurn: number = 0;
    private _timeOfDay: number = 0; // 0: Morning, 1: Afternoon, 2: Evening, 3: Night
    private maxAP: number = 3;
    private currentAP: number = 3;

    // Observer pattern for UI updates
    private listeners: Function[] = [];

    private constructor() { }

    static getInstance(): TurnManager {
        if (!TurnManager.instance) {
            TurnManager.instance = new TurnManager();
        }
        return TurnManager.instance;
    }

    get timeOfDay() {
        return this._timeOfDay;
    }

    get turnData() {
        return {
            year: this.currentTurn,
            month: this.getTimeString(),
            actionPoints: this.currentAP,
            maxActionPoints: this.maxAP,
            timeOfDay: this._timeOfDay // Add direct access
        };
    }

    getTimeString(): string {
        const times = ['Morning', 'Afternoon', 'Evening', 'Night'];
        return times[this._timeOfDay];
    }

    useAP(cost: number): boolean {
        if (this.currentAP >= cost) {
            this.currentAP -= cost;
            this.notifyListeners();
            return true;
        }
        return false;
    }

    advanceTime() {
        this._timeOfDay++;
        this.currentAP = this.maxAP; // Replenish AP usually next day, but let's say partial recover? 
        // Logic: 
        // If time > Night, Next Day.
        if (this._timeOfDay > 3) {
            this._timeOfDay = 0;
            this.currentTurn++;
            this.currentAP = this.maxAP;
        }
        this.notifyListeners();
    }

    subscribe(callback: Function) {
        this.listeners.push(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb(this.turnData));
    }
}
