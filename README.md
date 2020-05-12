# betterSearch
比浏览器CTRF+F更强大的搜索框组件

## 安装

`<script src="https://cdn.jsdelivr.net/npm/bettersearch/dist/index.umd.js"></script>`

or

`npm i --save-dev bettersearch`

## 使用

### 初始化

```javascript
var betterSearch = new BetterSearch({
    domContainer: '#test1'		//搜索区域
})
betterSearch.search(keyword)	//开始搜索，高亮关键字区域
```



### API

| Options | Type   | Required | Default         | Description                                                  |
| ------- | ------ | --------- | --------------- | ------------------------------------------------------------ |
| domContainer | String | YES      |  | 搜索区域 |
| blackClassName | String | No        | []          | 黑名单区域，避免搜索 |



### Event
#### search
开启搜索，高亮关键词
```javascript
betterSearch.search(keyword)
```

#### down/up
定位到上/下一个关键词
```javascript
betterSearch.down()
betterSearch.up()
```

#### clear
清除搜索高亮
```javascript
betterSearch.clear()
```




