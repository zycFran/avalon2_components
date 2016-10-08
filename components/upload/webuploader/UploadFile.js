/**
 * Created by zhouyc on 2015/12/18.
 */
define("UploadFileController",
    [
        'WebUploaderPlugin'
    ],
    function (aa) {
        var thumbnailWidth = 200,
            thumbnailHeight = 200;

        window.WebUploader = aa.Uploader;

        var uploadCtr = avalon.define({
            $id: 'UploadFileController',

            imageList: [],
            imageList1: [],
            imageList2: [],
            fileList1: [],
            fileList2: [],
            fileList3: [],

            clearUploadImg: function () {
                uploadCtr.imageList1.clear();
            },


            initList: function (list, listName, type) {
                var pd = [];
                avalon.each(list, function (i, it) {
                    if (type == 'file') {
                        pd.push({
                            state: 'success',
                            value: it['id'],
                            name: it['fileName'],
                            link: '/r/file/download?fileId=' + it['id'],
                            thumbUrl: '/r/file/download?fileId=' + it['id'],
                            progress: '0%'
                        });
                    } else {
                        pd.push({
                            state: 'success',
                            value: it,
                            thumbUrl: '/r/file/download?fileId=' + it,
                            progress: '0%'
                        });
                    }
                });

                uploadCtr[listName] = pd;
            },

            inited: false,

            init: function (uploadBtn, listName, filters, server, success) {

                uploadCtr.imageList.clear();
                uploadCtr.imageList1.clear();
                uploadCtr.imageList2.clear();
                uploadCtr.fileList1.clear();
                uploadCtr.fileList2.clear();
                uploadCtr.fileList3.clear();

                if (uploadCtr.inited) {
                    //return;
                }

                uploadCtr.inited = true;

                filters = filters || '*';
                //'gif,jpg,jpeg,bmp,png'

                var uploadList = uploadCtr[listName];

                var uploader = WebUploader.create({
                    duplicate: true,

                    // 选完文件后，是否自动上传。
                    auto: true,

                    // swf文件路径
                    swf: base + 'plugins/webuploader/Uploader.swf',

                    // 文件接收服务端。
                    server: server || '/r/file/upload',

                    // 大小限制 100M
                    fileSizeLimit: 1024 * 1024 * 100,

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
                    uploadList.unshift({
                        id: file.id,
                        name: file.name,
                        state: 'queued',
                        value: '',
                        thumbUrl: '',
                        link: 'javascript:;',
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

                    if (result.list && result.list.length && success) {
                        success(result);
                    } else {
                        el.value = result.value;
                        el.link = 'r/content/downloadFile?fileId=' + result.value;
                    }
                });

                // 文件上传失败，显示上传出错。
                uploader.on('uploadError', function (file) {
                    var el = getItemById(uploadList, file.id);
                    if (!el) {
                        return;
                    }
                    el.state = 'fail';
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
                    if (err == 'Q_EXCEED_SIZE_LIMIT') {
                        alert("文件超过100M限制");
                    } else if (err == 'Q_TYPE_DENIED') {
                        alert("请上传excel文件");
                    } else if(err == 'F_DUPLICATE'){
                        alert("文件重复上传");
                    }else{
                        alert("上传失败");
                    }
                });

                //window[uploadBtn] = uploader;
            },

            getUploadFileValue: function (listName, limit) {
                limit = limit || 1;

                var p = [];
                var list = uploadCtr[listName];
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

        return uploadCtr;
    });