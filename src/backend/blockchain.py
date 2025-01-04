import os
from typing import Dict, Any

from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv

load_dotenv()

class BlockchainInteraction:
    def __init__(self, network_url: str = None):
        """
        Initialize blockchain connection
        
        :param network_url: Blockchain network URL (Sepolia testnet by default)
        """
        self.network_url = network_url or os.getenv(
            'NETWORK_URL', 
            'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
        )
        
        self.w3 = Web3(Web3.HTTPProvider(self.network_url))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Contract interaction setup
        self.contract_address = os.getenv('TOKEN_QUBE_CONTRACT_ADDRESS')
        self.contract_abi = self._load_contract_abi()
        
        if self.w3.is_connected():
            self.contract = self.w3.eth.contract(
                address=self.contract_address, 
                abi=self.contract_abi
            )
        else:
            raise ConnectionError("Could not connect to blockchain network")
    
    def _load_contract_abi(self) -> list:
        """
        Load contract ABI from JSON file
        
        :return: Contract ABI as list
        """
        import json
        abi_path = os.getenv(
            'CONTRACT_ABI_PATH', 
            'contracts/TokenQube.json'
        )
        
        try:
            with open(abi_path, 'r') as abi_file:
                return json.load(abi_file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Contract ABI not found at {abi_path}")
    
    def create_iqube_token(self, owner_address: str, metadata: Dict[str, Any]) -> str:
        """
        Create a new iQube token on blockchain
        
        :param owner_address: Blockchain address of token owner
        :param metadata: iQube token metadata
        :return: Transaction hash of token creation
        """
        # Placeholder for actual token creation logic
        # This would interact with the smart contract's token creation method
        try:
            txn = self.contract.functions.createToken(
                owner_address,
                str(metadata)  # Convert metadata to string for storage
            ).build_transaction({
                'from': owner_address,
                'nonce': self.w3.eth.get_transaction_count(owner_address),
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(
                txn, 
                private_key=os.getenv('OWNER_PRIVATE_KEY')
            )
            
            txn_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            return txn_hash.hex()
        
        except Exception as e:
            raise RuntimeError(f"Token creation failed: {e}")
    
    def get_iqube_token_details(self, token_id: str) -> Dict[str, Any]:
        """
        Retrieve details of an existing iQube token
        
        :param token_id: Unique identifier of the iQube token
        :return: Token details dictionary
        """
        try:
            token_details = self.contract.functions.getTokenDetails(token_id).call()
            return {
                'owner': token_details[0],
                'metadata': token_details[1],
                'creation_timestamp': token_details[2]
            }
        except Exception as e:
            raise RuntimeError(f"Could not retrieve token details: {e}")

# Example usage
if __name__ == "__main__":
    blockchain = BlockchainInteraction()
    print("Blockchain Connection Status:", blockchain.w3.is_connected())
