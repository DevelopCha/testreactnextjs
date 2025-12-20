export enum BaseTerrain {
    OCEAN = 0,
    GRASSLAND = 1,
    DESERT = 2,
    TUNDRA = 3,
    SWAMP = 4,
    VOLCANIC = 5,
    PLAINS = 6,
    WASTELAND = 7
}

export enum FeatureType {
    NONE = 0,
    FOREST = 1,
    MOUNTAIN = 2,
    LAKE = 3,
    OASIS = 4,
    REEF = 5,
    ICE = 6
}

export enum ResourceType {
    NONE = 0,
    IRON = 1,
    GOLD = 2,
    WHEAT = 3
}

export enum BuildingType {
    NONE = 0,
    CITY = 1,
    RUIN = 2,
    KINGDOM = 3,
    TOWER = 4,
    CAPITAL = 5
}

export interface TileData {
    x: number;
    y: number;
    // Layer 0
    baseType: BaseTerrain;
    // Layer 1
    featureType: FeatureType;
    // Layer 2
    resourceType: ResourceType;
    // Layer 3
    buildingType: BuildingType;

    // Metadata
    name?: string;
    height: number;

    // Ownership
    kingdomId?: number;
    cityId?: string; // ID of the city that controls this tile
}
