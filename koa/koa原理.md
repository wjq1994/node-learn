# koa原理
- listen
- ctx 上下文对象
- use方法
- 异常错误处理

### listen

> 功能

启动服务，监听端口实现

> 应用

```javascript
const Koa = require('koa'); // babel
const app = new Koa(); // 创建一个app实例
app.listen(3000);
```

> 源码

```javascript
const http = require("http");

module.exports = class Application {
    constructor() {

    }
    handleRequest(req, res) {

    }
    listen((...args) {
        // 功能：实现创建http服务
        // 通过bind 绑定这个方法,可以在构造函数中绑定
        // 箭头函数的方式改变this
        // const server = http.createServer(this.handleRequest); 这里的this指代的是http.createServer
        // 将handleRequest里的环境改为当前class
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}
```

### ctx上下文对象

> 实现功能

ctx 包含了原生的请求 和响应  req ，res，包含了自己封装的请求和响应 request response

```javascript
console.log(ctx.req.path); // 原生的url
// 自己封装的request上有原生的req属性
console.log(ctx.request.req.path); 
// pathname  => url.parse()
console.log(ctx.request.path); // 自己封装的url属性
// 简写
console.log(ctx.path); // 他表示的是 ctx.request.url
```

> 应用

```javascript
const Koa = require('koa');
// 创建app的应用
let app = new Koa();

app.use((ctx)=>{
    console.log(ctx.req.url); // 原生的url
    // 自己封装的request上有原生的req属性
    console.log(ctx.request.req.url); 
    // pathname  => url.parse()
    console.log(ctx.request.path); // 自己封装的url属性
    // 简写
    console.log(ctx.path); // 他表示的是 ctx.request.url
});
// req 和 request的区别   request.req = req;
// ctx.path = ctx.request.path 内部就是defineProperty 代理

app.listen(3000,()=>{
    console.log(`server start 3000`)
});
// ctx 包含了原生的请求 和响应  req ，res
//     包含了自己封装的请求和响应 request response
```

> 源码

```javascript
//application.js

const http = require("http");
const response = require('./response');
const request = require('./request');
const context = require('./context');

module.exports = class Application {
    constructor() { 
        // 默认先将response  request context 进行拷贝
        this.response = Object.create(response);
        this.request = Object.create(request);
        this.context = Object.create(context); // this.context.__proto__ = context
    }
    use(callback) {
        this.callback = callback;
    }
    createContext(req,res){
        // 每次请求上下文 都应该是独立的
        let response = Object.create(this.response);
        let request = Object.create(this.request);
        let context = Object.create(this.context);  
        // 处理
        context.request = request;
        context.req = context.request.req= req;  // context.__proto__.__proto__ 

        context.response = response;
        context.res =  context.response.res = res;

        context.response.req = req;
        context.request.res = res;
        // context卖的context 没关系 
        return context;
    }
    handleRequest(req, res) {
        // 创建一个上下文环境
        let ctx = this.createContext(req, res);

        this.callback(ctx);
    }
    listen((...args) {
        // 功能：实现创建http服务，
        // 通过bind 绑定这个方法,可以在构造函数中绑定
        // 箭头函数的方式改变this
        // const server = http.createServer(this.handleRequest); 这里的this指代的是http.createServer
        // 将handleRequest里的环境改为当前class
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

```

### use 方法

> 功能

实现中间件逻辑，将多个中间件放入数组中

1. app.use 在listen之前调用
2. 两个参数 ctx（执行上下文） next（执行下一个中间件）
3. 一个use里只能调用一次next
4. 把多个promise 组合成一个promise 这个promise完成后 去拿 最终的结果显示给用户 (封装compose方法)

> 应用

```javascript
const Koa = require('koa'); // babel
const app = new Koa(); // 创建一个app实例

let sleep = async () => {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("睡觉");
            resolve();
        }, 2000)
    });
}

// 请求到来时会执行此方法
app.use((ctx, next)=>{
    console.log(1);
    next();
    console.log(2)
});
app.use(async (ctx, next)=>{
    console.log(3);
    await sleep();
    next();
    console.log(4);
});
app.use((ctx, next)=>{
    console.log(5);
    next();
    console.log(6)
});
app.listen(3000, () => {
    console.log(`server start at 3000`);
});
```

