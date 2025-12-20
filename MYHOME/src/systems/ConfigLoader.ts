export class ConfigLoader {
    /**
     * Loads an INI file and returns a parsed object.
     * Sections are keys in the returned object.
     * properties are keys inside the section objects.
     */
    static async loadIni(path: string): Promise<Record<string, Record<string, string>>> {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                console.warn(`[ConfigLoader] Failed to load INI from ${path}: ${response.statusText}`);
                return {};
            }
            const text = await response.text();
            return this.parseIni(text);
        } catch (e) {
            console.error(`[ConfigLoader] Error parsing INI ${path}:`, e);
            return {};
        }
    }

    private static parseIni(text: string): Record<string, Record<string, string>> {
        const result: Record<string, Record<string, string>> = {};
        let currentSection = "";

        const lines = text.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;

            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                currentSection = trimmed.substring(1, trimmed.length - 1);
                result[currentSection] = {};
            } else if (currentSection && trimmed.includes('=')) {
                const [key, value] = trimmed.split('=', 2);
                result[currentSection][key.trim()] = value.trim();
            }
        }
        return result;
    }
}
