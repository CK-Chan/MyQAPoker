/**
 * 斗地主的工具方法, 包括 提供一副牌、洗牌、发牌、牌型判断、比较手牌
 */

let landlord = module.exports;

/**
 * 返回一副牌组
 *
 * 单张牌格式为: { point , type}
 * point点数，[3,17] ,其中A为14点, 2为15点，小王16点，大王17
 * type花色，0黑桃，1红桃，2梅花，3方块，50小王，100大王
 *
 * @return {Array} 返回一副扑克牌.
 */
landlord.initPoker = function () {
    let pookers = [];

    for (let i = 0; i < 4; i++) {       // 准备好一副牌
        for (let j = 3; j < 16; j++) {
            pookers.push({
                "point": j,
                "type": i
            });
        }
    }
    pookers.push({"point": 16, "type": 50});
    pookers.push({"point": 17, "type": 100});

    return pookers;
};

/**
 * 洗牌
 *
 * @param pokers {Array} 待打乱的牌组，数组是引用传值，所以不需要返回数组.
 * @param times {Number} 清洗次数.
 */
landlord.shuffle = function (pokers, times) {
    times = times || 3;

    for (let i = 0; i < times; i++) {
        pokers.sort(function () {
                return Math.random() > 0.5 ? 1 : -1;
            }
        )
    }
    return pokers;
};

/**
 * 发牌
 *
 * @param  pokers {Array}  待发的牌组.
 * @return {Array} 返回数组格式为 [[], [], [] ,[]]  前三个是玩家的牌，最后一个是地主的三张牌
 */
landlord.distribute = function (pokers) {
    let playerPokers = [[], [], []];

    for (let i = 0; i < playerPokers.length; i++) {
        for (let j = 0; j < 17; j++) {
            playerPokers[i].push(pokers.pop());
        }
    }

    let threePokers = [];
    for (let i = 0; i < 3; i++) {
        threePokers.push(pokers.pop());
    }
    playerPokers.push(threePokers);

    playerPokers.forEach(function (pokers) {
        sortPokers(pokers);
    });

    return playerPokers;
};

/**
 * 扑克牌是否合法
 *
 * @param poekrs {Array}
 * @return {boolean} true为合法 , false为不合法
 */
landlord.isLegalPokers = function (poekrs) {
    let result = true;
    for (let i = 0; i < poekrs.length; i++) {
        if (!poekrs[i] || !poekrs[i].point || !poekrs[i].type) {
            result = false;
            break;
        }
    }
    return result;
};

/**
 * 是否 单张
 */
landlord.isOne = function (pokers) {
    return !!(pokers && pokers.length === 1);
};

/**
 * 是否 对子
 */
landlord.isDouble = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 2 && isSamePoint(pokers));
};

/**
 * 是否 三不带
 */
landlord.isTripleWithNone = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 3 && isSamePoint(pokers));
};

/**
 * 是否 三带一(或一对)
 * 注意炸弹不是三带一
 */
landlord.isTripleWithOne = function (pokers) {
    // 排除炸弹
    if (!pokers || !pokers.length || (pokers.length !== 4 && pokers.length !== 5) || isSamePoint(pokers)) {
        return false;
    }

    sortPokers(pokers);

    if (pokers.length === 4) {
        return isSamePoint(pokers.slice(0, 3)) || isSamePoint(pokers.slice(1));

    } else if (pokers.length === 5) {
        return (isSamePoint(pokers.slice(0, 3)) && isSamePoint(pokers.slice(3))) || (isSamePoint(pokers.slice(2)) && isSamePoint(pokers.slice(0, 2)));

    } else {
        return false;
    }

};

/**
 * 是否 顺子（单顺）
 * 顺子牌的个数为 5到12张
 */
landlord.isContinuousPoker = function (pokers) {
    if (!pokers || !pokers.length || pokers.length < 5 || pokers.length > 12) {
        return false;
    }

    sortPokers(pokers);

    return isContinuous(pokers);
};

/**
 * 是否 炸弹
 */
landlord.isBomb = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 4 && isSamePoint(pokers));
};

/**
 * 是否 王炸
 */
landlord.isJokerBomb = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 2 && (pokers[0].point + pokers[1].point === 33));
};

/**
 * 是否 连对(双顺)
 */
landlord.isDoubleContinuousPoker = function (pokers) {
    if (!pokers || !pokers.length || pokers.length < 6 || (pokers.length % 2 !== 0)) {
        return false;
    }

    sortPokers(pokers);

    // 排除 对2
    if (pokers[pokers.length - 1].point > 14) {
        return false;
    }

    let result = true;
    let selectPokers = [];

    //第1和第2、第3和第4....点数相同 ； 第1和第3、第3和第5.... 点数相差1
    for (let i = 0; i < pokers.length - 1; i += 2) {
        if ((pokers[i].point !== pokers[i + 1].point)) {
            result = false;
            break;
        }
        selectPokers.push(pokers[i])
    }

    result = result && isContinuous(selectPokers);

    return result;
};

