/**
 * 单向链表
 * 1.节点
 * 2.链表操作
 */

 class Node {
     constructor(element, next) {
         this.element = element;
         this.next = next;
     }
 }

 class LinkedList { // 链表功能 增删改查
     constructor() {
        this.head = null;
        this.size = 0;
     }
     _node(index) {
        // 获取索引也可能有越界问题
        if (index < 0 || index >= this.size) {
            throw new Error('边界越界');
        }
        let currentNode = this.head;
        // 从0开始找 找到索引处
        for (let i = 0; i < index; i++) {
            currentNode = this.head.next;
        }
        return currentNode;
     }
     add(index, element) {
        if (arguments.length === 1) {
            element = index;
            index = this.size;
        }
        console.log(index)
        // 获取索引也可能有越界问题
        if (index < 0 || index > this.size) {
            console.log(2222)
            throw new Error('边界越界');
        };
        if (index === 0) {
            let newNode = new Node(element, this.head);
            this.head = newNode;
        } else  {
            let prevNode = this._node(index - 1);
            let newNode = new Node(element, prevNode.next);
            prevNode.next = newNode;
        }

        this.size++;
     }
     // 获取节点
     get(index) {
        this._node(index);
     }
     // 设置节点
     set(index, element) {
        let node = this._node(index);
        node.element = element; // 修改节点内容
     }
     remove(index) {
        if (index === 0) {
            if(this.size == 1){ // 如果只有一个 就直接删除这个即可
                this.head = null;
            }else{ // 如果要是多个就让头指向他的下一个，并且让尾指向这个头
                let last = this._node(this.size-1); // 取到最后一个
                this.head = this.head.next; // 让头部删除掉
                last.next = this.head;  // 让尾部的下一个指向新头
            }
        } else {
            let prevNode = this._node(index - 1);
            prevNode.next = prevNode.next.next;
        }
        this.size--; 
     }
     clear() {
         this.head = null;
         this.size = 0;
     }
 }

 let linkedList = new LinkedList();
 linkedList.add(0, 1);


 linkedList.get(0);
 console.log(linkedList);