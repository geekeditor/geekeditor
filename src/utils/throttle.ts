export function throttle(fn: Function, delay: number) {
    let last = 0,
        timer: any = null;

    return function (...args: any[]) {
        // const context = this;
        // const args = arguments;
        const now = +new Date();

        clearTimeout(timer);
        if (now - last < delay) {
            timer = setTimeout(() => {
                last = now;
                fn.apply(this, args);
            }, delay);
        } else {
            last = now;
            fn.apply(this, args);
        }
    };
}

export function debounce(fn: Function, delay: number) {
    // 定时器
    let timer: any = null
    
    // 将debounce处理结果当作函数返回
    return function () {
      // 保留调用时的this上下文
      let context = this
      // 保留调用时传入的参数
      let args = arguments
  
      // 每次事件被触发时，都去清除之前的旧定时器
      if(timer) {
          clearTimeout(timer)
      }
      // 设立新定时器
      timer = setTimeout(function () {
        fn.apply(context, args)
      }, delay)
    }
  }