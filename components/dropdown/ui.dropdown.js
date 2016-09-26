var avalon = require('avalon2');
var template = require("./ui.dropdown.html");
var css = require("./ui.dropdown.css");
var dropdownComp = avalon.component('ms-dropdown', {
    template: template,
    defaults: {
        list: [],
        width: '100%',
        sIndex: -1,
        placeholder: '请选择',
        left: 0,
        selectValue: '',
        cancelBubble: false,
        valueMap: null,
        readonly: true,

        afterSelect: function () {

        },

        onInit: function () {
            var me = this;
            //if(window.global_vmodels){
            //    window.global_vmodels[me.$id] = me;
            //}

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

        showList: false,
        focusHandler: function(e){
            if(e){
                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
            }
            var me = this;
            me.showList = true;
        },

        blurHandler: function(){
            this.showList = false;
        },

        selectHandler: function(event, el, index){
            var me = this;
            if(me.cancelBubble && event){
                event.stopPropagation? event.stopPropagation(): event.cancelBubble = true;
            }

            me.sIndex = index;
            me.selectValue = el.name;
            me.showList = false;

            if(me.afterSelect){
                me.afterSelect(el.$model);
            }
        }
    }
});