/**
 * 是否 飞机不带(三顺)
 */
landlord.isAirplaneWithNone = function (pokers) {
    if (!pokers || !pokers.length || pokers.length < 6 || (pokers.length % 3 !== 0)) {
        return false;
    }

    sortPokers(pokers);

    // 排除 三个2
    if (pokers[pokers.length - 1].point > 14) {
        return false;
    }

    let result = true;
    let selectPokers = [];

    for (let i = 0; i < pokers.length - 2; i += 3) {
        if (!isSamePoint(pokers.slice(i, i + 3))) {
            result = false;
            break;
        }
        selectPokers.push(pokers[i])
    }
    result = result && isContinuous(selectPokers);

    return result;
};

/**
 * 是否 飞机带翅膀
 * 三顺 + 同数量的单牌或者同数量的对牌
 * 只有四种情况 : 2三顺+2单、2三顺+2对、3三顺+3单、3三顺+3对
 */
landlord.isAirplaneWithWing = function (pokers) {
    if (!pokers || !pokers.length) {
        return false;
    }

    let result = false;
    sortPokers(pokers);

    if (pokers.length === 8) {
        result = landlord.isAirplaneWithNone(pokers.slice(0, 6))
            || landlord.isAirplaneWithNone(pokers.slice(1, 7))
            || landlord.isAirplaneWithNone(pokers.slice(2));

    } else if (pokers.length === 10) {
        result = (landlord.isAirplaneWithNone(pokers.slice(0, 6)) && isSamePoint(pokers.slice(6, 8)) && isSamePoint(pokers.slice(8)))
            || (landlord.isAirplaneWithNone(pokers.slice(2, 8)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(8)))
            || (landlord.isAirplaneWithNone(pokers.slice(4)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(2, 4)));

    } else if (pokers.length === 12) {
        result = landlord.isAirplaneWithNone(pokers.slice(0, 9))
            || landlord.isAirplaneWithNone(pokers.slice(1, 10))
            || landlord.isAirplaneWithNone(pokers.slice(2, 11))
            || landlord.isAirplaneWithNone(pokers.slice(3));

    } else if (pokers.length === 15) {
        result = (landlord.isAirplaneWithNone(pokers.slice(0, 9)) && isSamePoint(pokers.slice(9, 11)) && isSamePoint(pokers.slice(11, 13)) && isSamePoint(pokers.slice(13)))
            || (landlord.isAirplaneWithNone(pokers.slice(2, 11)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(11, 13)) && isSamePoint(pokers.slice(13)))
            || (landlord.isAirplaneWithNone(pokers.slice(4, 13)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(2, 4)) && isSamePoint(pokers.slice(13)) )
            || (landlord.isAirplaneWithNone(pokers.slice(6)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(2, 4)) && isSamePoint(pokers.slice(4, 6)) );

    }

    return result;
};

/**
 * 是否 飞机
 */
landlord.isAirplane = function (pokers) {
    if (!pokers || !pokers.length) {
        return false;
    }

    return landlord.isAirplaneWithNone(pokers) || landlord.isAirplaneWithWing(pokers);
};

/**
 * 是否 4带2（两个单牌 或 两对）
 */
landlord.isQuadrupleWithTwo = function (pokers) {
    if (!pokers || !pokers.length) {
        return false;
    }

    let result = false;
    sortPokers(pokers);

    //是否有四张相同点数
    if (pokers.length === 6) {
        result = isSamePoint(pokers.slice(0, 4)) || isSamePoint(pokers.slice(1, 5)) || isSamePoint(pokers.slice(2));

    } else if (pokers.length === 8) {
        result = (isSamePoint(pokers.slice(0, 4)) && isSamePoint(pokers.slice(4, 6)) && isSamePoint(pokers.slice(6)))
            || (isSamePoint(pokers.slice(2, 6)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(6)))
            || (isSamePoint(pokers.slice(4)) && isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(2, 4)));

    }

    return result;
};

/**
 * 整理牌组 ,按点数point从小到大 , 同点数的按花色type从小到大排序（0黑桃，1红桃，2梅花，3方块，50小王，100大王）
 *
 * @param pokers
 * @return {*}
 */
function sortPokers(pokers) {
    pokers.sort(function (a, b) {
        if (a.point > b.point) {
            return 1;

        } else if (a.point === b.point && a.type > b.type) {
            return 1;

        } else {
            return 0;
        }
    });
    return pokers;
}

