// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Presale is Ownable {
    IERC20 public token;
    uint256 public rate; // Сколько токенов за 1 ETH (например, 1000)
    bool public isPaused;

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);

    constructor(address _token, uint256 _rate) Ownable(msg.sender) {
        token = IERC20(_token);
        rate = _rate;
        isPaused = false;
    }

    // Покупка токенов за ETH
    function buyTokens() public payable {
        require(!isPaused, "Presale is paused");
        require(msg.value > 0, "Send ETH to buy");

        // Расчет количества токенов: ETH * rate
        uint256 tokenAmount = msg.value * rate;

        // Проверка, хватит ли токенов в контракте
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= tokenAmount, "Not enough tokens in presale wallet");

        // Отправка токенов покупателю
        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    // Изменить курс (только владелец)
    function setRate(uint256 _newRate) external onlyOwner {
        rate = _newRate;
    }

    // Поставить на паузу (только владелец)
    function setPaused(bool _state) external onlyOwner {
        isPaused = _state;
    }

    // Вывести ETH (только владелец)
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Вывести оставшиеся токены (только владелец)
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner(), balance);
    }

    // Чтобы контракт мог принимать ETH напрямую
    receive() external payable {
        buyTokens();
    }
}
