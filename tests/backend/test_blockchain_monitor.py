import pytest
import asyncio
from src.backend.blockchain_monitor import MetisBlockchainMonitor

@pytest.mark.asyncio
async def test_blockchain_monitor_initialization():
    """
    Test MetisBlockchainMonitor initialization
    """
    monitor = MetisBlockchainMonitor(
        api_key='test_key', 
        wallet_address='0x1234567890123456789012345678901234567890'
    )
    
    assert monitor is not None
    assert monitor.api_key == 'test_key'
    assert monitor.wallet_address == '0x1234567890123456789012345678901234567890'

@pytest.mark.asyncio
async def test_get_wallet_balance():
    """
    Test wallet balance retrieval
    """
    monitor = MetisBlockchainMonitor(
        api_key='test_key', 
        wallet_address='0x1234567890123456789012345678901234567890'
    )
    
    balance = await monitor.get_wallet_balance()
    
    assert isinstance(balance, float)
    assert balance >= 0

@pytest.mark.asyncio
async def test_analyze_wallet_activity():
    """
    Test wallet activity analysis
    """
    monitor = MetisBlockchainMonitor(
        api_key='test_key', 
        wallet_address='0x1234567890123456789012345678901234567890'
    )
    
    activity_metrics = monitor.analyze_wallet_activity()
    
    assert isinstance(activity_metrics, dict)
    assert 'activity_score' in activity_metrics
    assert 'total_transaction_volume' in activity_metrics
    assert 0 <= activity_metrics['activity_score'] <= 100
