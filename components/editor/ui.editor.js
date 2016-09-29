var avalon = require('avalon2');
//var jquery = require("jquery");
var wangEditor = require("./wangEditor/js/wangEditor.js");
var template = require("./ui.editor.html");

avalon.component('ms-editor', {
    template: template,
    defaults: {
        randomId: "",

        uploadImgUrl: '',

        $instanceEditor: null,
        afterRender: function(editor){

        },

        setValue: function(){

        },
        getValues: function(){
            var me = this;
            if(!me.$instanceEditor){
                alert("editor 初始化失败");
                return;
            }
            return me.$instanceEditor.$txt.html();
        },
        onReady: function(ele){
            var me = this;
            //wangEditor.config.printLog = false;

            if(me.uploadImgUrl){
                me.$configUploadParams();
            }

            var editor = new wangEditor(me.$element);
            editor.create();
            me.$instanceEditor = editor;
            me.afterRender(editor);
        },
        onInit: function () {
            var me = this;
            me.randomId = "wangEditor_id_" + Math.ceil(Math.random() * 10000);
        },

        $configUploadParams: function(){
            var me = this;
            // 上传图片（举例）
            wangEditor.config.uploadImgUrl = me.uploadImgUrl;

            // 自定义load事件
            wangEditor.config.uploadImgFns.onload = function (resultText, xhr) {
                // resultText 服务器端返回的text
                // xhr 是 xmlHttpRequest 对象，IE8、9中不支持

                // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
                var originalName = editor.uploadImgOriginalName || '';

                // 如果 resultText 是图片的url地址，可以这样插入图片：
                editor.command(null, 'insertHtml', '<img src="' + resultText + '" alt="' + originalName + '" style="max-width:100%;"/>');
                // 如果不想要 img 的 max-width 样式，也可以这样插入：
                // editor.command(null, 'InsertImage', resultText);
            };

            // 自定义timeout事件
            wangEditor.config.uploadImgFns.ontimeout = function (xhr) {
                // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
                alert('上传超时');
            };

            // 自定义error事件
            wangEditor.config.uploadImgFns.onerror = function (xhr) {
                // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
                alert('上传错误');
            };
        }
    }
});