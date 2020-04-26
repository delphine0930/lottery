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

    enum BlockStatus {Checkable, NotRevealed, BlockLimitPassed}

    event BET(uint256 index, address bettor, uint256 amount, byte challenges, uint256 answerBlockNumber);
    constructor() public {
        owner = msg.sender;
    }

    // smart contract 내부 값을 볼 때는 view 를 이용
    function getPot() public view returns (uint256 pot) {
        return _pot;
    }

    // Bet
    
    /**
     * @dev 베팅을 한다. 유저는 0.005 ETH 와 함께 1 bytr 글자를 보낸다.
     * 큐에 저장된 베팅 정보는 이후 distribute 함수에서 해결
     * @param challenges 유저가 베팅하는 글자
     * @return 함수가 잘 수행되었는지 확인하는 bool 값
     */

    // 사람이 베팅할 때 돈을 보내니까 payable
    function bet(byte challenges) public payable returns (bool result){
        // Check the proper ether is sent
        require(msg.value == BET_AMOUT, "Not enough ETH");
        
        // Push bet to the queue
        require(pushBet(challenges), "Fail to add a new Bet Info");
        
        // Emit event
        emit BET(_tail-1, msg.sender, msg.value, challenges, block.number + BET_BLOCK_INTERVAL);

        return true;
    }

    // Distribute (분배)
    function distribute() public {
        uint256 cur;
        BetInfo memory b;
        BlockStatus currentBlockStatus;

        for(cur = _head; cur < _tail; cur++){
            b = _bets[cur];
            currentBlockStatus = getBlockStatus(b.answerBlockNumber);
            // 확인!
            if(currentBlockStatus == BlockStatus.Checkable){
                // if win, bettor gets pot
                

                // if fail, bettor's money goes pot

                // if draw, refund bettor's money
            }

            // block hash를 확인할 수 없을 때
            // 1.아직 마이닝 안됐을 떄
            if(currentBlockStatus == BlockStatus.NotRevealed){
                break; // 뒤에도 어차피 없으니까
            }
            // 2.너무 예전 블록일 때
            if(currentBlockStatus == BlockStatus.BlockLimitPassed){
                // refund
                // emit refund
            }
            popBet(cur);

        }
    }

    function getBlockStatus(uint256 answerBlockNumber) internal view returns(BlockStatus) {
        if(answerBlockNumber < block.number && block.number < BLOCK_LIMIT + answerBlockNumber) {
            return BlockStatus.Checkable;
        }
        if(answerBlockNumber >= block.number) {
            return BlockStatus.NotRevealed;
        }
        if(block.number >= BLOCK_LIMIT + answerBlockNumber) {
            return BlockStatus.BlockLimitPassed;
        }

        // 에러나면 그냥 환불해주는거지..
        return BlockStatus.BlockLimitPassed;
    }

    function getBetInfo(uint256 index) public view returns (uint256 answerBlockNumber, address bettor, byte challenges) {
        BetInfo memory b = _bets[index];
        answerBlockNumber = b.answerBlockNumber;
        bettor = b.bettor;
        challenges = b.challenges;
    }

    function pushBet(byte challenges) internal returns (bool) {
        BetInfo memory b;
        b.bettor = msg.sender;
        b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL;
        b.challenges = challenges;

        _bets[_tail] = b;
        _tail++;

        return true;
    }

    function popBet(uint256 index) internal returns (bool) {
        // delete 를 하면 gas를 돌려받게 된다.
        delete _bets[index];
        return true;
    }
}