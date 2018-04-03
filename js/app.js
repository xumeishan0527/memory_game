var list = document.getElementsByClassName('card'),
    restartBtn = document.getElementById('restart'),
    shade = document.getElementById('shade'),
    recur = document.getElementById('recur'),
    stop = document.getElementById('stop'),
    getTimeInput = document.getElementById('getTime'),
    clickList_two = [],
    allIndex = [],
    minute = 0,
    second = 0,
    millisecond = 0,
    int,
    lastClickList = null;

/**
 * @description 初始化函数
 */
function init() {
    //调用遍历每个卡片函数，最终实现渲染随机后的卡片
    getLiList();
    //调用倒计时函数
    reverseTime();

    //实现10s后卡片翻转，并开始计时。
    setTimeout(function () {
        startTime();
        listenCardClick();
        for (var i = 0; i < list.length; i++) {
            list[i].style.cssText =
                'animation:changeRotate 0.6s ease reverse;' +
                'transform:rotateY(0)';
            list[i].addEventListener('webkitAnimationEnd', function () {
                this.style.webkitAnimation = '';
            });
        }
    }, 10000);
    //调用监听卡片点击事件
}

init();

/**
 * @description 遍历每个卡片（<li class="card">...</li>）
 * @return {array} randomList --随机编排后的list
 */

function getLiList() {
    // var tmpList = [];
    // for (var i = 0; i < list.length; i++) {
    //   var tmpList_item = {};
    //   tmpList_item = list[i];
    //   tmpList.push(tmpList_item);
    // }

    console.log(list);
    var tmpList = Array.from(list);
    console.log(tmpList);
    var randomList = shuffle(tmpList);
    renderLiList(randomList);
}

/**
 * @description 随机计算
 * @param {array} array --未随机编排的list
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * @description 渲染每个卡片（<li class="card">...</li>）
 * @param {array} array --随机编排后的list
 */
function renderLiList(array) {
    var getUL = document.getElementById('deck');
    getUL.innerHTML = '';
    for (var i = 0; i < array.length; i++) {
        getUL.appendChild(array[i]);
    }
}

/**
 *@description 结束计时函数
 */
function stopTime() {
    window.clearInterval(int);
    minute = second = 0;
}

/**
 *@description 开始计时函数
 */
function startTime() {
    int = setInterval(function () {
        millisecond += 50;
        if (millisecond >= 1000) {
            millisecond = 0;
            second = second + 1;
        }
        if (second > 60) {
            second = 0;
            minute = minute + 1;
        }
        getTimeInput.value = 'utility time：' + minute + 'm' + second + 's' + millisecond + 'ms';
    }, 50);
}

/**
 * @description 倒数10函数，用于提醒玩家10秒记忆。
 */
function reverseTime() {
    var ms = 1000, s = 10, intReverse;
    intReverse = setInterval(function () {
        ms = ms - 50;
        if (s <= 0) return;
        if (ms <= 0) {
            ms = 1000;
            s = s - 1;
            getTimeInput.value = 'ready：' + s + 's';
        }
    }, 50);
}

/**
 * @description 监听卡片点击事件函数。
 */
function listenCardClick() {
    var k = 0;
    for (var i = 0; i < list.length; i++) {
        list[i].count = i;
        list[i].onclick = function () {
            // alert(this.getAttribute('style'));
            if (this.getAttribute('style') === 'transform: rotateY(180deg);' || lastClickList === this) return;
            lastClickList = this;
            this.lastElementChild.style.background = '#02b3e4';
            this.style.cssText = 'animation:changeRotate 0.6s ease forwards;';
            this.addEventListener('webkitAnimationEnd', function () {
                this.style.webkitAnimation = '';
                this.style.cssText = 'transform: rotateY(180deg);';
            });
            k++;
            judgeResult(this.count, k);
        };
    }
}

/**
 * @description 判断匹配结果函数。
 */
