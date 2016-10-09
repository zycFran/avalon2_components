# avalon2_components
开发avalon2组件

## 分页组件

```js
var ui_pager = require('./components/pager/ui.pager');
pager_config: {
    showPages: 5,
    pages: [],
    totalPages: 15,
    currentPage: 1,
    firstText: '首页',
    prevText: '上一页',
    nextText: '下一页',
    lastText: '末页',
    onPageClick: function(e, p){},
}
```
## 下拉组件

```js
var ui_dropdown = require('./components/dropdown/ui.dropdown');
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
}
```
## 轮播组件

```js
var ui_carousel = require('./components/carousel/ui.carousel');
carousel_config: {
    pictures: [
        {
            pic: 'resources/images/banner/1.jpg',
            href: 'javascript:;',
            alt: "banner"
        },
        {
            pic: 'resources/images/banner/2.jpg',
            href: 'javascript:;',
            alt: "banner"
        }
    ],
    arrowLeftSrc: "resources/images/banner/arrows-left-icon.png",
    arrowRightSrc: "resources/images/banner/arrows-right-icon.png",
    adaptiveWidth: 980,
    adaptiveHeight: 400,
    alwaysShowArrow: false,
    hoverStop: false,
    timeout: 5000, //@param timeout 切换时间间隔
    during: 400   //@param during 切换速度，越小越快，单位为毫秒,
}
```

## 时间组件 (基于MyDate97)

```js
var ui_datetimepicker = require('./components/datetimepicker/ui.datetimepicker');
datetimepicker_config: {
    $options: {
        dateFmt: 'yyyy-MM-dd HH:mm:ss',
        autoPickDate: true
    }
}
```

## address_config (仿淘宝 省市区三级)

```js
var ui_address = require('./components/address/ui.address');
address_config: {
    levels: [
        { name: '省份', selectItem: []},
        { name: '城市', selectItem: []},
        { name: '县区', selectItem: []}
    ]
}
```
## upload_config (上传 基于webuploader)

```js
var ui_upload = require('./components/upload/ui.upload');
upload_config: {
   $fileSizeLimit: 1024 * 1024 * 100, // 大小限制 100M
   $errorText: {},
   $filters: 'gif,jpg,jpeg,bmp,png',
   $uploadServer: '/r/file/upload',
   uploadText: '上传图片',
   getThumbUrl: function (serial) {
       return 'r/content/downloadFile?fileId=' + serial;
   }
}
upload2_config: {
   $fileSizeLimit: 1024 * 1024 * 100, // 大小限制 100M
   $filters: '*',
   uploadText: '上传文件',
   $uploadServer: '/r/file/upload',
   getThumbUrl: function (serial) {
       return 'r/content/downloadFile?fileId=' + serial;
   }
}
```

## dialog_config (对话框)

```js
var dialog = require('./components/dialog/ui.dialog');
var dialogHandler = function(){
   var d = dialog({
       title: '提示',
       content: '确认删除？',
       cancelValue: '取消',
       cancel: function () {
       },
       okValue: '确认',
       ok: function () {
           var that = this;
           this.title('正在提交..');
       }
   });
   d.showModal();
};
var tipHandler = function (callback) {
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
```