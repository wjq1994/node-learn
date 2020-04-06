const http = require('http');
const response = require('./response');
const request = require('./request');
const context = require('./context');
const EventEmitter = require('events');
const Stream = require('stream')
// 多个人 通过同一个类 实例化不同对象
module.exports = class Application extends EventEmitter {
    constructor(){
        super();
        // 默认先将response  request context 进行拷贝
        this.response = Object.create(response);
        this.request = Object.create(request);
        this.context = Object.create(context); // this.context.__proto__ = context

        this.middlewares = []; // 存放所有的use方法
        this.handleEmit();
    }
    use(callback){
        this.middlewares.push(callback); // [fn,fn,fn]
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
        // context 和外面的context 没关系 
        return context;
    }
    compose(ctx){
        // 默认将middlewares 里的第一个执行
        let index = -1; // 默认一次都每调用
        const dispatch = (i)=>{ // 0
            let middleware = this.middlewares[i];
            // 第一次调用将值保存到了index中
            if (i == index){
                return Promise.reject('next() called multiple times my ----');
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
    handleEmit() {
        this.on('error', (err) => {
            console.log("程序错误：", err);
        })
    }
    handleRequest(req,res){
        // 每回客户端请求都要走这个方法
        // this
        // 通过请求和响应 + 自己封装的request和response 组成一个当前请求的上下文 
        let ctx = this.createContext(req,res);
        // 组合多个函数
        res.statusCode = 404;
        this.compose(ctx).then(()=>{    
            let body = ctx.body;
            // 默认是字符串或者buffer
            if(typeof body === 'string' || Buffer.isBuffer(body)){
                res.end(body);
            }else if(body instanceof Stream){
                // 需要下载此文件
                res.setHeader('Content-Disposition',`attachment;filename=${ctx.path.slice(1)}`);
                body.pipe(res);
            }else if(typeof body == 'object'){
                res.end(JSON.stringify(body));
            }else if(typeof body == 'number'){
                res.end(body + '');
            }else{
                res.end('Not found')
            }
            
        }).catch(err=>{
            this.emit('error',err);
            res.end('error')
        })
    }
    listen(...args){
        // 通过bind 绑定这个方法,可以在构造函数中绑定
        // 箭头函数的方式改变this
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

