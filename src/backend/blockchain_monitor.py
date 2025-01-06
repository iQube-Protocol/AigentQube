import requests
from web3 import Web3
import logging
from typing import Dict, List, Optional

class MetisBlockchainMonitor:
    def __init__(self, metis_api_key: str, wallet_address: str):
        """
        Initialize Metis Blockchain Monitor
        
        :param metis_api_key: API key for Metis blockchain services
        :param wallet_address: Ethereum wallet address to monitor
        """
        self.api_key = metis_api_key
        self.wallet_address = Web3.to_checksum_address(wallet_address)
        self.metis_base_url = "https://api.metis.io/v1"
        
        # Configure Web3 provider
        self.web3 = Web3(Web3.HTTPProvider('https://metis-mainnet.public.blastapi.io'))
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def get_wallet_balance(self, token_contract_address: Optional[str] = None) -> float:
        """
        Retrieve wallet balance for native or ERC-20 token
        
        :param token_contract_address: Optional contract address for specific token
        :return: Balance of the token
        """
        try:
            if token_contract_address:
                # ERC-20 token balance
                contract_address = Web3.to_checksum_address(token_contract_address)
                contract = self.web3.eth.contract(address=contract_address, abi=self._get_erc20_abi())
                
                token_balance = contract.functions.balanceOf(self.wallet_address).call()
                token_decimals = contract.functions.decimals().call()
                
                return token_balance / (10 ** token_decimals)
            else:
                # Native token (METIS) balance
                balance = self.web3.eth.get_balance(self.wallet_address)
                return Web3.from_wei(balance, 'ether')
        except Exception as e:
            self.logger.error(f"Error retrieving wallet balance: {e}")
            return 0.0
    
    def get_token_transactions(self, token_contract_address: str, limit: int = 50) -> List[Dict]:
        """
        Retrieve recent token transactions for a specific contract
        
        :param token_contract_address: Contract address of the token
        :param limit: Maximum number of transactions to retrieve
        :return: List of recent transactions
        """
        try:
            endpoint = f"{self.metis_base_url}/wallets/{self.wallet_address}/tokens/{token_contract_address}/transactions"
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                endpoint, 
                headers=headers,
                params={'limit': limit}
            )
            
            response.raise_for_status()
            return response.json().get('transactions', [])
        except requests.RequestException as e:
            self.logger.error(f"Error retrieving token transactions: {e}")
            return []
    
    def analyze_wallet_activity(self, tracked_tokens: Optional[List[str]] = None) -> Dict:
        """
        Comprehensive wallet activity analysis
        
        :param tracked_tokens: Optional list of token contract addresses to track
        :return: Dictionary of wallet activity metrics
        """
        try:
            tracked_tokens = tracked_tokens or []
            
            # Native token balance
            native_balance = self.get_wallet_balance()
            
            # Token balances
            token_balances = {
                token: self.get_wallet_balance(token)
                for token in tracked_tokens
            }
            
            # Aggregate transactions
            all_transactions = []
            for token in tracked_tokens:
                all_transactions.extend(self.get_token_transactions(token))
            
            # Calculate metrics
            activity_metrics = {
                'native_balance': native_balance,
                'token_balances': token_balances,
                'total_transaction_volume': self._calculate_transaction_volume(all_transactions),
                'activity_score': self._calculate_activity_score(all_transactions)
            }
            
            return activity_metrics
        except Exception as e:
            self.logger.error(f"Error analyzing wallet activity: {e}")
            return {}
    
    def _calculate_transaction_volume(self, transactions: List[Dict]) -> float:
        """
        Calculate total transaction volume
        
        :param transactions: List of transactions
        :return: Total transaction volume
        """
        return sum(
            transaction.get('value', 0) 
            for transaction in transactions
        )
    
    def _calculate_activity_score(self, transactions: List[Dict]) -> float:
        """
        Generate a wallet activity score
        
        :param transactions: List of transactions
        :return: Activity score between 0-100
        """
        transaction_count = len(transactions)
        volume = self._calculate_transaction_volume(transactions)
        
        # Simple activity scoring mechanism
        return min(
            (transaction_count * volume) / 10000, 
            100  # Cap at 100
        )
    
    def _get_erc20_abi(self) -> List[Dict]:
        """
        Minimal ERC-20 ABI for balance and decimal queries
        
        :return: List of ABI function definitions
        """
        return [
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            }
        ]
