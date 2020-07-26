const { fork } = require('child_process');

function loop() {
    let forked = fork('index.js');
    // let forked = fork('child.js');

    // forked.on('message', (msg) => {
    //   console.log('Message from child', msg);
    // });

    forked.send({ msg: '开始子进程' });

    forked.on('close', function (code) {
      console.log('子进程已退出，3秒后重启，退出码 ' + code);

      setTimeout(function () {
          loop();
      }, 3000);
    });
}
loop();