> 源码

```javascript
const http = require("http");
const response = require('./response');
const request = require('./request');
const context = require('./context');

module.exports = class Application {
    constructor() { 
        // super();
        // 默认先将response  request context 进行拷贝
        this.response = Object.create(response);
        this.request = Object.create(request);
        this.context = Object.create(context); // this.context.__proto__ = context
    
        this.middlewares = []; // 存放所有的use方法
    }
    use(callback) {
        this.middlewares.push(callback);
    }
    createContext(req,res){
        // 每次请求上下文 都应该是独立的
        let response = Object.create(this.response);
        let request = Object.create(this.request);
        let context = Object.create(this.context);  
        // 处理
        context.request = request;
        context.req = context.request.req= req;  // context.__proto__.__proto__ 

        context.response = response;
        context.res =  context.response.res = res;

        context.response.req = req;
        context.request.res = res;
        // context卖的context 没关系 
        return context;
    }
    compose(ctx){
        // 默认将middlewares 里的第一个执行
        let index = -1; // 默认一次都每调用
        const dispatch = (i)=>{ // 0
            let middleware = this.middlewares[i];
            // 第一次调用将值保存到了index中
            if (i ==index){
                return Promise.reject(new Error('next() called multiple times my ----'))
            }
            // index = 1
            index = i; // 相当于第一次调用时 我把index 变成0
            // 如果执行完毕后 有可能返回的不是promise
            if(i === this.middlewares.length){
                return Promise.resolve();
            }
            // 链式等待 默认先执行第一个 之后如果用户调用了await next()
            try{ // 这里需要增加try/catch 否则直接抛错 需要补货异常
                return Promise.resolve(middleware(ctx,()=>dispatch(i+1)));
            }catch(e){
                return Promise.reject(e);
            }
        }
        return dispatch(0); // 默认取出第一个执行
    }
    handleRequest(req, res) {
        // 创建一个上下文环境
        let ctx = this.createContext(req, res);

        this.compose(ctx).then(()=>{    
            res.end("hello koa");
        }).catch(err=>{
            this.emit('error',err);
        })
    }
    listen(...args) {
        // 功能：实现创建http服务，
        // 通过bind 绑定这个方法,可以在构造函数中绑定
        // 箭头函数的方式改变this
        // const server = http.createServer(this.handleRequest); 这里的this指代的是http.createServer
        // 将handleRequest里的环境改为当前class
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

```

> 学习总结

1. koa 里面用的是洋葱模型 把方法都套起来  co -> next （重要******）
2. koa中可以使用async + await方法
3. 我们执行koa时  每个next 方法都需要前面都要增加await 否则不会有等待效果

### 异常错误处理

> 实现功能 

koa为了统一处理错误  就将每个函数都转化成promise ，为了方便错误处理

> 源码

```javascript
compose(ctx){
    // 默认将middlewares 里的第一个执行
    let index = -1; // 默认一次都每调用
    const dispatch = (i)=>{ // 0
        let middleware = this.middlewares[i];
        // 第一次调用将值保存到了index中
        if (i ==index){
            return Promise.reject(new Error('next() called multiple times my ----'))
        }
        // index = 1
        index = i; // 相当于第一次调用时 我把index 变成0
        // 如果执行完毕后 有可能返回的不是promise
        if(i === this.middlewares.length){
            return Promise.resolve();
        }
        // 链式等待 默认先执行第一个 之后如果用户调用了await next()
        try{ // 这里需要增加try/catch 否则直接抛错 需要补货异常
            return Promise.resolve(middleware(ctx,()=>dispatch(i+1)));
        }catch(e){
            return Promise.reject(e);
        }
    }
    return dispatch(0); // 默认取出第一个执行
}
```

### 技术总结

1. handleRequest方法每一回客户端调用都会执行一遍，所以里面的值需要独立一份
2. 封装框架时，注意绑定this为当前框架实例（bind）
3. 洋葱模型 利用co --> next模型  处理将多个异步转化为一个异步的链式调用
4. 利用defineProperty属性实现代理功能 （ctx.url === ctx.request.url）
5. 异步处理逻辑 ？？？