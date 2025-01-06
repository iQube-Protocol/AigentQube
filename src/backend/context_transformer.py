import logging
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class AgentContextTransformer:
    def __init__(self, domains: Optional[Dict[str, List[str]]] = None):
        """
        Initialize Context Transformer
        
        :param domains: Optional custom domain definitions
        """
        # Default domain knowledge base
        self.default_domains = {
            "technical": [
                "programming", "software", "algorithm", "code", "engineering", 
                "technology", "computer", "system", "network", "data science"
            ],
            "creative": [
                "art", "design", "writing", "music", "poetry", "imagination", 
                "creativity", "innovation", "storytelling", "visual"
            ],
            "business": [
                "finance", "marketing", "strategy", "management", "sales", 
                "entrepreneurship", "investment", "economics", "startup", "growth"
            ],
            "scientific": [
                "research", "experiment", "hypothesis", "analysis", "biology", 
                "physics", "chemistry", "mathematics", "data", "research method"
            ],
            "general": []  # Catch-all domain
        }
        
        # Use custom domains if provided, otherwise use default
        self.domains = domains or self.default_domains
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer()
        
        # Prepare domain vectors
        self.domain_vectors = {
            domain: self.vectorizer.fit_transform(keywords)
            for domain, keywords in self.domains.items()
        }
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def detect_domain(self, text: str) -> str:
        """
        Detect the domain of the given text
        
        :param text: Input text to analyze
        :return: Detected domain
        """
        try:
            # Vectorize input text
            text_vector = self.vectorizer.transform([text])
            
            # Calculate cosine similarity with domain vectors
            domain_scores = {
                domain: cosine_similarity(text_vector, vector)[0][0]
                for domain, vector in self.domain_vectors.items()
            }
            
            # Find domain with highest similarity
            detected_domain = max(domain_scores, key=domain_scores.get)
            
            # Log domain detection
            self.logger.info(f"Detected domain: {detected_domain}")
            
            return detected_domain
        
        except Exception as e:
            self.logger.error(f"Error detecting domain: {e}")
            return "general"
    
    def get_domain_capabilities(self, domain: str) -> Dict:
        """
        Retrieve capabilities for a specific domain
        
        :param domain: Domain to get capabilities for
        :return: Dictionary of domain capabilities
        """
        domain_capabilities = {
            "technical": {
                "problem_solving": 0.9,
                "code_generation": 0.8,
                "technical_analysis": 0.85
            },
            "creative": {
                "ideation": 0.9,
                "storytelling": 0.8,
                "artistic_interpretation": 0.75
            },
            "business": {
                "strategic_planning": 0.8,
                "market_analysis": 0.75,
                "financial_modeling": 0.7
            },
            "scientific": {
                "research_methodology": 0.9,
                "data_analysis": 0.85,
                "hypothesis_generation": 0.8
            },
            "general": {
                "adaptability": 0.6,
                "general_knowledge": 0.7,
                "communication": 0.75
            }
        }
        
        return domain_capabilities.get(domain, domain_capabilities["general"])
    
    def adjust_capabilities(self, detected_domain: str) -> Dict:
        """
        Dynamically adjust agent capabilities based on detected domain
        
        :param detected_domain: Domain detected from context
        :return: Adjusted capabilities
        """
        try:
            # Get base capabilities for the domain
            base_capabilities = self.get_domain_capabilities(detected_domain)
            
            # Optional: Apply additional adjustments based on context complexity
            # This could involve more sophisticated ML models in future iterations
            
            self.logger.info(f"Adjusted capabilities for {detected_domain} domain")
            
            return {
                "domain": detected_domain,
                "capabilities": base_capabilities
            }
        
        except Exception as e:
            self.logger.error(f"Error adjusting capabilities: {e}")
            return {
                "domain": "general",
                "capabilities": self.get_domain_capabilities("general")
            }
