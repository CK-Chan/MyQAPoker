/**
 * 斗地主的工具方法, 包括 提供一副牌、洗牌、发牌、牌型判断、比较手牌
 */

let landlord = module.exports;

/**
 * 返回一副牌组
 *
 * 单张牌格式为: { point , type}
 * point点数，[3,17] ,其中A为14点, 2为15点，小王16点，大王17
 * type类型，0黑桃，1红桃，2梅花，3方块，50小王，100大王
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
 * @return {Array} 返回数组格式为 [[], [], []]
 */
landlord.distribute = function (pokers) {
    let playerPokers = [[], [], []];

    for (let i = 0; i < playerPokers.length; i++) {
        for (let j = 0; j < 17; j++) {
            playerPokers[i].push(pokers.pop());
        }
    }

    let random = Math.floor(Math.random() * 3);

    for (let i = 0; i < 3; i++) {
        playerPokers[random].push(pokers.pop());
    }

    playerPokers.forEach(function (pokers, index, array) {
        sortPokers(pokers);
    });

    return playerPokers;
};

/**
 * 是否 单张
 */
landlord.isDan = function (pokers) {
    return !!(pokers && pokers.length === 1);
};

/**
 * 是否 对子
 */
landlord.isDuiZi = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 2 && isSamePoint(pokers));
};

/**
 * 是否 三不带
 */
landlord.isSanBuDai = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 3 && isSamePoint(pokers));
};

/**
 * 是否 三带一(或一对)
 * 注意炸弹不是三带一
 * TODO 处理 一对的情况
 */
landlord.isSanDaiYi = function (pokers) {
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
landlord.isShunZi = function (pokers) {
    if (!pokers || !pokers.length || pokers.length < 5 || pokers.length > 12) {
        return false;
    }

    sortPokers(pokers);

    return isContinuous(pokers);
};

/**
 * 是否 炸弹
 */
landlord.isZhaDan = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 4 && isSamePoint(pokers));
};

/**
 * 是否 王炸
 */
landlord.isDuiWang = function (pokers) {
    return !!(pokers && pokers.length && pokers.length === 2 && (pokers[0].point + pokers[1].point === 33));
};

/**
 * 是否 连对(双顺)
 */
landlord.isLianDui = function (pokers) {
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
landlord.isFeiJiBuDai = function (pokers) {
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
 * 是否 4带2（两个单牌 或 两对）
 */
landlord.isSiDaiEr = function (pokers) {
    if (!pokers || !pokers.length || (pokers.length !== 6 && pokers.length !== 8)) {
        return false;
    }

    sortPokers(pokers);

    //是否有四张相同点数
    if (pokers.length === 6) {
        return isSamePoint(pokers.slice(0, 4)) || isSamePoint(pokers.slice(1, 5)) || isSamePoint(pokers.slice(2));

    } else if (pokers.length === 8) {
        if (isSamePoint(pokers.slice(0, 4))) {
            return isSamePoint(pokers.slice(4, 6)) && isSamePoint(pokers.slice(6));

        } else if (isSamePoint(pokers.slice(2, 6))) {
            return isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(6));

        } else if (isSamePoint(pokers.slice(4))) {
            return isSamePoint(pokers.slice(0, 2)) && isSamePoint(pokers.slice(2, 4));
        }

    } else {
        return false;
    }


};

/**
 * 整理牌组 , 从小到大
 * 目前只是按点数排序，没有加入花色判断
 *
 * @param pokers
 * @return {*}
 */
function sortPokers(pokers) {
    pokers.sort(function (a, b) {
        return a.point - b.point;
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
