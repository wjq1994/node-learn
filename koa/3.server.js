const Koa = require('./koa'); // babel
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
    ctx.body = "hello";
    debugger;
    next();
    //throw new Error("我是错误");
    console.log(2);
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

// 1.listen
// 2.use 方法
// 3.ctx 上下问对象
// 4.监控错误

// 目录结构
// application 应用文件 默认引用的
// req/res (node中的默认的 req,res)
// request response (这个属性是koa自己封装的)
// context 上下文 整合 req\res\request\response