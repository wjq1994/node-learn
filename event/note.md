## 第三方模块 (包)查找策略

- 默认查找node_modules文件，找同名的文件夹，默认找的是index.js 以main为入口
- 如果当前目录下 没有node_modules 会像上级查找，一直找到根目录 找不到则报错

```javascript
let r = require('a')
console.log(module.paths)
```

## 文件查找策略

- 尽量不要文件和文件夹的名字一置
- 文件查找方式 (会先找文件，先添加.js .json 如果找不到，在找文件夹)
```javascript
let r = require('./a')
console.log(r)
```

## 继承常用的方法(inherits)

```javascript
let EventEmitter = require('events');
let util = require('util'); // promisify
function xxx(){};
xxx.prototype.__proto__ = EventEmitter.prototype;
xxx.prototype = Object.create(EventEmitter.prototype);
Object.setPrototypeOf(xxx.prototype,EventEmitter.prototype)
util.inherits(xxx,EventEmitter); // 继承原型上的属性或者方法
```

## events 常用模块

```
on，off, emit, newListener
```