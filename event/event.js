let eventEmitter = require('events');
let util = require('util');

function Learn() {

}

util.inherits(Learn, eventEmitter);

let learn = new Learn();

learn.on("学习", function(what) {
    console.log("学习" + what)
})

learn.on("学习", function(what) {
    console.log("学习" + what)
})
learn.emit("学习", "计算机");
