str = "abc.aaa = 1";

let fn = new Function("abc", str);

let abc = {
    aaa: 2
}

fn(abc);

setTimeout(() => {
    console.log(abc)
}, 0)

