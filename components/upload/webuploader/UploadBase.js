/**
 * Created by zhouyc on 2015/12/18.
 */
/**
 * Created by zhouyc on 2015/10/21.
 */
define("UploadBaseController",
    [
        'WebUploaderPlugin'
    ],
    function (aa) {
        var thumbnailWidth = 200,
            thumbnailHeight = 200;

        window.WebUploader = aa.Uploader;

        var uploadCtr = avalon.define({
            $id: 'UploadBaseController',

            imageList: [],

            initList: function(list){
                var pd = [];
                avalon.each(list, function(i, it){
                    pd.push({
                        state: 'success',
                        value: it,
                        thumbUrl: '/r/image/getImage?serial=' + it,
                        progress: '0%'
                    });
                });

                uploadCtr.imageList = pd;
            },

            inited: false,

            init: function (uploadBtn, filters, success, fail) {

                if(uploadCtr.inited){
                    //return;
                }

                uploadCtr.inited = true;

                filters = filters || '*';
                //'gif,jpg,jpeg,bmp,png'

                var uploadList = uploadCtr.imageList;

                var uploader = WebUploader.create({

                    duplicate: false,

                    // 选完文件后，是否自动上传。
                    auto: true,

                    // swf文件路径
                    swf: base + 'plugins/webuploader/Uploader.swf',

                    // 文件接收服务端。
                    server: '/r/image/upload',

                    // 大小限制
                    fileSizeLimit: 1024 * 1024 * 20,

                    // 选择文件的按钮。可选。
                    // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    pick: uploadBtn,

                    // 只允许选择图片文件。
                    accept: {
                        title: '文件',
                        extensions: filters,
                        mimeTypes: '*/*'
                    }
                });
                uploader.on('fileQueued', function (file) {
                    uploadList.push({
                        id: file.id,
                        name: file.name,
                        state: 'queued',
                        value: '',
                        thumbUrl: '',
                        progress: '0%'
                    });
                    if (filters.indexOf('jpg') >= 0) {
                        // 如果为非图片文件，可以不用调用此方法。
                        // thumbnailWidth x thumbnailHeight 为 100 x 100
                        uploader.makeThumb(file, function (error, src) {
                            if (error) {
                                return;
                            }
                            var el = getItemById(uploadList, file.id);
                            if (el) {
                                el.thumbUrl = src;
                            }
                        }, thumbnailWidth, thumbnailHeight);
                    }
                });
                // 文件上传过程中创建进度条实时显示。
                uploader.on('uploadProgress', function (file, percentage) {
                    var el = getItemById(uploadList, file.id);
                    if (!el) {
                        return;
                    }
                    el.state = 'progress';
                    el.progress = percentage * 100 + '%'
                });

                // 文件上传成功，给item添加成功class, 用样式标记上传成功。
                uploader.on('uploadSuccess', function (file, result) {
                    var el = getItemById(uploadList, file.id);
                    if (!el) {
                        return;
                    }
                    el.state = 'success';
                    el.value = result.value;

                    if (success) {
                        success(file);
                    }
                });

                // 文件上传失败，显示上传出错。
                uploader.on('uploadError', function (file) {
                    var el = getItemById(uploadList, file.id);
                    if (!el) {
                        return;
                    }
                    el.state = 'fail';
                    if (fail) {
                        fail();
                    }
                });

                // 完成上传完了，成功或者失败，先删除进度条。
                uploader.on('uploadComplete', function (file) {
                    var el = getItemById(uploadList, file.id);
                    if (!el) {
                        return;
                    }
                    el.state = 'success';
                });
                // 完成上传完了，成功或者失败，先删除进度条。
                uploader.on('error', function (err) {
                    if(err == 'Q_EXCEED_SIZE_LIMIT'){
                        alert("文件超过20M限制");
                    }else{
                        alert("上传失败");
                    }
                });

                //window[uploadBtn] = uploader;
            },

            getUploadFileValue: function(){
                var p = [];
                var list = uploadCtr.imageList;
                avalon.each(list, function(i, it){
                    if(it.value){
                        p.push(it.value);
                    }
                });
                return p.toString();
            }
        });

        function getItemById(uploadList, id){
            var el = null;
            avalon.each(uploadList, function(i, it){
                if(it.id == id){
                    el = it;
                }
            });
            return el;
        }
        return uploadCtr;
    });