const Lottery = artifacts.require("Lottery");
const assertRevert = require(`./assertRevert`);
const expectEvent = require('./expectEvent');

// user 는 ganache-cli 에서 만들어준 10개가 순서대로 들어감
// mocah 
contract('Lottery', function([deployer, user1, user2]){

    let lottery;
    let betAmount = 5000000000000000;
    let blockInterval = 3;
    let betAmountBN = new web3.utils.BN('5000000000000000');

    beforeEach(async () => {
        lottery = await Lottery.new(); // 배포
    })

    it(`getPot return current pot`, async () => {
        let pot = await lottery.getPot();
        assert.equal(pot, 0);
    })

    describe('Bet', function () {
        it(`Bet queue 에 1 bet 이 들어간다.`, async () => {
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
    
    describe.only('Distribute', function () {
        describe('Answer is checkable', function() {
            it('answer is match, user get pot', async () => {
                // betAndDistribute
                await lottery.setAnswerForTest('0xccd017c09b9608988e40f0da89ce04d80811fbfb6d18938b6bef2d92c4d22563', {from:deployer});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xcc', {from:user1, value:betAmount});
                // user1 이 맞추려면 3 block 뒤 즉, 4 block이 mining 되어야 하므로 4개 더
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potBefore = await lottery.getPot();
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                let receiptNext4 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potAfter = await lottery.getPot();
                let user1BalanceAfter = await web3.eth.getBalance(user1);

                // pot의 변화 확인
                assert.equal(potBefore.toString(), new web3.utils.toBN(betAmountBN * 2).toString()); // 맞추기전에 2개 Tx
                assert.equal(potAfter.toString(), new web3.utils.toBN(0).toString() ); // 맞췄으면 없어저야지

                // user balance 확인
                user1BalanceBefore = new web3.utils.toBN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), new web3.utils.toBN(user1BalanceAfter).toString());
            })
            it('single character of answer is match, user get the amount which user bet', async () => {
                // betAndDistribute
                await lottery.setAnswerForTest('0xccd017c09b9608988e40f0da89ce04d80811fbfb6d18938b6bef2d92c4d22563', {from:deployer});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xca', {from:user1, value:betAmount});
                // user1 이 맞추려면 3 block 뒤 즉, 4 block이 mining 되어야 하므로 4개 더
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potBefore = await lottery.getPot();
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                let receiptNext4 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potAfter = await lottery.getPot();
                let user1BalanceAfter = await web3.eth.getBalance(user1);

                // pot의 변화 확인
                assert.equal(potAfter.toString(), potBefore.toString()); // 돌려 받았기에 그대로

                // user balance 확인
                user1BalanceBefore = new web3.utils.toBN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.add(betAmountBN).toString(), new web3.utils.toBN(user1BalanceAfter).toString());
            })
            it('answer is not match, the amout which user bet transfer to pot', async () => {
                // betAndDistribute
                await lottery.setAnswerForTest('0xccd017c09b9608988e40f0da89ce04d80811fbfb6d18938b6bef2d92c4d22563', {from:deployer});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xaa', {from:user1, value:betAmount});
                // user1 이 맞추려면 3 block 뒤 즉, 4 block이 mining 되어야 하므로 4개 더
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potBefore = await lottery.getPot();
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                let receiptNext4 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potAfter = await lottery.getPot();
                let user1BalanceAfter = await web3.eth.getBalance(user1);

                // pot의 변화 확인
                assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString()); // pot에는 배팅 금액만 더해짐

                // user balance 확인
                assert.equal(user1BalanceBefore, user1BalanceAfter);
            });
        });

        describe('Answer is not revealed(Not Mining', function() {
            it('answer block is not comming', async () => {
                // betAndDistribute
                await lottery.setAnswerForTest('0xccd017c09b9608988e40f0da89ce04d80811fbfb6d18938b6bef2d92c4d22563', {from:deployer});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});
                await lottery.betAndDistribute('0xaa', {from:user1, value:betAmount});
                // mining 안되도록

                let potBefore = await lottery.getPot();
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                let receiptNext = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount});

                let potAfter = await lottery.getPot();
                let user1BalanceAfter = await web3.eth.getBalance(user1);

                // pot의 변화 확인
                assert.equal(potBefore.toString(), potAfter.toString()); // 확인 못하면 돌렵다으니까

                // user balance 확인
                assert.equal(user1BalanceBefore, user1BalanceAfter);
            })
        })
        
        describe('Answer is not checkable', function() {
            it()
        })
    })

    describe('isMatch', function () {
        let blockHash = '0xccd017c09b9608988e40f0da89ce04d80811fbfb6d18938b6bef2d92c4d22563';
        let matchingResult;
        it('두개 문자가 같으면 win', async () => {
            matchingResult = await lottery.isMatch('0xcc', blockHash);
            assert.equal(matchingResult, 1);
        })

        it('한개 문자가 같으면 draw', async () => {
            matchingResult = await lottery.isMatch('0xca', blockHash);
            assert.equal(matchingResult, 2);
            matchingResult = await lottery.isMatch('0xac', blockHash);
            assert.equal(matchingResult, 2);
        })

        it('문자가 다르면 fail', async () => {
            matchingResult = await lottery.isMatch('0xaa', blockHash);
            assert.equal(matchingResult, 0);
        })
    })
});