# 极客时间《架构师训练营》第七周课后作业

## 第一题

> 性能压测的时候，随着并发压力的增加，系统响应时间和吞吐量如何变化，为什么？

贴一张经典的的性能测试曲线图：

![性能测试曲线][1]

并发量与响应时间和吞吐量的关系，通俗来说可以分为三个阶段：

1. 轻负载阶段

    这个阶段负载远未达到系统软硬件瓶颈，资源随时待命，请求被以最快的速度计算返回。响应时间保持平稳，几乎为最短消耗时间；吞吐量与负载也呈线性增长关系。

2. 重负载阶段

    该阶段系统无法再实现一次性处理所有响应了，受某些资源的限制，一些请求被阻塞在队列内，但软硬件依旧可以承受这种负载；响应时间开始单调递增，吞吐量保持相对稳定。

3. 压垮阶段

    这个阶段软硬件已无法承受这么大的负载了，系统资源消耗殆尽；响应时间垂直上涨，吞吐量呈断崖式下降。

## 第二题

> 用你熟悉的编程语言写一个 web 性能压测工具，输入参数：URL、请求总次数、并发数。输出参数：平均响应时间、95%响应时间。用这个测试工具以 10 并发、100 次请求压测百度（或其他网站）

我是前端开发，用 Typescript（Javascript 超集）写并发有天然的语言优势😄

### 预热

先准备两个方法，即响应时间的平均数和 95% 数：

```typescript
// utils.ts
export function response_avg(arr: number[]): number {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

export function response_95(arr: number[]): number {
  arr.sort((a, b) => a - b);
  const idx: number = (arr.length * 0.95) | 0;
  return arr[idx];
}
```

### fetch 方法

请求函数我用到了[axios][2]库，但是原生的 axios 请求不能计算响应时间，所以魔改了一下：

1. 给它的拦截器加了两个中间件：为 request 添加发起时间，为 response 计算响应时间
2. 封装了 axios，export `fetch` 方法并返回本次请求的响应时间

```typescript
// fetch.ts
import axios from "axios";

axios.interceptors.request.use( (config: Config) => {
  config.meta = { requestStartedAt: new Date().getTime() }
  return config;
})

axios.interceptors.response.use((response: Response) => {
  response.responseTime = new Date().getTime() - response.config.meta.requestStartedAt;
  return response;
});

export function fetch(url: string): Promise<number> {
  return axios(url).then((response: Response) => response.responseTime);
}
```

### 并发池

并发设计的思路很简单，就是建一个并发池；假设并发数为 10，就在这个并发池里放 10 个执行器——executor。TS 有个好处就是不用开多线程，天然的异步语言；直接 `Promise.all` 就可以并发执行池子里所有的 executor 了。

```typescript
// concurrency = 10;
while(concurrency--){
  asyncPool.push( executor() );
}

await Promise.all(asyncPool)
```

### 执行器

Executor 的设计，我用到了 `Promise-then` 可以串行执行异步函数的功能。通过递归调用，并发池里的 executor 就会不断地消费请求，直到完成目标请求数。

```typescript
function executor(requests: boolean []) {

  const tail: boolean  = requests.pop();

  if(tail === undefined) return;

  return fetch(url)
    .then(() => executor(requests));
}
```

这里的参数 `requests` 指的是所有请求的集合，方便起见我用了一个 boolean 数组表述。所有的 executor 都会竞争执行这个数组里的请求，直至为 0。

### 返回结果

把上述代码组合起来，就得到了一个统计输出函数了：

`p.s.` executor 方法我多加了一个 rts 的参数，为的是保存每个请求的响应时间。

```typescript
async function getResult(args: {url: string, concurrency: number, times: number}) {

  function executor(requests: boolean [], rts: number[] = []) {

    const tail: boolean  = requests.pop();

    if(!tail) return Promise.resolve(rts)

    return fetch(args.url)
      .then((rt) => executor(requests, [...rts, rt]));
  }

  const requests: boolean[] = [...Array(args.times)].fill(true);
  const asyncPool: Promise<number[]>[] = [];
  let limit: number = args.concurrency;

  while( limit-- ) {
    asyncPool.push( executor(requests) )
  }

  return Promise.all(asyncPool)
    .then((rts) => {
      const responseTimes: number[] = rts.flat()

      return {
        avg: response_avg(responseTimes),
        res_95: response_95(responseTimes),
      };
    });
}
```

附上 github 源码：[main.ts][3]

最后，我试了一下百度的响应结果：`{ avg: 2511.72, res_95: 2854 }`， 平均要 2 秒多；感觉挺慢的，看了一下浏览器加载时间也差不多，应该是百度需要加载的资源太多了吧。我又测了一下自家的网站：`{ avg: 473.87, res_95: 657 }`，竟然比百度要快😂，总算我平日里没白忙活。

[1]: ./img/concurrent.png
[2]: https://github.com/axios/axios
[3]: https://github.com/an-Onion/architect-camp/blob/master/chapter%206/src/main.ts