function judgeResult(index, k) {
    var stepNumber = document.getElementById('stepNumber'),
        clickList = {};

    //获取每张卡片<i class="fa fa-bomb"></i>的class。
    clickList.i_className = list[index].lastElementChild.firstElementChild.getAttribute('class');
    clickList.i = index;
    clickList_two.push(clickList);
    //显示点击次数
    stepNumber.textContent = 'step number is: ' + k;
    //调用星级评分函数
    starsNum(k);

    //当放开两张卡片时进入计算
    if (clickList_two.length === 2) {
        //通过判断两张卡片class="fa fa-***"的class值是否相等，来判断卡片是否匹对成功。
        //若相等实现果冻效果，并改变颜色
        if (clickList_two[0].i_className === clickList_two[1].i_className) {
            for (var j = 0; j < clickList_two.length; j++) {

                list[clickList_two[j].i].style.cssText =
                    'animation:changeScale 0.6s ease';
                list[clickList_two[j].i].lastElementChild.style.background = '#02ccba';
                list[clickList_two[j].i].addEventListener('webkitAnimationEnd', function () {
                    this.style.webkitAnimation = '';
                    this.style.cssText = 'transform: rotateY(180deg);';
                });
            }

            //记录匹对成功个数
            allIndex.push(clickList_two);
            //调用完成所有卡片匹对函数
            judgeStop();
        }
        //若不相等实现摇晃效果，并改变颜色
        else {
            for (var j = 0; j < clickList_two.length; j++) {
                list[clickList_two[j].i].style.cssText =
                    'animation:changeSkew 0.6s ease;transform-origin:50% 150%';
                list[clickList_two[j].i].lastElementChild.style.background = '#de3f40';
                list[clickList_two[j].i].addEventListener('webkitAnimationEnd', function () {
                    this.style.webkitAnimation = 'changeRotate 0.6s ease reverse forwards';
                    this.addEventListener('webkitAnimationEnd', function () {
                        this.style.webkitAnimation = '';
                        this.style.cssText = 'transform: rotateY(0deg);';
                    });
                });
            }
        }
        clickList_two = [];
    }
}

/**
 * @description 星级评分函数
 * @param nub --点击次数
 */
function starsNum(nub) {
    var stars = document.getElementById('stars');
    var moves = document.getElementById('moves');
    //当点击次数大于20且小于32时为2颗星
    if (nub > 20 && nub < 32) {
        stars.innerHTML = '<li><i class="fa fa-star"></i></li>' +
            '<li><i class="fa fa-star"></i></li>';
        moves.textContent = 2;
    }
    //当点击次数大于32时为1颗星
    if (nub > 32) {
        stars.innerHTML = '<li><i class="fa fa-star"></i></li>';
        moves.textContent = 1;
    }
    if (nub < 20) {
        stars.innerHTML = '<li><i class="fa fa-star"></i></li>' +
            '<li><i class="fa fa-star"></i></li>' +
            '<li><i class="fa fa-star"></i></li>';
        moves.textContent = 3;
    }
}

/**
 * @description 完成所有卡片匹对函数
 */
function judgeStop() {
    var shadeContentTime = document.getElementById('shadeContentTime');
    var shadeContentStars = document.getElementById('shadeContentStars');
    var moves = document.getElementById('moves');
    if (allIndex.length < 8) return;
    shade.style.display = 'flex';
    shadeContentTime.textContent = '用时：' + minute + '分' + second + '秒' + millisecond + '毫秒';
    shadeContentStars.textContent = '评分：' + moves.textContent + '颗星';
    stopTime();
}

/**
 * @description 重置游戏函数
 */
function restart() {

    var k = 0,
        stepNumber = document.getElementById('stepNumber');
    stepNumber.textContent = 'step number is: 0';

    starsNum(k);
    stopTime();
    allIndex = [];

    for (var i = 0; i < list.length; i++) {
        list[i].style.webkitAnimation = '';
        list[i].style.cssText = 'transform:rotateY(180deg)';
        list[i].lastElementChild.style.background = '#02b3e4';
    }

    init();
}

//监听重置按键点击事件
restartBtn.addEventListener('click', restart);
//监听完成游戏后‘再挑战一次’按键点击事件
recur.onclick = function () {
    shade.style.display = 'none';
    restart();
};
//监听完成游戏后‘不了，谢谢’按键点击事件
stop.onclick = function () {
    shade.style.display = 'none';
};

//TODO:将数值保存在本地存储器



