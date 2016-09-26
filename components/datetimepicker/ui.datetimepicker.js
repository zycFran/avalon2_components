var avalon = require('avalon2');
var template = require("./ui.datetimepicker.html");
var WdatePicker = require("./My97DatePicker/WdatePicker");

avalon.component('ms-datetimepicker', {
    template: template,
    defaults: {
        randomId: '',

        $options: {},

        onInit: function () {
            var me = this;
            me.randomId = "date_input_" + Math.ceil(Math.random() * 10000);
        },

        pickerHandler: function(){
            var me = this;
            WdatePicker(avalon.mix(true, {el: me.randomId}, this.$options));
        }
    }
});