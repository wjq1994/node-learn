const Koa = require('./koa');
const app = new Koa();
const fs = require('fs');
const file = fs.createReadStream('./1.server.js')

app.use((ctx,next)=>{
  ctx.body = '123'
})
app.on('error',function (err) {
    console.log(err);
})
app.listen(3000);


