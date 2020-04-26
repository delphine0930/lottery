const Lottery = artifacts.require("Lottery");
const assertRevert = require(`./assertRevert`);
const expectEvent = require('./expectEvent');

// user 는 ganache-cli 에서 만들어준 10개가 순서대로 들어감
// mocah 
contract('Lottery', function([deployer, user1, user2]){

    let lottery;
    let betAmount = 5000000000000000;
    let blockInterval = 3;

    beforeEach(async () => {
        lottery = await Lottery.new(); // 배포
    })

    it(`getPot return current pot`, async () => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0);
    })

    describe('Bet', function () {
        it.only(`Bet queue 에 1 bet 이 들어간다.`, async () => {
            // bet
            let receipt = await lottery.bet("0xab", {from : user1, value: betAmount});

            let pot = await lottery.getPot();
            assert.equal(pot, 0); // 아직 확인 안됐으니까

            // check contract balance == 0.005
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount); // 넣은거 잘 들어갔는지

            // check bet info
            let currentBlockNumber = await web3.eth.getBlockNumber();
            let bet = await lottery.getBetInfo(0); // 첫번째는 0번에 들어갔을 거얌
            assert.equal(bet.answerBlockNumber, currentBlockNumber + blockInterval);
            assert.equal(bet.bettor, user1);
            assert.equal(bet.challenges, "0xab");

            // check log
            console.log(receipt.logs);
            await expectEvent.inLogs(receipt.logs, 'BET');
        })

        it(`0.005 ETH 가 안들어오면 fail`, async () => {
            // fail transaction
            await assertRevert(lottery.bet("0xab", {from : user1, value: 4000000000000}))
        })  
    })
});