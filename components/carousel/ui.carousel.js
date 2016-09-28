var avalon = require('avalon2');
var template = require("./ui.carousel.html");
var css = require("./ui.carousel.css");

var requestAnimationFrame = (function() { //requestAnimationFrame 兼容
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 10);
        }
})();
var Tween = { //线性以及二次方的缓动
    linear: function(t, b, c, d) {
        return c * t / d + b;
    },
    easeIn: function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOut: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut: function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
};
var timer = null;
var animated = false; //动画正在进行
var duringTime = 0; //补间动画的时间长度
var lastIndex; //上一张图片index
var hoverIndex = 0; //上一张图片index
var inited;

var dropdownComp = avalon.component('ms-carousel', {
    template: template,
    defaults: {

        pictures: [], //@param pictures 轮播图片素材
        pictureWidth: 500, //@param pictureWidth 图片显示宽度
        pictureHeight: 200, //@param pictureHeight 图片显示高度
        effect: "slide", //@param effect 图片切换类型，默认为"slide"，取值：none:无特效 / fade:渐隐 / slide:滑动
        easing: "easeInOut", //@param effect 缓动类型，默认为"easeInOut"，取值 linear:无缓动效果 / easeIn:在过渡的开始提供缓动效果 / easeOut:在过渡的结尾提供缓动效果 / easeInOut 在过渡的开始和结尾提供缓动效果
        timeout: 2500, //@param timeout 切换时间间隔
        during: 300, //@param during 切换速度，越小越快，单位为毫秒
        alwaysShowArrow: true, //@param alwaysShowArrow 显示左右切换箭头
        alwaysShowSelection: true, //@param alwaysShowSelection 显示底部圆形切换部件
        autoSlide: true, //@param autoSlide 自动播放
        hoverStop: false, //@param autoSlide 鼠标经过停止播放
        adaptiveWidth: false, //@param adaptiveWidth 适应外围宽度，为true时指定pictureWidth不起作用
        adaptiveHeight: true, //@param adaptiveHeight 适应外围高度，为true时指定pictureHeight不起作用
        eventType: "click", //@param eventType 触发tab切换的nav上的事件类型，取值click(默认)\mouseenter\both

        arrowLeftNormalSrc: "resources/images/banner/arrows-left-icon.png", //@param arrowLeftNormalSrc 左箭头正常状态图标
        arrowRightNormalSrc: "resources/images/banner/arrows-right-icon.png", //@param arrowLeftNormalSrc 右箭头正常状态图标
        arrowLeftHoverSrc: "resources/images/banner/arrows-left-hover-icon.png", //@param arrowLeftNormalSrc 左箭头hover状态图标
        arrowRightHoverSrc: "resources/images/banner/arrows-right-hover-icon.png", //@param arrowLeftNormalSrc 右箭头hover状态图标

        picNum: 0,
        pictureOpacity: {},
        itemPosition: 'relative',
        panelPosition: 'absolute',
        selections: [],
        currentIndex: 0,
        selectionWrapOffset: '',
        panelOffsetX: 0,
        arrowVisible: false,
        arrowLeftSrc: '',
        arrowRightSrc: '',


        fadein: 1,
        fadeout: 0,

        onInit: function () {
            var vm = this;
            if (vm.effect !== "slide") { //fade 或者 none 模式下的布局
                vm.itemPosition = "absolute";
                vm.panelPosition = "relative"
            }

            vm.picNum = vm.pictures.length + 1; //图片数量（包括复制到末尾的第一个元素）
            vm.pictureOpacity = {};
            vm.itemPosition = "relative"; //默认slide effect下结构
            vm.panelPosition = "absolute";//默认slide effect下结构
            vm.selections = avalon.range(vm.pictures.length); //圆形选择的数据数组（不包括复制到末尾的第一个元素）
            vm.currentIndex = 0;// 圆形选择的index
            vm.selectionWrapOffset = -vm.pictures.length * 20 / 2; //圆形选择CSS位置修正
            vm.panelOffsetX = 0; //长panel的X方向偏移，正向移动（右）时减小，反向移动（左）时增大
            vm.arrowVisible = false; //箭头是否可见
            vm.arrowLeftSrc = vm.arrowLeftNormalSrc; //默认箭头icon
            vm.arrowRightSrc = vm.arrowRightNormalSrc ;//默认箭头icon

            duringTime = vm.during / 10;

            if (inited) return;
            inited = true;

            if (vm.adaptiveWidth) { //自动填充外围容器宽度
                vm.pictureWidth = vm.adaptiveWidth;
            }
            if (vm.adaptiveHeight) { //自动填充外围容器高度
                vm.pictureHeight = vm.adaptiveHeight;
                //element.style.height = "100%"
                //var children = element.children
                //for (var i = 0, len = children.length; i < len; i++) {
                //    if (children[i].id === "ui-carousel") {
                //        children[i].style.height = "100%"
                //    }
                //}
            }

            //预加载图片
            var images = [];
            images.push(vm.pictures, vm.arrowLeftNormalSrc, vm.arrowLeftHoverSrc, vm.arrowRightNormalSrc, vm.arrowRightHoverSrc)
            for (var i = 0; i < images.length; i++) {
                if(typeof images[i] == 'object'){
                    continue;
                }
                var image_preload = new Image();
                image_preload.src = images[i];
            }

        },

        onReady: function(){
            var vm = this;
            vm.pictures[vm.pictures.length] = vm.pictures[0]; //将第一个元素加到图片数组末尾形成循环
            vm.autoPlay(vm);

        },

        stopPlay: function(){
            var me = this;
            me.arrowVisible = me.alwaysShowArrow ? true : false
            if (me.hoverStop && me.autoSlide) {
                clearTimeout(timer);
                timer = null;
            }
        },
        restartPlay:function(type){
            var me = this;
            if (type === "carousel") {
                me.arrowVisible = false
            }
            me.autoPlay(me)
        },

        animate: function(direct, distance){
            var me = this;
            if (animated) { //防止动画队列堆积
                return
            }
            distance = distance || 1;

            if (me.effect === "slide") {
                //移动准备
                if (direct === 1 && me.panelOffsetX === -me.pictureWidth * (me.picNum - 1)) { //点击为正方向且panel处于队列末尾，队列先回到0
                    me.panelOffsetX = 0
                } else if (direct === -1 && me.panelOffsetX === 0) { //点击为负方向且panel处于队列开始，队列先回到末尾
                    me.panelOffsetX = -me.pictureWidth * (me.picNum - 1)
                }
                var offset = me.panelOffsetX - me.pictureWidth * direct * distance //设置移动终点位置
                //进行移动
                var currentTime = 0 //当前时间
                var startpos = me.panelOffsetX //位置初始值
                var duringDistance = me.pictureWidth * -direct * distance //位置变化量
                var go = function() {
                    animated = false
                    if ((me.panelOffsetX <= -me.pictureWidth * (me.pictures.length - 1)) && direct > 0) { //队列已到末尾位置，且将要往正方向移动，队列回到0
                        me.panelOffsetX = 0
                    } else if ((me.panelOffsetX >= 0) && direct < 0) { //队列已到开始位置，且将要往反方向移动，队列回到末尾
                        me.panelOffsetX = -me.pictureWidth * (me.picNum - 1)
                    } else { //队列还未到终点，在移动过程中
                        me.panelOffsetX = Tween[me.easing](currentTime, startpos, duringDistance, duringTime) //移动
                        if (currentTime < duringTime) {
                            currentTime += 1
                            requestAnimationFrame(go)
                            animated = true
                        }
                    }
                }
            } else if (me.effect === "fade") { //effect为fade
                var currentTime = 0 //当前时间
                var go = function() {
                    animated = false
                    me.fadein = Tween[me.easing](currentTime, 0, 1, duringTime) //移动
                    me.fadeout = Tween[me.easing](currentTime, 1, -1, duringTime) //移动
                    if (currentTime < duringTime) {
                        currentTime += 1
                        requestAnimationFrame(go)
                        animated = true
                    }
                }
            } else { //effect为none
                var go = function() {
                    me.fadein = 1
                    me.fadeout = 0
                }
            }
            go()

            //更新图片index
            lastIndex = me.currentIndex //当前图片变为上一张
            me.currentIndex += 1 * direct * distance
            if (me.currentIndex > me.selections.length - 1) { //最右端继续+1时回0
                me.currentIndex = 0
            } else if (me.currentIndex < 0) { //最左端继续-1时回末尾
                me.currentIndex = me.selections.length - 1
            }
        },

        getOpacity: function(index){
            var vm = this;
            if (vm.effect !== 'slide') {
                var num = vm.fadein + vm.fadeout;
                if (index === vm.currentIndex) {
                    return vm.fadein;
                } else if (index === lastIndex) {
                    return vm.fadeout;
                } else {
                    return 0;
                }
            } else {
                return 1;
            }
        },

        selectPic: function(index, e){//@method selectPic(index) 通过底部圆形选择图片
            var vm = this;
            hoverIndex = index;

            if (e.type === vm.eventType || vm.eventType === "both") {
                var distance = vm.currentIndex - index
                var direct = distance > 0 ? -1 : 1

                if (e.type === "mouseenter") {
                    setTimeout(function() {
                        vm.animate(direct, Math.abs(distance))
                    }, 300) //mouseenter事件设置延时以防止切换时间间隔太小
                } else {
                    vm.animate(direct, Math.abs(distance))
                }

                if (vm.autoSlide) {
                    clearTimeout(timer)
                    timer = null
                }
            }

            //修复hover的TAB和select的TAB不一致
            var fixIndex = setInterval(function(){
                if(vm.currentIndex !== hoverIndex){
                    var distance = vm.currentIndex - hoverIndex
                    var direct = distance > 0 ? -1 : 1
                    vm.animate(direct, Math.abs(distance))
                } else{
                    clearInterval(fixIndex)
                }
            },800)
        },

        arrowHover: function(direction){
            var vm = this;
            if (direction === "left") {
                vm.arrowLeftSrc = vm.arrowLeftHoverSrc;
            } else {
                vm.arrowRightSrc = vm.arrowRightHoverSrc;
            }
        },

        arrowBlur: function(direction){
            var vm = this;
            if (direction === "left") {
                vm.arrowLeftSrc = vm.arrowLeftNormalSrc
            } else {
                vm.arrowRightSrc = vm.arrowRightNormalSrc
            }
        },

        autoPlay: function(){
            var vm = this;
            if (timer === null && vm.autoSlide) {
                function play() {
                    timer = setTimeout(function() {
                        vm.animate(1) //正方向移动
                        play()
                    }, vm.timeout)
                }
                play()
            }
        }

    }
});