/**
 * 判断多张牌的点数是否都相同， 可以是 2、3、4、5... 张
 * 传入的牌是 从小到大排好序的
 */
function isSamePoint(pokers) {
    let number = pokers.length;

    if (!number || number < 2) {
        return false;
    }

    for (let i = 0; i < number - 1; i++) {
        if (pokers[i].point !== pokers[i + 1].point) {
            return false;
        }
    }
    return true;
}

/**
 * 判断 多张牌是否连续
 * 传入的牌是 从小到大排好序的 , 至少传入两张牌 ，相邻牌的point相差1
 * 不能有 2、小王、大王
 */
function isContinuous(pokers) {
    let number = pokers.length;

    if (!number || number < 2 || pokers[number - 1].point > 14) {
        return false;
    }

    for (let i = 0; i < number - 1; i++) {
        if ((pokers[i + 1].point - pokers[i].point) !== 1) {
            return false;
        }
    }
    return true;
}

/**
 * 牌组的类型
 */
landlord.PokersType = {
    ONE: "one",
    JOKER_BOMB: "jokerBomb",
    DOUBLE: "double",
    BOMB: "bomb",
    TRIPLE_WITH_ONE: "tripleWithOne",
    TRIPLE_WITH_NONE: "tripleWithNone",
    CONTINUOUS: "continuous",
    DOUBLE_CONTINUOUS: "doubleContinuous",
    QUADRUPLE_WITH_TWO: "quadrupleWithTwo",
    AIRPLANE_WITH_NONE: "airplaneWithNone",
    AIRPLANE_WITH_WING: "airplaneWithWing",
    ERROR: 'error'
};

/**
 * 比较当前玩家(我)和上家牌的大小，决定能否出牌
 *
 * @param prePokers {Array} 上家的牌
 * @param prePokersType {String} 上家牌的类型
 * @param myPokers {Array} 当前玩家的牌
 * @param myPokersType {String} 当前玩家牌的类型
 *
 * @return {Boolean} true表示能出牌 ; false表示不能出牌
 */
landlord.compareTwoPokers = function (prePokers, prePokersType, myPokers, myPokersType) {

    if (!prePokers || !prePokers.length || !myPokers || !myPokers.length) {
        console.log("[landlordUtil.js] 上家和当前玩家的出牌不能为空.");
        return false;
    }

    if (!prePokersType || !myPokersType
        || myPokersType === landlord.PokersType.ERROR
        || prePokersType === landlord.PokersType.ERROR) {
        console.log("[landlordUtil.js] 出牌类型不合法.");
        return false;
    }

    let preSize = prePokers.length;
    let mySize = myPokers.length;

    if (preSize === 0 && mySize !== 0) {
        console.log("[landlordUtil.js] 我方先出牌，上家没有牌.");
        return true;
    }

    // 集中判断是否王炸，避免多次判断王炸
    if (prePokersType === landlord.PokersType.JOKER_BOMB) {
        console.log("[landlordUtil.js] 上家王炸，肯定不能出.");
        return false;

    } else if (myPokersType === landlord.PokersType.JOKER_BOMB) {
        console.log("[landlordUtil.js] 我方王炸，肯定能出.");
        return true;
    }

    //  我方是炸弹，对方不是炸弹
    if (prePokersType !== landlord.PokersType.BOMB && myPokersType === landlord.PokersType.BOMB) {
        return true;
    }
    // 上家是炸弹，我方不是炸弹
    else if (prePokersType === landlord.PokersType.BOMB && myPokersType !== landlord.PokersType.BOMB) {
        return false;
    }
    // 双方都是炸弹
    else if (prePokersType === landlord.PokersType.BOMB && myPokersType === landlord.PokersType.BOMB) {
        return myPokers[0].point > prePokers[0].point;
    }

    // 双方都不是炸弹、王炸时，必须能要牌型相同且张数相同才能比较大小
    sortPokers(myPokers);
    sortPokers(prePokers);

    if (mySize !== preSize) {
        console.log("[landlordUtil.js] 张数不同，不能出牌.");
        return false;
    }

    // 单
    if (prePokersType === landlord.PokersType.ONE && myPokersType === landlord.PokersType.ONE) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 对子
    else if (prePokersType === landlord.PokersType.DOUBLE && myPokersType === landlord.PokersType.DOUBLE) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 3不带
    else if (prePokersType === landlord.PokersType.TRIPLE_WITH_NONE && myPokersType === landlord.PokersType.TRIPLE_WITH_NONE) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 3带1 , 只需比较第3张牌的大小（包括单牌、一对）
    else if (prePokersType === landlord.PokersType.TRIPLE_WITH_ONE && myPokersType === landlord.PokersType.TRIPLE_WITH_ONE) {
        return myPokers[2].point > prePokers[2].point;
    }
    // 顺子 , 只需比较最大牌（或最小牌）的大小
    else if (prePokersType === landlord.PokersType.CONTINUOUS && myPokersType === landlord.PokersType.CONTINUOUS) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 连对 , 只需比较最大牌（或最小牌）的大小
    else if (prePokersType === landlord.PokersType.DOUBLE_CONTINUOUS && myPokersType === landlord.PokersType.DOUBLE_CONTINUOUS) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 4带2 , 带两单，则比较 第3或第4张牌的大小 ; 带两对，则比较重复次数最多的牌
    else if (prePokersType === landlord.PokersType.QUADRUPLE_WITH_TWO && myPokersType === landlord.PokersType.QUADRUPLE_WITH_TWO) {
        if (mySize === 6) {
            return myPokers[2].point > prePokers[2].point;

        } else if (mySize === 8) {
            return getRepeatMostPoker(myPokers, 4) > getRepeatMostPoker(prePokers, 4);
        }
    }
    // 飞机不带
    else if (prePokersType === landlord.PokersType.AIRPLANE_WITH_NONE && myPokersType === landlord.PokersType.AIRPLANE_WITH_NONE) {
        return myPokers[0].point > prePokers[0].point;
    }
    // 飞机带翅膀
    else if (prePokersType === landlord.PokersType.AIRPLANE_WITH_WING && myPokersType === landlord.PokersType.AIRPLANE_WITH_WING) {
        return getRepeatMostPoker(myPokers, 3) > getRepeatMostPoker(prePokers, 3);
    }
};

