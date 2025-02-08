import { APIService } from '../types/api';
import SpecializedDomainManager from './SpecializedDomainManager';

export async function initializeMetisService() {
    console.log('Initializing Metis Service with:', {
        name: process.env.REACT_APP_METIS_SERVICE_NAME,
        url: process.env.REACT_APP_METIS_API_URL,
        key: process.env.REACT_APP_METIS_API_KEY?.substring(0, 10) + '...'
    });

    const metisService: APIService = {
        name: 'Metis AI Service',
        url: process.env.REACT_APP_METIS_API_URL || 'https://metisapi-8501e3beedcf.herokuapp.com',
        key: process.env.REACT_APP_METIS_API_KEY || 'Hephaestus-Athena-1976-Bangalore-182003-Ricci',
        version: '1.0.0'
    };

    try {
        await SpecializedDomainManager.getInstance().registerAPI(metisService);
        console.log('Metis service registration successful');
    } catch (error) {
        console.error('Failed to register Metis service:', error);
        throw error;
    }
}
