import { APIService } from '../types/api';

export class SpecializedDomainManager {
    private apis: Map<string, APIService> = new Map();
    private static instance: SpecializedDomainManager;

    private constructor() {}

    static getInstance(): SpecializedDomainManager {
        if (!SpecializedDomainManager.instance) {
            SpecializedDomainManager.instance = new SpecializedDomainManager();
        }
        return SpecializedDomainManager.instance;
    }

    async registerAPI(apiService: APIService): Promise<boolean> {
        try {
            console.log('Registering API Service:', apiService); // Debug log

            if (!this.validateAPI(apiService)) {
                throw new Error(`API integration ${apiService.name} validation failed`);
            }

            // Test API connection before registration
            await this.testAPIConnection(apiService);

            this.apis.set(apiService.name, apiService);
            console.log(`Successfully registered ${apiService.name}`);
            return true;
        } catch (error) {
            console.error('Failed to register API:', error);
            throw error;
        }
    }

    private validateAPI(apiService: APIService): boolean {
        console.log('Validating API Service:', apiService); // Debug log

        // Check for required properties
        if (!apiService?.name) {
            console.error('API name is missing');
            return false;
        }

        if (!apiService?.url) {
            console.error('API URL is missing');
            return false;
        }

        if (!apiService?.key) {
            console.error('API key is missing');
            return false;
        }

        // Validate URL format
        try {
            new URL(apiService.url);
        } catch (e) {
            console.error('Invalid API URL format:', apiService.url);
            return false;
        }

        // Specific validation for Metis AI Service
        if (apiService.name === 'Metis AI Service') {
            return this.validateMetisService(apiService);
        }

        return true;
    }

    private validateMetisService(apiService: APIService): boolean {
        const { key, url } = apiService;

        // Log validation attempt
        console.log('Validating Metis Service:', {
            key: key.substring(0, 10) + '...',
            url
        });

        // Validate Metis API key format
        if (!key.includes('Hephaestus-Athena')) {
            console.error('Invalid Metis API key format');
            return false;
        }

        // Validate Metis URL
        if (!url.includes('metisapi')) {
            console.error('Invalid Metis API URL format');
            return false;
        }

        return true;
    }

    private async testAPIConnection(apiService: APIService): Promise<boolean> {
        try {
            const response = await fetch(apiService.url + '/health', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiService.key}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API health check failed: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error(`Failed to connect to ${apiService.name}:`, error);
            throw new Error(`API connection test failed: ${error.message}`);
        }
    }

    getAPI(name: string): APIService | undefined {
        return this.apis.get(name);
    }

    getAllAPIs(): APIService[] {
        return Array.from(this.apis.values());
    }
}

export default SpecializedDomainManager;