/**
 * 查出牌组中，指定张数的牌的最大点数 （例如查找牌组中， 3顺的最大点数、连对的最大点数）
 *
 * @param pokers {Array}
 * @param occurTimes {Number}
 * @return {Number} point 若牌组中不存在 occurTimes 指定数量的牌，则返回默认值 0
 */
function getRepeatMostPoker(pokers, occurTimes) {
    let res = 0;
    let obj = {};        // 格式{ point: times }

    if (!pokers || !pokers.length) {
        return res;
    }

    pokers.forEach(function (poker) {
        let point = poker.point;
        if (obj[point]) {
            obj[point]++;
        } else {
            obj[point] = 1;
        }
    });

    let pointsArray = Object.keys(obj);  // [point1 , point2 ...]
    pointsArray.forEach(function (point) {
        if (parseInt(obj[point]) === occurTimes && parseInt(point) > parseInt(res)) {
            res = point;
        }
    });

    return res;
}

/**
 * 检测牌组类型
 *
 * @return {String} 返回牌组类型
 */
landlord.getPokersType = function (pokers) {

    let result = landlord.PokersType.ERROR;

    if (isLegalPokers(pokers)) {
        if (landlord.isOne(pokers)) {
            result = landlord.PokersType.ONE;

        } else if (landlord.isDouble(pokers)) {
            result = landlord.PokersType.DOUBLE;

        } else if (landlord.isJokerBomb(pokers)) {
            result = landlord.PokersType.JOKER_BOMB;

        } else if (landlord.isBomb(pokers)) {
            result = landlord.PokersType.BOMB;

        } else if (landlord.isTripleWithOne(pokers)) {
            result = landlord.PokersType.TRIPLE_WITH_ONE;

        } else if (landlord.isTripleWithNone(pokers)) {
            result = landlord.PokersType.TRIPLE_WITH_NONE;

        } else if (landlord.isContinuousPoker(pokers)) {
            result = landlord.PokersType.CONTINUOUS;

        } else if (landlord.isDoubleContinuousPoker(pokers)) {
            result = landlord.PokersType.DOUBLE_CONTINUOUS;

        } else if (landlord.isQuadrupleWithTwo(pokers)) {
            result = landlord.PokersType.QUADRUPLE_WITH_TWO;

        } else if (landlord.isAirplaneWithWing(pokers)) {
            result = landlord.PokersType.AIRPLANE_WITH_WING;

        } else if (landlord.isAirplaneWithNone(pokers)) {
            result = landlord.PokersType.AIRPLANE_WITH_NONE;
        }
    }

    return result;
};

/**
 * 出牌
 *
 * @param playPokers {Array} 打出去的牌
 * @param handPokers {Array} 手牌
 *
 * @return {Array} 返回出过牌后的手牌
 */
landlord.playPoker = function (playPokers, handPokers) {
    let result = [];

    result = handPokers.filter(function (poker1) {
        return playPokers.every(function (poker2) {
            return poker2.point !== poker1.point || poker2.type !== poker1.type;
        })
    });

    return result;
};