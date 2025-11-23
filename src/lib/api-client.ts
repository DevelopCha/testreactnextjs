import db from "@/api-mocks/db.json";

type DB = typeof db;
type Table = keyof DB;

const LATENCY = 500;

export class MockApiClient {
    private db: DB;

    constructor() {
        // In a real app, this would be stateful or use localStorage
        // For this demo, we use the imported JSON as the initial state
        // Note: Changes here won't persist across reloads unless we use localStorage
        this.db = db;
    }

    private async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async get<T>(table: Table): Promise<T[]> {
        await this.delay(LATENCY);
        return this.db[table] as unknown as T[];
    }

    async getById<T>(table: Table, id: number): Promise<T | undefined> {
        await this.delay(LATENCY);
        const list = this.db[table] as any[];
        return list.find((item: any) => item.id === id);
    }

    // Simulate POST/PUT/DELETE
    // Note: This only modifies the in-memory instance for the session
    async post<T>(table: Table, data: any): Promise<T> {
        await this.delay(LATENCY);
        const list = this.db[table] as any[];
        const newItem = { ...data, id: list.length + 1 };
        list.push(newItem);
        return newItem as T;
    }

    async getProducts({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) {
        await this.delay(LATENCY);
        const start = (page - 1) * limit;
        const end = start + limit;
        const products = this.db.products;
        return {
            data: products.slice(start, end),
            nextPage: end < products.length ? page + 1 : undefined,
            total: products.length,
        };
    }

    async updateCartItem(id: number, quantity: number) {
        await this.delay(LATENCY);
        const item = (this.db.cart as any[]).find((i: any) => i.id === id);
        if (item) item.quantity = quantity;
        return item;
    }

    async removeCartItem(id: number) {
        await this.delay(LATENCY);
        const index = (this.db.cart as any[]).findIndex((i: any) => i.id === id);
        if (index > -1) (this.db.cart as any[]).splice(index, 1);
        return { success: true };
    }
}

export const apiClient = new MockApiClient();
