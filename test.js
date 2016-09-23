var avalon = require('avalon2');

var ui_pager = require('./components/pager/ui.pager');
var ui_dropdown = require('./components/dropdown/ui.dropdown');
var ui_datetimepicker = require('./components/datetimepicker/ui.datetimepicker');
var ui_editor = require('./components/editor/ui.editor');
var ui_address = require('./components/address/ui.address');

//var ui_dialog = require('./components/address/ui.address');
var ui_upload = require('./components/upload/ui.upload');

var dialog = require('./components/dialog/ui.dialog');

window.global_models = {};

var testCtr = avalon.define({
    $id: 'test',
    pager_config: {
        totalPages: 20,
        showPages: 10,
        currentPage:1
    },
    // 下拉组件
    dropdown_config: {
        list: [
            {name: 'a', value: 'aaaa'},
            {name: 'b', value: 'aaab'},
            {name: 'c', value: 'aaac'},
            {name: 'd', value: 'aaad'},
            {name: 'e', value: 'aaae'}
        ],
        afterSelect: function(selectRecord){
            console.log(selectRecord);
        },
        placeholder: '请下拉选择',
        readonly: false
    },
    // 时间组件
    datetimepicker_config: {
        $options: {
            dateFmt: 'yyyy-MM-dd HH:mm:ss',
            autoPickDate: true
        }
    },
    // 富文本组件
    editor_config: {
        uploadImgUrl: '/r/upload'
    },
    // 地址组件
    address_config: {
        levels: [
            { name: '省份', selectItem: []},
            { name: '城市', selectItem: []},
            { name: '县区', selectItem: []}
        ]
    },
    // 上传组件
    upload_config: {
        $fileSizeLimit: 1024 * 1024 * 100, // 大小限制 100M
        $errorText:{

        },
        $filters: 'gif,jpg,jpeg,bmp,png',
        $uploadServer: '/r/file/upload',
        uploadText: '上传图片',
        getThumbUrl: function(serial){
            return 'r/content/downloadFile?fileId=' + serial;
        }
    },
    upload2_config: {
        $fileSizeLimit: 1024 * 1024 * 100, // 大小限制 100M
        $filters: '*',
        uploadText: '上传文件',
        $uploadServer: '/r/file/upload',
        getThumbUrl: function(serial){
            return 'r/content/downloadFile?fileId=' + serial;
        }
    },

    dialogHandler: function(){
        var d = dialog({
            title: '提示',
            content: '确认删除？',
            cancelValue: '取消',
            cancel: function () {},
            okValue: '确认',
            ok: function(){
                var that = this;
                this.title('正在提交..');
            }
        });
        d.showModal();
    },

    tipHandler: function(callback){
        var d = dialog({
            content: "操作成功",
            quickClose: false
        });
        d.showModal();
        setTimeout(function () {
            d.close();
            if (callback) {
                callback();
            }
        }, 1500);
    }
});

module.exports = avalon;