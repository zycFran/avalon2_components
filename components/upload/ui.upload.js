var avalon = require('avalon2');
var template = require("./ui.upload.html");

// TODO HACK jquery 依赖
var jQuery = require("jquery");
window.jQuery = jQuery;

var WebUploader = require("./webuploader/webuploader.js");

var style = require("./webuploader/webuploader.css");

var thumbnailWidth = 200,
    thumbnailHeight = 200;

avalon.component('ms-upload', {
    template: template,
    defaults: {
        uploadBtnId: '',

        $uploaderParams: {
            duplicate: true,

            // 选完文件后，是否自动上传。
            auto: true,

            // swf文件路径
            swf:'Uploader.swf',

            // 文件接收服务端。
            server: '/r/file/upload',

            // 大小限制 100M
            fileSizeLimit: 1024 * 1024 * 100,

            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
             pick: '',

            filters: '*',

            // 只允许选择图片文件。
            accept: {
                title: '文件',
                extensions: '*',
                mimeTypes: '*/*'
            }
        },

        $fileSizeLimit: 1024 * 1024 * 100, // 大小限制 100M
        $filters: '*',
        $uploadServer: '/r/file/upload',

        getThumbUrl: function(serial){
            return 'r/content/downloadFile?fileId=' + serial;
        },

        uploadList: [],

        $uploader: null,
        uploadText: '上传',

        onInit: function () {
            var me = this;
            me.uploadBtnId = "uploadBtn_" + Math.ceil(Math.random() * 10000);

            me.$uploaderParams['pick'] = "#" + me.uploadBtnId;
            me.$uploaderParams['fileSizeLimit'] =  me.$fileSizeLimit;
            me.$uploaderParams['filters'] =  me.$filters;
            me.$uploaderParams['server'] =  me.$uploadServer;
            me.$uploaderParams['accept']['extensions'] =  me.$filters;
        },

        onReady: function(){
            var me = this;
            setTimeout(function(){
                me.$uploader = WebUploader.create(avalon.mix(true, {}, me.$uploaderParams));

                me.$uploader.on('fileQueued', function(){
                    me.fileQueuedHandler.apply(me, arguments)
                });

                // 文件上传过程中创建进度条实时显示。
                me.$uploader.on('uploadProgress', function(){
                    me.uploadProgressHandler.apply(me, arguments)
                });

                // 文件上传成功，给item添加成功class, 用样式标记上传成功。
                me.$uploader.on('uploadSuccess', function(){
                    me.uploadSuccessHandler.apply(me, arguments)
                });

                // 文件上传失败， 显示上传出错。
                me.$uploader.on('uploadError', function(){
                    me.uploadErrorHandler.apply(me, arguments)
                });

                // 完成上传完了，成功或者失败，先删除进度条。
                me.$uploader.on('uploadComplete', function(){
                    me.uploadCompleteHandler.apply(me, arguments)
                });

                // 完成上传完了，成功或者失败，先删除进度条。
                me.$uploader.on('error', function(){me.errorHandler.apply(me, arguments)});
            }, 10)

        },

        removeHandler: function(el, index){
            var me = this;
            me.uploadList.splice(index,1);
        },

        initByList: function(list, type){
            var pd = [], me = this;
            avalon.each(list, function (i, it) {
                if (type == 'file') {
                    pd.push({
                        state: 'success',
                        value: it['id'],
                        name: it['fileName'],
                        link: me.getThumbUrl(it.id),
                        thumbUrl: me.getThumbUrl(it.id),
                        progress: '0%'
                    });
                } else {
                    pd.push({
                        state: 'success',
                        value: it,
                        thumbUrl: me.getThumbUrl(it.id),
                        progress: '0%'
                    });
                }
            });
            me.uploadList = pd;
        },

        getUploadFileValue: function(limit){
            var me = this;
            var list = me.uploadList | [];
            var p = [];
            avalon.each(list, function (i, it) {
                if (it.value) {
                    p.push(it.value);
                }
            });
            if (p.length && limit == 1) {
                return p[0];
            } else if (p.length) {
                return p;
            }
            return null;
        },

        fileQueuedHandler: function(file){
            var me = this;
            me.uploadList.unshift({
                id: file.id,
                name: file.name,
                state: 'queued',
                value: '',
                thumbUrl: '',
                link: 'javascript:;',
                progress: '0%'
            });
            var filters = me.$uploaderParams.filters;

            if (filters.indexOf('jpg') >= 0) {
                // 如果为非图片文件，可以不用调用此方法。
                // thumbnailWidth x thumbnailHeight 为 100 x 100
                me.$uploader.makeThumb(file, function (error, src) {
                    if (error) {
                        return;
                    }
                    var el = getItemById(me.uploadList, file.id);
                    if (el) {
                        el.thumbUrl = src;
                    }
                }, thumbnailWidth, thumbnailHeight);
            }
        },
        uploadProgressHandler: function(file, percentage){
            var me = this;
            var el = getItemById(me.uploadList, file.id);
            if (!el) {
                return;
            }
            el.state = 'progress';
            el.progress = percentage * 100 + '%'
        },
        uploadSuccessHandler: function(file,result){
            var me = this;
            var el = getItemById(me.uploadList, file.id);
            if (!el) {
                return;
            }
            el.state = 'success';

            if (result.list && result.list.length && success) {
                success(result);
            } else {
                el.value = result.value;
                el.link = me.getThumbUrl(el.value);
            }
        },
        uploadCompleteHandler: function(file){
            var me = this;
            var el = getItemById(me.uploadList, file.id);
            if (!el) {
                return;
            }
            el.state = 'success';
        },
        uploadErrorHandler: function(file){
            var me = this;
            var el = getItemById(me.uploadList, file.id);
            if (!el) {
                return;
            }
            el.state = 'fail';
        },
        errorHandler: function(err){
            var me = this;
            if (err == 'Q_EXCEED_SIZE_LIMIT') {
                var maxM = Number((me.$uploaderParams.fileSizeLimit / 1024 / 1024).toFixed(1));
                alert("文件大小超过限制, 最大" + maxM +"M");
            } else if (err == 'Q_TYPE_DENIED') {
                var filters = me.$uploaderParams.filters;
                alert("文件格式错误, 仅支持上传(" + filters +")文件");
            } else if(err == 'F_DUPLICATE'){
                alert("文件重复上传");
            }else{
                alert("上传失败");
            }
        }

    }
});

function getItemById(uploadList, id) {
    var el = null;
    avalon.each(uploadList, function (i, it) {
        if (it.id == id) {
            el = it;
        }
    });
    return el;
}
