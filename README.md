# avalon2_components
开发avalon2组件

## 分页组件

```js
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