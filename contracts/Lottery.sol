pragma solidity >=0.4.21 <0.7.0;

contract Lottery {
    // public 으로 만들면 자동으로 getter 를 만들어줌
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    function getSomeValue() public pure returns(uint256 value) {
        return 5;
    }
}