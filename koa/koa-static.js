let fs = require('fs').promises;
let path = require('path')

const static = (filePath) => {
    return async (ctx, next) => {
        let pathUrl = path.join(filePath,ctx.path);
        try{
            let statObj = await fs.stat(pathUrl);
            if (statObj.isFile()) {
                ctx.set('Content-Type', 'text/html;charset=utf-8');
                ctx.body = await fs.readFile(pathUrl)
            } else {
                await next();
            }
        }catch(e){
            await next()
        }
        
    }
}
module.exports = static;