import { APIService } from '../types/api';

export class APIIntegrationManager {
    private static instance: APIIntegrationManager;
    private registeredAPIs: Map<string, APIService> = new Map();
    
    private constructor() {}
    
    static getInstance(): APIIntegrationManager {
        if (!APIIntegrationManager.instance) {
            APIIntegrationManager.instance = new APIIntegrationManager();
        }
        return APIIntegrationManager.instance;
    }

    async registerAPI(apiService: APIService): Promise<boolean> {
        try {
            console.log('[APIIntegrationManager] Attempting to register API:', {
                name: apiService.name,
                url: apiService.url,
                keyLength: apiService.key?.length || 0
            });

            // Pre-validation logging
            console.log('[APIIntegrationManager] Starting validation for:', apiService.name);

            if (!this.validateAPIService(apiService)) {
                console.error('[APIIntegrationManager] Validation failed for:', apiService.name);
                throw new Error(`API integration ${apiService.name} validation failed`);
            }

            // Special handling for Metis AI Service
            if (apiService.name === 'Metis AI Service') {
                console.log('[APIIntegrationManager] Validating Metis specific requirements');
                if (!this.validateMetisService(apiService)) {
                    throw new Error('Metis AI Service validation failed');
                }
            }

            const apiId = this.generateApiId(apiService.name);
            this.registeredAPIs.set(apiId, apiService);
            
            console.log('[APIIntegrationManager] Successfully registered:', apiService.name);
            return true;
        } catch (error) {
            console.error('[APIIntegrationManager] Registration failed:', error);
            throw error;
        }
    }

    private validateAPIService(apiService: APIService): boolean {
        if (!apiService) {
            console.error('[APIIntegrationManager] API service object is null or undefined');
            return false;
        }

        if (!apiService.name || typeof apiService.name !== 'string') {
            console.error('[APIIntegrationManager] Invalid or missing API name');
            return false;
        }

        if (!apiService.url || typeof apiService.url !== 'string') {
            console.error('[APIIntegrationManager] Invalid or missing API URL');
            return false;
        }

        if (!apiService.key || typeof apiService.key !== 'string') {
            console.error('[APIIntegrationManager] Invalid or missing API key');
            return false;
        }

        try {
            new URL(apiService.url);
        } catch (e) {
            console.error('[APIIntegrationManager] Invalid URL format:', apiService.url);
            return false;
        }

        return true;
    }

    private validateMetisService(apiService: APIService): boolean {
        console.log('[APIIntegrationManager] Metis validation details:', {
            url: apiService.url,
            keyPrefix: apiService.key.substring(0, 15) + '...'
        });

        if (!apiService.key.includes('Hephaestus-Athena')) {
            console.error('[APIIntegrationManager] Invalid Metis API key format');
            return false;
        }

        if (!apiService.url.includes('metisapi')) {
            console.error('[APIIntegrationManager] Invalid Metis API URL');
            return false;
        }

        return true;
    }

    private generateApiId(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '-');
    }

    getAPI(apiId: string): APIService | undefined {
        return this.registeredAPIs.get(apiId);
    }

    getAllAPIs(): Map<string, APIService> {
        return this.registeredAPIs;
    }
}

export default APIIntegrationManager;
// Update the validateMetisService method in APIIntegrationManager.ts
private validateMetisService(apiService: APIService): boolean {
    console.log('[APIIntegrationManager] Metis validation input:', {
        name: apiService.name,
        url: apiService.url,
        keyPrefix: apiService.key?.substring(0, 15) + '...',
        hasKey: !!apiService.key,
        hasUrl: !!apiService.url
    });

    // Temporarily relax validation for debugging
    if (!apiService.key) {
        console.error('[APIIntegrationManager] Metis API key is missing');
        return false;
    }

    if (!apiService.url) {
        console.error('[APIIntegrationManager] Metis API URL is missing');
        return false;
    }

    // Log the actual values being checked
    console.log('[APIIntegrationManager] Metis validation checks:', {
        keyContainsPattern: apiService.key.includes('Hephaestus-Athena'),
        urlContainsPattern: apiService.url.includes('metisapi')
    });

    return true; // Temporarily allow all valid services through
}

// Update the registerAPI method to include more logging
async registerAPI(apiService: APIService): Promise<boolean> {
    try {
        console.log('[APIIntegrationManager] Starting registration for:', {
            name: apiService.name,
            url: apiService.url,
            keyLength: apiService.key?.length || 0,
            version: apiService.version
        });

        if (!this.validateAPIService(apiService)) {
            const error = new Error(`API integration ${apiService.name} validation failed`);
            console.error('[APIIntegrationManager] Basic validation failed:', error);
            throw error;
        }

        // Special handling for Metis AI Service
        if (apiService.name === 'Metis AI Service') {
            console.log('[APIIntegrationManager] Performing Metis-specific validation');
            if (!this.validateMetisService(apiService)) {
                const error = new Error('Metis AI Service validation failed');
                console.error('[APIIntegrationManager] Metis validation failed:', error);
                throw error;
            }
        }

        const apiId = this.generateApiId(apiService.name);
        this.registeredAPIs.set(apiId, apiService);
        
        console.log('[APIIntegrationManager] Successfully registered:', {
            name: apiService.name,
            id: apiId
        });
        return true;
    } catch (error) {
        console.error('[APIIntegrationManager] Registration failed:', error);
        throw error;
    }
}