let random = module.exports;


/**
 * 生成 [n , m] 的随机整数
 *
 * @param n {Number}
 * @param m {Number}
 */
random.generateIntRandom = function (n, m) {
    return Math.floor(Math.random() * (m - n + 1) + n);
};