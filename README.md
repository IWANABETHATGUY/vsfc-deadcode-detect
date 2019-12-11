# vscf-deadcode-detect
a repo to detect vue single file component dead code 


## 已知的问题
1. 在vue中这样写是合法的，但是对于一个js表达式是不合法，因此这样的情况，是无法从template中解析出component 中的变量 `cardlist`,因此最好还是用`(card, index) in cardlist`这样的写法
```html
<div v-for="(card, index) of cardlist">{{card}}</div>
```
