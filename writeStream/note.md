##  线性结构
- 数组
- 队列
- 栈
- 链表

### 数组
```javascript
Array
```
### 队列（先进先出）
```javascript
var queue = new Array();
// unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
queue.unshift(1);
queue.unshift(2);
queue.unshift(3);
queue.unshift(4);
// pop() 方法用于删除并返回数组的最后一个元素。
var first = queue.pop();
console.log(first); // 结果为1，先进先出
```
### 栈（先进后出）
```javascript
var stack = new Array();
stack.push(1);
stack.push(2);
stack.push(3);
stack.push(4);
var first = stack.pop();
console.log(first);// 结果为4，先进后出
```
### 链表
- 单向链表  
- 单向循环链表
- 双向链表  最常用
- 双向循环链表
- 环形链表
> 单向链表
```javascript

```