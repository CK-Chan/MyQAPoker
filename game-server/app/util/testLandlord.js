let landlord = require('./landlordUtil.js');
let random = require('./randomUtil');

// console.log(landlord.initPoker());

/**
 * 随机生成 1到17张牌，可能17张牌都相同
 *
 * @param min {Number} 最少牌数 , 默认为3
 * @param max {Number} 最多牌数 ， 默认为17
 * @return {Array}
 */
function generatePokers(min, max) {
    let n = min || 3;
    let m = max || 17;
    let num = random.generateIntRandom(n, m);
    let type = random.generateIntRandom(0, 3);
    let pokers = [];
    for (let i = 0; i < num; i++) {
        pokers.push({point: random.generateIntRandom(n, m), type: type});
    }
    return pokers;
}

/**
 * 打印牌组
 * @param pokers
 * @param describe {String} 牌组说明信息
 */
function printPokers(pokers, describe) {
    let arr = [];
    pokers.forEach(function (poker, index, array) {
        arr.push(poker.point);
    });
    arr.sort(function (a, b) {
        return a - b;
    });
    console.log(describe + " : ", arr);
}

/**
 * 查看分牌结果
 */
function testDistributeResult() {
    // playerPokers {Array} [[] ,[], []]

    let playerPokers = landlord.distribute(landlord.shuffle(landlord.initPoker()));

    playerPokers.forEach(function (item, index, array) {
        // console.log(item);

        let arr = [];
        item.forEach(function (item, index, array) {
            arr.push(item.point);
        });
        console.log(arr);
        console.log(arr.length);
    })
}

// testDistributeResult();

function testIsContinuous() {
    let random1 = random.generateIntRandom(3, 17);
    let random2 = random.generateIntRandom(3, 15);
    let random3 = random.generateIntRandom(3, 15);
    let random4 = random.generateIntRandom(3, 15);
    let poker1 = {point: random1};
    let poker2 = {point: random2};
    let poker3 = {point: random3};
    let poker4 = {point: random4};

    if (landlord.isContinuous([poker1, poker2, poker3])) {
        console.log(random1 + '  ' + random2 + ' ' + random3);
    }
}

//测试顺子
function testShunZi() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers();

        if (landlord.isContinuousPoker(pokers)) {
            printPokers(pokers, '顺子');
        }
    }
}

//测试炸弹
function testZhaDan() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers(3, 5);

        if (landlord.isBomb(pokers)) {
            printPokers(pokers, '炸弹');
        }
    }
}

//测试王炸
function testDuiWang() {
    for (let i = 0; i < 1000; i++) {
        let pokers = generatePokers(1, 4);

        if (landlord.isJokerBomb(pokers)) {
            printPokers(pokers, '王炸');
        }
    }
}

//测试连对
function testLianDui() {
    for (let i = 0; i < 100000; i++) {
        let pokers = generatePokers(4, 17);
        // let pokers = [{point:13},{point:13},{point:14},{point:14},{point:15},{point:15}];

        if (landlord.isDoubleContinuousPoker(pokers)) {
            printPokers(pokers, '连对');
        }
    }
}

//测试飞机不带
function testFeiJiBuDai() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers(5, 15);
        // let pokers = [{point:5},{point:5},{point:5},
        //     {point:6},{point:6},{point:6},
        //     {point:4},{point:4},{point:4}];

        if (landlord.isAirplaneWithNone(pokers)) {
            printPokers(pokers, '飞机不带');
        }
    }
}

//测试飞机带翅膀
function testFeiJiDaiChiBang() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers(7, 16);
        // let pokers = [{point:3},{point:3},{point:3},
        //     {point:13},{point:13},{point:13},
        //     {point:14},{point:14},{point:14},
        //     {point:15},{point:15},{point:15}];

        if (landlord.isAirplaneWithWing(pokers)) {
            printPokers(pokers, '飞机带翅膀');
        }
    }
}

