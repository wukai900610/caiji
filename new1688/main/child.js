process.on('message', (msg) => {
  console.log('Message from parent:', msg);
});

let counter = 0;

setInterval(() => {
    if(counter == 2){
        process.send({ msg:'err' });
        // a.b.c
        process.exit(0);
    }else{
        process.send({ counter: counter++ });
    }
}, 1000);
