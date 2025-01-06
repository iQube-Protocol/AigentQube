import logging
from typing import Dict, Optional
from openai import OpenAI
from .context_transformer import AgentContextTransformer

class NaturalLanguageInterface:
    def __init__(
        self, 
        openai_api_key: str, 
        context_transformer: Optional[AgentContextTransformer] = None
    ):
        """
        Initialize Natural Language Interface
        
        :param openai_api_key: API key for OpenAI services
        :param context_transformer: Optional context transformer for domain detection
        """
        self.client = OpenAI(api_key=openai_api_key)
        self.context_transformer = context_transformer or AgentContextTransformer()
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def process_user_query(
        self, 
        query: str, 
        agent_context: Optional[Dict] = None
    ) -> Dict:
        """
        Process user query using GPT-4, adapting to agent's context
        
        :param query: User's natural language query
        :param agent_context: Optional context for the agent
        :return: Processed response with metadata
        """
        try:
            # Detect domain and adjust prompt
            domain = self.context_transformer.detect_domain(query)
            system_prompt = self._generate_system_prompt(domain)
            
            # Generate response using GPT-4
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ]
            )
            
            # Extract response details
            ai_response = response.choices[0].message.content
            token_usage = response.usage.total_tokens
            
            return {
                "response": ai_response,
                "domain": domain,
                "tokens_used": token_usage,
                "model": "gpt-4"
            }
        
        except Exception as e:
            self.logger.error(f"Error processing user query: {e}")
            return {
                "response": "I'm sorry, but I encountered an error processing your query.",
                "domain": "error",
                "tokens_used": 0,
                "model": "gpt-4"
            }
    
    def _generate_system_prompt(self, domain: str) -> str:
        """
        Generate context-specific system prompt
        
        :param domain: Detected domain for the query
        :return: Tailored system prompt
        """
        domain_prompts = {
            "general": """
            You are a helpful AI assistant. 
            Provide clear, concise, and accurate responses.
            """,
            "technical": """
            You are a technical AI assistant with expertise in multiple domains. 
            Provide precise, detailed technical explanations.
            Use industry-standard terminology and be as specific as possible.
            """,
            "creative": """
            You are a creative AI assistant. 
            Provide imaginative, engaging, and inspiring responses.
            Think outside the box and offer unique perspectives.
            """
        }
        
        # Default to general prompt if domain not recognized
        return domain_prompts.get(domain, domain_prompts["general"]) + f"""
        Current Domain: {domain}
        Maintain a professional and helpful tone.
        """
