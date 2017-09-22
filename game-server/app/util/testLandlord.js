let landlord = require('./landlordUtil.js');
let random = require('./randomUtil');

// console.log(landlord.initPoker());

/**
 * 随机生成 1到17张牌，可能17张牌都相同
 *
 * @param min {Number} 最少牌数 , 默认为1
 * @param max {Number} 最多牌数 ， 默认为17
 * @return {Array}
 */
function generatePokers(min, max) {
    let n = min || 1;
    let m = max || 17;
    let num = random.generateIntRandom(n, m);
    let pokers = [];
    for (let i = 0; i < num; i++) {
        pokers.push({point: random.generateIntRandom(3, 17)})
    }
    return pokers;
}

/**
 * 打印牌组
 * @param pokers
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

/**
 * 总体测试 牌组类型
 */
function testPokerType() {
    for (let i = 0; i < 100; i++) {
        let pokers = generatePokers();

        if (landlord.isDan(pokers)) {
            printPokers(pokers, '单张');

        } else if (landlord.isDuiZi(pokers)) {
            printPokers(pokers, '对子');

        } else if (landlord.isSanBuDai(pokers)) {
            printPokers(pokers, '三不带');

        } else if (landlord.isSanDaiYi(pokers)) {
            printPokers(pokers, '三带一');

        } else if (landlord.isShunZi(pokers)) {
            printPokers(pokers, '顺子');

        } else {
            // printPokers(pokers, '啥也不是');
        }
    }
}


//测试顺子
function testShunZi() {
    for (let i = 0; i < 1000; i++) {
        let pokers = generatePokers();

        if (landlord.isShunZi(pokers)) {
            printPokers(pokers, '顺子');
        }
    }
}

testShunZi();