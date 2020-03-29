// fs模块包含着 文件操作的api 同时也包含了 文件夹操作的api

const fs = require('fs');
const path = require('path');

// 递归的写法 只看两层 a a/b a/c 把两层写好 递归就出来了
function rmdirDeep(p,cb) {
    //获取fs状态 判断是文件还是目录
    fs.stat(p, function(err, statObj) {
        if (statObj.isDirectory()) {
            fs.readdir(p, function(err, dirs) {
                dirs = dirs.map(dir => path.join(p,dir)); // a/b a/c
                //异步删除，异步迭代  都要用co库（核心**************很重要） next
                //先删除 a/b 再删除a/c 因为是异步所以要把操作放在回调里
                //当a/b，a/c都删完之后 在删除a
                //index记录子文件个数
                let index = 0;
                function next() {
                    //判断index = dirs.length时，说明子文件夹已经删除完
                    //真正起删除作用的 fs.rmdir
                    if (index === dirs.length) return fs.rmdir(p, cb);
                    let current = dirs[index++];
                    rmdirDeep(current, next);
                }

                next();

            })
        } else {
            fs.unlink(p, cb);
        }
    })
}

// 递归的写法 只看两层 a a/b a/c 把两层写好 递归就出来了
function rmdirWide(p,cb) {
    //获取fs状态 判断是文件还是目录
    fs.stat(p, function(err, statObj) {
        console.log(err);
        if (statObj.isDirectory()) {
            fs.readdir(p, function(err, dirs) {
                dirs = dirs.map(dir => path.join(p,dir)); // a/b a/c
                if (dirs.length === 0) {
                    return fs.rmdir(p, cb);
                };
                let index = 0;
                function done() {
                    index++;
                    if (dirs.length === index) {
                        fs.rmdir(p, cb);
                    }
                };
                dirs.forEach((dir, index) => {
                    rmdirWide(dir, done);
                });
            })
        } else {
            fs.unlink(p, cb);
        }
    })
}

rmdirWide('a', () => {
    console.log("删除完成");
})