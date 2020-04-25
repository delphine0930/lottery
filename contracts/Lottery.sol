pragma solidity >=0.4.21 <0.7.0;

contract Lottery {
    struct BetInfo {
        uint256 answerBlockNumber;
        address payable bettor; // payble 을 넣어야지 여기로 돈을 보낼 수 있음
        byte challenges;
    }

    // public 으로 만들면 자동으로 getter 를 만들어줌
    address public owner;
    
    uint256 private _pot;

    // smart contract 안에서만 사용하니까 internal
    uint256 constant internal BET_AMOUT = 5 * 10 ** 15; // 0.005 ETH
    uint256 constant internal BET_BLOCK_INTERVAL = 3;
    uint256 constant internal BLOCK_LIMIT = 256;

    // queue 로 block 담기
    mapping(uint256 => BetInfo) private _bets;
    uint256 private _tail;
    uint256 private _head;

    constructor() public {
        owner = msg.sender;
    }

    function getSomeValue() public pure returns(uint256 value) {
        return 5;
    }

    // smart contract 내부 값을 볼 때는 view 를 이용
    function getPot() public view returns (uint256 pot) {
        return _pot;
    }

    // Bet
      // save the bet to the queue

    // Distribute (분배)
      // check the answer

    function getBetInfo(uint256 index) public view returns (uint256 answerBlockNumber, address bettor, byte challenges) {
        BetInfo memory b = _bets[index];
        answerBlockNumber = b.answerBlockNumber;
        bettor = b.bettor;
        challenges = b.challenges;
    }

    function pushBet(byte challenges) public returns (bool) {
        BetInfo memory b;
        b.bettor = msg.sender;
        b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
        b.challenges = challenges;

        _bets[_tail] = b;
        _tail++;

        return true;
    }

    function popBet(uint256 index) public returns (bool) {
        // delete 를 하면 gas를 돌려받게 된다.
        delete _bets[index];
        return true;
    }
}