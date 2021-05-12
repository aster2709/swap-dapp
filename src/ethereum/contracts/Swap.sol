//SPDX-License-Identifier: MIT 
pragma solidity ^0.8;
import "https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract Swap {
    address constant ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniswapV2Router01 router = IUniswapV2Router01(ROUTER_ADDRESS);
    
    mapping (address => uint) deposits;
    mapping (address => bool) depositers;
    
    event Swapped(address indexed swapper, uint timestamp);
    event Withdraw(address indexed swapper, uint timestamp);
    
    function swap(address _tokenAddress, uint _amount) external payable {
        require(IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount), "transferFrom failed");
        require(IERC20(_tokenAddress).approve(ROUTER_ADDRESS, _amount), 'approve failed');
        address[] memory path = new address[](2);
        path[0] = _tokenAddress;
        path[1] = router.WETH();
        uint[] memory amounts = router.swapExactTokensForETH(_amount, 1, path, address(this), block.timestamp);
        deposits[msg.sender] += amounts[1];
        depositers[msg.sender] = true;
        emit Swapped(msg.sender, block.timestamp);
    }
    
    receive() external payable {}
    
    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }
    
    function getBalance() external view returns (uint) {
        return deposits[msg.sender];
    }
    
    function withdrawBalance() external {
        require(depositers[msg.sender], "you do not have any deposits");
        (bool success, ) = msg.sender.call{value: deposits[msg.sender]}("");
        require(success, "withdraw failed");
        deposits[msg.sender] = 0;
        depositers[msg.sender] = false;
    }
}