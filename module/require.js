// 1) 要先将 ./a的文件转化为绝对路径
// 2) 读取这个文件, 需要增加一个函数 函数内部需要返回module.exports
// 3) 让函数执行
// 4) new Module 创建模块 根据文件名来创建  exports  id

// module.load 加载模块
//  Module._extensions 代表的是一个对象 对象上放着很多处理的方法
// exports, require, module, __filename, __dirname

// 4) 最终返回的是module.exports

let path = require("path");
let fs = require("fs");
let vm = require('vm');

function Module(id) {
    this.id = id;
    this.exports = {};
}

Module._extensions = {
    //利用 vm.runInThisContext
    ".js"(module) {
        let script = fs.readFileSync(module.id,'utf8');
        let fnStr = wrapper[0] + script + wrapper[1];
        let fn = vm.runInThisContext(fnStr);
        let exports = module.exports; // exports 和 module.exports
        // 不能直接改变exports 他是不会影响module.exports

        // 清楚 这五个参数
        fn.call(exports,exports, req, module,module.id,path.dirname(module.id));
    },
    // 利用new Function 不用 wrapper
    // ".js"(module) {
    //     let script = fs.readFileSync(module.id,'utf8');
    //     let fn = new Function("exports", "require", "module", "__filename", "__dirname", script);
    //     let exports = module.exports; // exports 和 module.exports
    //     // 不能直接改变exports 他是不会影响module.exports

    //     // 清楚 这五个参数
    //     fn.call(exports,exports, req, module,module.id,path.dirname(module.id));
    // },
    ".json"(module) {
        //获取文件内容
        let script = fs.readFileSync(module.id);
        return module.exports = JSON.parse(script);
    }
}

Module._cache = {};

let wrapper = [
    '(function(exports, require, module, __filename, __dirname){',
    '\n})'
]

function tryModuleLoad(module) {
    //获取文件后缀名
    let extName = path.extname(module.id);
    Module._extensions[extName](module);
}

function req(fileRelativeName) {
    let id = resolvePath(fileRelativeName);
    let cacheModule = Module._cache[id]
    if(cacheModule){ // 实现模块的缓存机制
        return cacheModule.exports
    }
    //加入缓存
    let module = new Module(id);
    Module._cache[id] = module;
    // 加载这个模块 在这个方法中对module进行了改变
    tryModuleLoad(module);
    return module.exports;
}

//解析路径
function resolvePath(fileName) {
    let r = path.resolve(__dirname, fileName);
    // 需要看下文件路径是否存在 如果不存在尝试添加.js 和 .json后缀
    let isExists = fs.existsSync(r);
    if (isExists) {
        return r;
    } else{
        let keys = Object.keys(Module._extensions);
        for(let i = 0 ; i<keys.length;i++){
            let ext = keys[i];
            let tryFilename = r + ext;
            if (fs.existsSync(tryFilename)){
                return tryFilename;
            }
        }
        throw new Error('module not found');
    }
}


let str = req('./txt/a.js');
console.log(str);