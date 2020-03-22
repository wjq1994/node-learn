/**
 * 调试方法：
 * 1) 可以在浏览器中调试 
 *    - node --inspect-brk 文件名 
 *    - chrome://inspect
 * 2) 可以在vscode中调试
 */

/**
 * 调试常见问题：
 * 1. 断点打在require上进不去
 * - 更改调试配置文件（注释掉）
 * - "skipFiles": [ 
 * -    "<node_internals>/**"
 * - ],
 */

let a = require("./txt/a.js");

console.log(a);