const Lottery = artifacts.require("Lottery");

// user 는 ganache-cli 에서 만들어준 10개가 순서대로 들어감
// mocah 
contract('Lottery', function([deployer, user1, user2]){

    let lottery;

    beforeEach(async () => {
        console.log(`Before each`)
        lottery = await Lottery.new(); // 배포
    })

    it(`Basic test`, async () => {
        console.log(`Basic test`)
        let owner = await lottery.owner();
        let value = await lottery.getSomeValue();

        console.log(`owner : ${owner}`);
        console.log(`value : ${value}`);
        assert.equal(value, 5);
    })
});