//测试 飞机
function testIsAirplane() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers(2, 17);
        // let pokers = [{point:5},{point:5},{point:5},
        //     {point:6},{point:6},{point:6},
        //     {point:4},{point:4},{point:4}];

        if (landlord.isAirplane(pokers)) {
            printPokers(pokers, '飞机');
        }
    }
}

//测试 4带2
function testSiDaiEr() {
    for (let i = 0; i < 10000; i++) {
        let pokers = generatePokers(6, 9);
        // let pokers = [{point:5},{point:5},{point:5},
        //     {point:6},{point:6},{point:6},
        //     {point:4},{point:4},{point:4}];

        if (landlord.isQuadrupleWithTwo(pokers)) {
            printPokers(pokers, '4带2');
        }
    }
}

//测试 3带1
function testSanDaiYi() {
    for (let i = 0; i < 1000; i++) {
        let pokers = generatePokers(3, 6);
        // let pokers = [{point:5},{point:5},{point:5},
        //     {point:6},{point:6},{point:6},
        //     {point:4},{point:4},{point:4}];

        if (landlord.isTripleWithOne(pokers)) {
            printPokers(pokers, '3带1');
        }
    }
}

//测试 查出牌组中，指定张数的牌的最大点数
function testGetRepeatMostPoker() {
    let pokers = generatePokers(2, 17);
    // let pokers = [{point: 5}, {point: 5}, {point: 5},
    //     {point: 10}, {point: 12}, {point: 13},
    //     {point: 15}, {point: 15}, {point: 15}];
    let number = 3;
    printPokers(pokers, '牌组' + pokers.length + '张 ');
    let result = landlord.getRepeatMostPoker(pokers, number);
    console.log('查找结果 : ' + result + ' 是出现' + number + '张的最大点数');
}

/**
 * 测试 牌组类型
 */
function testPokerType() {
    for (let i = 0; i < 1; i++) {
        let pokers = generatePokers(1, 8);
        // let pokers = [{point: 13}, {point: 13}, {point: 13}, {point: 13}, {point: 14}, {point: 14}, {point: 14}, {point: 14}];
        let res = landlord.getPokersType(pokers);

        printPokers(pokers, '牌组类型: ' + res);
    }
}

//测试 两次出牌的大小
function testCompareTwoPokers() {
    // let pokers1 = generatePokers(2, 17);
    // let pokers2 = generatePokers(2, 17);
    let pokers1 = getPoker(3, 3, 3, 4, 4, 4, 16, 16);
    let pokers2 = getPoker(5, 5, 5, 6, 6, 6, 11, 12);

    let result = landlord.compareTwoPokers(pokers1, landlord.getPokersType(pokers1), pokers2, landlord.getPokersType(pokers2));
    printPokers(pokers1, '上家牌组');
    printPokers(pokers2, '我方牌组');
    console.log('我方牌组更大么? ' + result);
}

// 传入需要的扑克牌点数，生成牌组
function getPoker() {
    let res = [];

    for (let i = 0; i < arguments.length; i++) {
        res.push({point: arguments[i]});
    }
    return res;
}

/**
 * 测试 牌组排序
 */
function testPokerType() {
    for (let i = 0; i < 1; i++) {
        // let pokers = generatePokers(2, 8);
        let pokers = [{point: 13, type: 3},
            {point: 13, type: 0},
            {point: 16, type: 2},
            {point: 13, type: 1},
            {point: 10, type: 1},
            {point: 16, type: 1},
            {point: 16, type: 0},
            {point: 14, type: 1}];
        console.log('牌组排序前 ', pokers);
        landlord.sortPokers(pokers);

        console.log('牌组排序后 ', pokers);
    }
}

// testZhaDan();
// testDuiWang();
// testSanDaiYi();
// testShunZi();
// testLianDui();
// testFeiJiBuDai();
// testFeiJiDaiChiBang();
// testSiDaiEr();
// testIsAirplane();

// testGetRepeatMostPoker();
// testPokerType();
// testCompareTwoPokers();
// testDistributeResult();
testPokerType();