// Cache Manager Module - Handles response caching for performance optimization
export class CacheManager {
    constructor(maxSize = 50) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
    }

    hash(text) {
        // Simple hash function for caching
        return text.toLowerCase().trim().substring(0, 100);
    }

    get(key) {
        const hash = this.hash(key);
        if (this.cache.has(hash)) {
            this.hits++;
            const entry = this.cache.get(hash);
            // Move to end (LRU)
            this.cache.delete(hash);
            this.cache.set(hash, entry);
            return entry;
        }
        this.misses++;
        return null;
    }

    set(key, value) {
        const hash = this.hash(key);

        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize && !this.cache.has(hash)) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(hash, value);
    }

    has(key) {
        return this.cache.has(this.hash(key));
    }

    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%'
        };
    }

    // Save to localStorage
    persist() {
        try {
            const data = Array.from(this.cache.entries());
            localStorage.setItem('ai_interview_cache', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to persist cache:', e);
        }
    }

    // Load from localStorage
    restore() {
        try {
            const data = localStorage.getItem('ai_interview_cache');
            if (data) {
                const entries = JSON.parse(data);
                this.cache = new Map(entries);
            }
        } catch (e) {
            console.warn('Failed to restore cache:', e);
        }
    }
}
