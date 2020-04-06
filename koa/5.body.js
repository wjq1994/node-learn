// 当访问 post /form的时候 我需要获取用户在表单中填写的数据
// 当访问 get /form 给用户显示个表单
const Koa = require('koa');
const bodyParser = require('./koa-bodyparser');
const static = require('./koa-static')
const app = new Koa();
 // 为了方便传递参数 所以把中间件 都封装了一个个函数
 app.use(bodyParser());

// 中间件 
app.use(async (ctx, next) => {
    if (ctx.method === 'GET' && ctx.path == '/form') {
        ctx.body = `<form action="/form" method="POST">
            用户名<input type="text" name="username"> <br/>
            密码<input type="text" name="password"> <br/>
            <button>提交 </button>
        </form>`
    } else {
        await next(); // undefined
    }
});
// koa中不能处理回调函数的方式  所有的异步需要全部封装成promise即可

// const body = (ctx)=>{
//     return new Promise((resolve,reject)=>{
//         let arr =[]
//         ctx.req.on('data',function (chunk) {
//             arr.push(chunk);
//         });
//         ctx.req.on('end',function () {
//             resolve(Buffer.concat(arr).toString())
//         })
//     })
// }

app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.path == '/form') {
        ctx.body = await ctx.request.body;
    }else{
        next();
    }
});
app.listen(3000);

app.use(static(__dirname))
app.use(static(require('path').join(__dirname,'node_modules')))

