## read/write
- 读取的编码没有指定的化都是buffer类型
- 默认写都会转化成utf8格式来进行存储 （并且会将文件清空，如果文件没有会创建文件)
- 在代码运行期间最好使用异步，运行期间使用同步代码会造成阻塞问题

## readFile/writeFile
- 这种拷贝不适合大文件进行操作
- 如果大文件操作 需要先读取到内存中，之后将文件写入，可能会浪费掉大量内存 推荐（流）
- 如果文件超过64k 就使用流的方式， 如果要是小于64k 可以直接read write

## mkdirSync（同步）/mkdir（异步）
- 创建目录 必须要先有父级 再有子级 fs.mkdirSync('a/b/c/d/e/f');

```javascript
//
function mkdirSync(path) {
    let arr = path.split('/');
    for (let i = 0; i < arr.length; i++) {
        let p = arr.slice(0, i + 1).join('/');
        // fs.exitsSync  -> exists =>cb(boolean) 
        try {
            fs.accessSync(p)
        } catch {
            fs.mkdirSync(p);
        }
    }
}
mkdirSync('a/b/c/d/e/f/g');
```

```javascript
// mkdir（异步）
function mkdir(path, callback) {
    let arr = path.split('/');
    // co库 递归的创建 next 方法

    let index = 0;

    function next() {
        // 递归要有终止条件
        if (index === arr.length) return callback();
        let p = arr.slice(0, index + 1).join('/');
        fs.access(p, (err) => {
            index++;
            if (err) { // 如果不存在则 创建
                fs.mkdir(p, next)
            } else { // 存在直接跳过创建过程
                next()
            }
        })

    }
    next();
}

mkdir('e/e/e/e/ea/w', () => {
    console.log('成功')
})
```

## rmdirDeepSync/rmdirWideSync（同步）
- 删除文件夹 深度遍历/广度遍历 两种实现算法

```javascript
// 深度遍历 同步
function rmdirDeepSync(p) {
    let statObj = fs.statSync(p);
    if (statObj.isDirectory()) {
        let dirs = fs.readdirSync(p);
        dirs.forEach(dir => {
            let current = path.join(p, dir);
            rmdirSync(current); // 递归删除目录
        });
        fs.rmdirSync(p);
    } else {
        fs.unlinkSync(p); // 如果是文件删除跑路即可
    }
}
rmdirDeepSync('e');
```

```javascript
// 广度遍历
// 遍历树 放在数组中 指针移动 遍历完从后往前删除
function rmdirWideSync(p) {
    let arr = [p];
    let index = 0; // 当前指针
    let current; // 获取当前指针指向谁
    //巧妙的运用while 一直移动指针操作
    while (current = arr[index++]) {
        let statObj = fs.statSync(current);
        if (statObj.isDirectory()) {
            let dirs = fs.readdirSync(current);
            dirs = dirs.map(d => path.join(current, d));
            arr = [...arr, ...dirs]
        }
    }
    for (let i = arr.length - 1; i >= 0; i--) {
        let current = arr[i];
        let statObj = fs.statSync(current);
        if (statObj.isDirectory()) {
            fs.rmdirSync(current);
        } else {
            fs.unlinkSync(current);
        }
    }
}
rmdirWideSync('a');
```

## rmdirDeep/rmdirWide（异步）
- 删除文件夹 深度遍历/广度遍历（异步） 两种实现算法

```javascript
// 异步深度删除
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
```

```javascript
// 广度异步
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
```

## 最终方案（promise）*********

```javascript
// async + await + promise

async function rmdir(p){
    let statObj = await fs.stat(p);
    if(statObj.isDirectory()){
        let dirs = await fs.readdir(p);
        // 等待子目录删除完毕后 删除自己
        dirs = dirs.map(dir => rmdir(path.join(p, dir)));
        await Promise.all(dirs);
        await fs.rmdir(p);
    }else{
        await fs.unlink(p);
    }
}
```