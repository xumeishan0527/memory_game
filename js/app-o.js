var list = document.getElementsByClassName('card'),
    restartBtn = document.getElementById('restart'),
    shade = document.getElementById('shade'),
    recur = document.getElementById('recur'),
    stop = document.getElementById('stop'),
    getTimeInput = document.getElementById('getTime');


var Game = function (list, restartBtn, recur, stop, shade) {
    this.list = list;
    this.restartBtn = restartBtn;
    this.recur = recur;
    this.stop = stop;
    this.shade = shade;
};

/**
 * @description 初始化函数
 */
Game.prototype.init = function () {
    var self = this;
    //调用遍历每个卡片函数，最终实现渲染随机后的卡片
    myDeck.getLiList();
    //调用倒计时函数
    myTimer.reverseTime();

    //实现10s后卡片翻转，并开始计时。
    setTimeout(function () {
        myTimer.startTime();
        //调用监听卡片点击事件
        myDeck.listenCardClick();
        // console.log(self.list[0].lastElementChild);
        for (var i = 0; i < self.list.length; i++) {
            self.list[i].style.cssText =
                'animation:changeRotate .6s ease forwards;' +
                'transform:rotateY(180deg)';
            self.list[i].addEventListener('webkitAnimationEnd', function () {
                this.style.webkitAnimation = '';
            });
        }
    }, 10000);


    //监听重置按键点击事件
    self.restartBtn.addEventListener('click', function () {
        self.restart();
    });

    //监听完成游戏后‘再挑战一次’按键点击事件
    self.recur.onclick = function () {
        self.shade.style.display = 'none';
        self.restart();
    };
    //监听完成游戏后‘不了，谢谢’按键点击事件
    self.stop.onclick = function () {
        self.shade.style.display = 'none';
    };

};


/**
 * @description 重置游戏函数
 */
Game.prototype.restart = function () {

    /*方法一：代码逻辑重置*/
    var k = 0,
        stepNumber = document.getElementById('stepNumber');
        stepNumber.textContent = 'step number is: 0';

    myDeck.starsNum(k);
    myTimer.stopTime();
    myDeck.allIndex = [];

    for (var i = 0; i < this.list.length; i++) {
        this.list[i].style.webkitAnimation = '';
        this.list[i].style.cssText = 'transform:rotateY(0deg)';
        this.list[i].lastElementChild.style.background = '#02b3e4';
    }

    this.init();

    /*方法二：简单明了*/
    // window.location.reload();

};


var Deck = function (list, shade) {
    this.list = list;
    this.allIndex = [];
    this.shade = shade;
    this.clickList_two = [];
    this.lastClickList = null;
};

/**
 * @description 遍历每个卡片（<li class="card">...</li>）
 * @return {array} randomList --随机编排后的list
 */
Deck.prototype.getLiList = function () {
    /*方法一：比较勉强，不建议*/
    // var tmpList = [];
    // for (var i = 0; i < this.list.length; i++) {
    //     var tmpList_item = {};
    //     tmpList_item = this.list[i];
    //     tmpList.push(tmpList_item);
    // }

    /*方法二：灵活建议*/
    var tmpList = Array.from(this.list);
    var randomList = shuffle(tmpList);
    this.renderLiList(randomList);
};

/**
 * @description 渲染每个卡片（<li class="card">...</li>）
 * @param {array} array --随机编排后的list
 */
Deck.prototype.renderLiList = function (array) {

    var getUL = document.getElementById('deck');
    getUL.innerHTML = '';
    for (var i = 0; i < array.length; i++) {
        getUL.appendChild(array[i]);
    }
};

/**
 * @description 监听卡片点击事件函数。
 */
Deck.prototype.listenCardClick = function () {
    var k = 0;
    var self = this;
    for (var i = 0; i < self.list.length; i++) {
        self.list[i].count = i;
        self.list[i].onclick = function () {
            if (this.getAttribute('style') === 'transform: rotateY(0);' || self.lastClickList === this) return;

            self.lastClickList = this;
            var a=document.defaultView.getComputedStyle(this,null);
            console.log(a.height);
            this.lastElementChild.style.background = '#02b3e4';
            this.style.animation = 'changeRotate 0.6s ease reverse';
            this.style.transform='rotateY(0)';
            this.addEventListener('webkitAnimationEnd', function () {
                this.style.webkitAnimation = '';
            });
            k++;
            self.judgeResult(this.count, k);
        };
    }
};


