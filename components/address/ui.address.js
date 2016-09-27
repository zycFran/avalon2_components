var avalon = require('avalon2');
var template = require("./ui.address.html");
var style = require("./ui.address.css");

var address_data = require("./address_data.js");

var city_province_data = address_data.city_province_data;
var city_kot_data = address_data.city_kot_data;
var city_cn_data = address_data.city_cn_data;

var addressComp = avalon.component('ms-address', {
    template: template,
    defaults: {

        // 层级控制 从第二级开始
        levels: [
            { name: '省份', selectItem: []},
            { name: '城市', selectItem: []},
            { name: '县区', selectItem: []}
        ],

        // 存放第一级的数据（对地址来说代表 省）
        provinceData: city_province_data,


        // 当前在处在第几级位置，默认第一级
        curLevel: 0,

        curList: [],

        selectValue: '',

        $province: '',
        $city: '',
        $area: '',

        showList: false,
        focusHandler: function(e){
            var me = this;
            me.showList = true;
            if(e){
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            }
            me.tabChangeHandler(0);
        },

        blurHandler: function(){
            this.showList = false;
        },


        onInit: function () {
            var me = this;
            me.curLevel = 0;
            me.curList = [];

            // hack for ie events
            if(document.attachEvent){
                document.attachEvent("onclick", function(e){
                    if(e){
                        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                    }
                    me.showList = false;
                });
            }else if(document.addEventListener){
                document.addEventListener("click", function(e){
                    if(e){
                        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                    }
                    me.showList = false;
                });
            }

        },

        defaultHandler: function(){
            var me = this;
            me.curLevel = 0;
            me.curList = [];
            for(var i = 0; i < me.levels.length; i++){
                me.levels[i]['selectItem'] = [];
            }
        },
        selectHandler: function(item, levelIndex, e){
            var me = this;
            if(levelIndex < me.levels.length - 1){
                // 阻止冒泡
                if(e){
                    e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                }
            }

            var parentID;
            if(item.$model){
                me.levels[levelIndex].selectItem = avalon.mix(true, [], item.$model);
            }else{
                me.levels[levelIndex].selectItem = avalon.mix(true, [], item);
            }


            var it = me.levels[levelIndex]['selectItem'];
            parentID = it[0];

            // 后面的选项应该置空
            for(var i = levelIndex + 1; i < me.levels.length; i++){
                me.levels[i]['selectItem'] = [];
            }

            // 地区显示
            me.showSelectHandler();

            // 最后一组数据没有下一步
            if(levelIndex >= me.levels.length - 1){
                me.showList = false;
                return;
            }

            me.curLevel ++;
            me.showCurList(parentID, levelIndex + 1, true);
        },
        showCurList: function(parentID, curIndex, isAutoSelect){
            var me = this;
            if(curIndex < me.levels.length - 1 || curIndex <= 2){
                var nextList = filterDataByParentB(city_cn_data, parentID);
                me.curList = nextList;
                if(!nextList.length){
                    me.showList = false;
                    return;
                }
                if(isAutoSelect){
                    //如果列表中只有一条数据 则自动选中
                    if(nextList.length == 1){
                        me.selectHandler(nextList[0], me.curLevel);
                    }else if(!nextList.length){
                        // 如果没有数据 则自动跳过选择
                        me.tabChangeHandler(me.curLevel + 1);
                    }
                }

            }else if(curIndex == me.levels.length - 1 && curIndex ==3){
                // 动态获街道的数据
                var data = {
                    l1: me.levels[0]['selectItem'][0] || null,
                    l2: me.levels[1]['selectItem'][0] || null,
                    l3: me.levels[2]['selectItem'][0] || null
                };
                avalon.log("选择地址数据:");
                avalon.log(data);

                me.showList = false;
                //require(['UtilController'], function(AjaxFunc){
                //    AjaxFunc.getAction({
                //        url: Global_URL['getStreetList'],
                //        data: data,
                //        callback: function(result){
                //            result.data = result.data || [];
                //            nextList = result.data;
                //            me.curList = nextList;
                //
                //            //如果列表中只有一条数据 则自动选中
                //            if(nextList.length == 1){
                //                me.selectHandler(nextList[0], me.curLevel);
                //            }
                //        }
                //    })
                //});
            }
        },

        showSelectHandler: function(){
            var me = this;
            var info = '';
            var province = me.levels[0];
            var city = me.levels[1];
            var area = me.levels[2];

            me.$province = '';
            me.$city = '';
            me.$area = '';

            if(province && province['selectItem'] && province['selectItem'][1]){
                info += province['selectItem'][1];
                me.$province = province['selectItem'][1];
            }

            if(city && city['selectItem'] && city['selectItem'][1]){
                if( city['selectItem'][1] == '北京'||
                    city['selectItem'][1] == '上海'||
                    city['selectItem'][1] == '重庆'||
                    city['selectItem'][1] == '天津'){

                }else{
                    info += city['selectItem'][1];
                }
                me.$city = city['selectItem'][1];
            }
            if(area && area['selectItem'] && area['selectItem'][1]){
                info += area['selectItem'][1];
                me.$area = area['selectItem'][1];
            }

            me.selectValue = info;
            //if(duplexVM){
            //    duplexVM[1][duplexVM[0]] = info;
            //    if(me.levels[0] &&me.levels[0]['selectItem']  && me.levels[0]['selectItem'][1] ){
            //        duplexVM[1]['province'] = me.levels[0]['selectItem'][1] || '';
            //    }
            //    if(me.levels[1] &&me.levels[1]['selectItem']  && me.levels[1]['selectItem'][1] ){
            //        duplexVM[1]['city'] = me.levels[1]['selectItem'][1] || '';
            //    }
            //}
        },

        tabChangeHandler: function(index, e){
            var me = this;
            // 阻止冒泡
            if(e){
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            }
            // 不需要切换
            if(me.curLevel == index){
                return;
            }

            me.curLevel = index;

            var parentID;
            // 第一级的数据已经有了，不需要重新计算
            if(index > 0){
                parentID = me.levels[index - 1]['selectItem'][0];

                // 没有父ID
                if(!parentID){
                    // TODO 方法不太好 待改进
                    // 如果显示街道地址，需要判断区是空还是没选
                    if(index == me.levels.length - 1){
                        // 判断是否选择了市
                        if(!me.levels[1]['selectItem'][0]){
                            // 没有就清空
                            me.curList = [];
                        }else{
                            // 区ID为空，话判断区是空还是没选
                            if(!me.levels[2]['selectItem'][0]){
                                var _pid = me.levels[1]['selectItem'][0];
                                var nextList = filterDataByParentB(city_cn_data, _pid);
                                // 区是空的
                                if(!nextList.length){
                                    me.showCurList(parentID, index, false);
                                }else{
                                    me.curList = [];
                                }
                            }else{
                                me.showCurList(parentID, index, false);
                            }
                        }
                    }else{
                        me.curList = [];
                    }
                }else{
                    me.showCurList(parentID, index, false);
                }
            }
        },
        
        //稍后再说
        lastChoiceHandler: function(){
            var me = this;
            var len = me.levels.length;
            me.levels[len - 1]['selectItem'] = [-1, '稍后再说'];

            // 地区显示
            me.showSelectHandler();

            me.showList = false;
        }

    }
});

// 根据parentID过滤数据
function filterDataByParentB(dataArray, parentID){
    var re = [];
    avalon.each(dataArray, function(i, item){
        if(item[2] == parentID){
            re.push(item);
        }
    });
    return avalon.mix(true, [], re);
}