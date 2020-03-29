# 流操作

## read write 读写操作

读取操作 是将内容写到内存中

写操作的话 是将内存中的内容读取出来

## 文件权限

权限分为三种: 读取权限 写入权限 执行权限

rwx(表示自己用户是否可读可写可执行) rwx(我所属组是否有读写执行的权限) rwx(全局)

## 常用手动api

- fs.open
- fs.read
- fs.write
- fs.close

> 读取相关
```javascript
//fd 文件描述符 它代表了文件name.txt拥有了读取这个文件的权限 类型是一个number类型
//(1) 读取相关 指定范围和读取的格式来操作
let buf = Buffer.alloc(3); // 将读取到的内容写入到buffer中
fs.open(path.resolve(__dirname,'./name.txt'),'r',438,(err,fd)=>{
    // fd 表示文件描述符 
    // buf就是写入到哪个内存中
    // 0 从buffer的哪个位置开始写入
    // 3 表示的是写入多少个
    // 0 代表的是从文件的哪个位置开始读取
    fs.read(fd,buf,0,3,3,(err,bytesRead)=>{ // bytesRead 当前读取到的真实的个数 
        console.log(buf.toString()); // fs.close()
    })
});
```

> 写相关

```javascript
let buf = Buffer.from('中发把百');
fs.open(path.resolve(__dirname, 'name.txt'), 'w', 0o666,(err, fd) => {
    // 将buffer的偏移第九个的位置 读取3个出来，写入到文件的第0个位置
    fs.write(fd, buf, 9, 3, 0, (err, written) => {
        console.log('文件写入成功'); // fs.close(0)
    })
});
```

> copy文件（边读边写）

```javascript
// copy  u 盘
const BUFFER_SIZE = 5;
const buffer = Buffer.alloc(BUFFER_SIZE);
let readOffset = 0;

// 异步嵌套的问题 嵌套了很多层

// 发布订阅模式  讲读写操作进行解耦，解耦后 就可以把读写操作进行分离
// 文件流：可读流 可写流
fs.open('./name.txt', 'r', (err, rfd) => {
    fs.open('./name1.txt', 'w', (err, wfd) => {
        function next(){
            // bytesRead 代表的是真实读取到的个数
            fs.read(rfd, buffer, 0, BUFFER_SIZE, readOffset, (err, bytesRead) => {
                // 写的话可以不填写偏移量
                if(!bytesRead){
                    fs.close(rfd,()=>{});
                    fs.close(wfd,()=>{});
                    return;
                }
                readOffset += bytesRead;
                fs.write(wfd, buffer, 0, bytesRead, (err, written) => {
                    next();
                })
            })
        }
        next();
    });
});
```

## ReadStream

> 发布订阅模式 （核心*********）

将读写操作进行解耦，解耦后 就可以把读写操作进行分离

node中的发布订阅（events）

发布订阅模式可以解决异步嵌套的问题 嵌套了很多层

```javascript
let EventEmitter = require('events');
let fs = require('fs');
class ReadStream extends EventEmitter{
    constructor(path,options={}) {
        super();
        // 1.会将用户传入的参数全部放到实例上，这样方便后续使用
        this.path = path;
        this.flags = options.flags || 'r';
        this.mode = options.mode || 438;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;
        this.end = options.end;
        this.highWaterMark = options.highWaterMark || 64*1024;

        // 读取文件每次都需要一个偏移量
        this.pos = this.start; // 每次读取时的偏移量

        // 打开文件
        this.open(); // 实现打开文件的操作

        // 这个方法可以监听到用户调用on事件
        this.on('newListener',(type)=>{
            if(type == 'data'){
                this.read(); // 开始读取文件即可
            }
        })

    }
    open(){
        fs.open(this.path,this.flags,this.mode,(err,fd)=>{
            if(err){
                return this.emit('error',err)
            }
            // 文件打开后就拥有了文件描述符
            this.fd = fd;
            this.emit('open',fd)
        })
    }
    close(){
        fs.close(this.fd,()=>{
            this.emit('close');
        });
    }
    read(){
        if(typeof this.fd !== 'number'){
           return this.once('open',this.read) 
        }
        // 这里可以开始读取文件了
        let buffer = Buffer.alloc(this.highWaterMark);
        // 计算一下每次读取的个数 可能不会把文件读取完毕
        let howMuchToRead = this.end?Math.min(this.end-this.pos+1,this.highWaterMark):this.highWaterMark
        fs.read(this.fd,buffer,0,howMuchToRead,this.pos,(err,bytesRead)=>{
            if(bytesRead){
                this.pos += bytesRead;
                // 要根据读取的个数进行截取，将读取到的内容发射出来
                this.emit('data',buffer.slice(0,bytesRead));
                this.read();
            }else{
                this.emit('end');
                this.close();
            }
        })
    }
}
module.exports = ReadStream
```