/**
 * @description 判断匹配结果函数。
 */
Deck.prototype.judgeResult = function (index, k) {
    var stepNumber = document.getElementById('stepNumber'),
        clickList = {};
    var self = this;
    var clickList_two = self.clickList_two;
    //获取每张卡片<i class="fa fa-bomb"></i>的class。
    clickList.i_className = self.list[index].lastElementChild.firstElementChild.getAttribute('class');
    clickList.i = index;


    clickList_two.push(clickList);

    stepNumber.textContent = 'step number is: ' + k; //显示点击次数
    //调用星级评分函数
    self.starsNum(k);

    //当放开两张卡片时进入计算
    if (clickList_two.length === 2) {
        //通过判断两张卡片class="fa fa-***"的class值是否相等，来判断卡片是否匹对成功。
        //若相等实现果冻效果，并改变颜色
        if (clickList_two[0].i_className === clickList_two[1].i_className) {
            for (var j = 0; j < clickList_two.length; j++) {

                self.list[clickList_two[j].i].style.cssText =
                    'animation:changeScale 0.6s ease';
                self.list[clickList_two[j].i].lastElementChild.style.background = '#02ccba';
            }

            //记录匹对成功个数
            self.allIndex.push(clickList_two);
            //调用完成所有卡片匹对函数
            self.judgeStop();
        }
        //若不相等实现摇晃效果，并改变颜色
        else {
            for (var j = 0; j < clickList_two.length; j++) {
                self.list[clickList_two[j].i].style.cssText =
                    'animation:changeSkew 0.6s ease;transform-origin:50% 150%';
                self.list[clickList_two[j].i].lastElementChild.style.background = '#de3f40';
                self.list[clickList_two[j].i].addEventListener('webkitAnimationEnd', function () {
                    this.style.webkitAnimation = 'changeRotate 0.6s ease forwards';
                });
            }
        }
        this.clickList_two = [];
    }
};


/**
 * @description 星级评分函数
 * @param nub --点击次数
 */
Deck.prototype.starsNum = function (nub) {
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
};


/**
 * @description 完成所有卡片匹对函数
 */
Deck.prototype.judgeStop = function () {
    var shadeContentTime = document.getElementById('shadeContentTime');
    var shadeContentStars = document.getElementById('shadeContentStars');
    var moves = document.getElementById('moves');
    if (this.allIndex.length < 8) return;
    shade.style.display = 'flex';
    shadeContentTime.textContent = '用时：' + myTimer.minute + '分' + myTimer.second + '秒' + myTimer.millisecond + '毫秒';
    shadeContentStars.textContent = '评分：' + moves.textContent + '颗星';
    myTimer.stopTime();
};


var Timer = function (getTimeInput) {
    this.getTimeInput = getTimeInput;
    this.minute = 0;
    this.second = 0;
    this.millisecond = 0;
    this.int = null;
};

/**
 *@description 结束计时函数
 */
Timer.prototype.stopTime = function () {
    window.clearInterval(this.int);
    this.minute = this.second = 0;
};


/**
 *@description 开始计时函数
 */
Timer.prototype.startTime = function () {
    var self = this;
    self.int = setInterval(function () {
        self.millisecond += 50;
        if (self.millisecond >= 1000) {
            self.millisecond = 0;
            self.second = self.second + 1;
        }
        if (self.second > 60) {
            self.second = 0;
            self.minute = self.minute + 1;
        }
        self.getTimeInput.value = 'utility time：' + self.minute + 'm' + self.second + 's' + self.millisecond + 'ms';
    }, 50);
};


/**
 * @description 倒数10函数，用于提醒玩家10秒记忆。
 */
Timer.prototype.reverseTime = function () {
    var ms = 1000,
        s = 10,
        intReverse;
    intReverse = setInterval(function () {
        ms = ms - 50;
        if (s <= 0) return;
        if (ms <= 0) {
            ms = 1000;
            s = s - 1;
            self.getTimeInput.value = 'ready：' + s + 's';
        }
    }, 50);
};

/**
 * @description 随机计算
 * @param {array} array --未随机编排的list
 */
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

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
 * new instances and call .init
 */
var myGame = new Game(list, restartBtn, recur, stop, shade);
var myDeck = new Deck(list, shade);
var myTimer = new Timer(getTimeInput);

myGame.init();