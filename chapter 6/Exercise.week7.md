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

## 预热

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

## fetch 方法

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

## 返回结果

TS 的好处就是不用开多线程，它只有单线程，天然的异步语言；直接`Promise.all` 就可以发送一组异步请求了😅

实现上如下：

1. 先用请求总数 `/` 并发数计算轮数
2. 每一轮用 `Promise.all(gets)` 并发请求
3. `await` 该轮响应时间并保存结果
4. 开始下一轮，重复步骤2，直到结束

`p.s.` 简单起见我没有对最后一轮不满足并发总数的情况进行处理，我想现实中也不会吧

```typescript
import {fetch} from './fetch';
import {response_95, response_avg} from './utils';

async function getResult(url: string, concurrency: number, times: number) {
  const costs: number[] = [];
  const rounds: number = Math.ceil( times / concurrency );

  for (let i = 0; i < rounds; i++) {
    const gets: Promise<number>[] = [...Array(concurrency)].map(() => fetch(url));
    const response:  number[] = await Promise.all(gets);
    costs.push(...response);
  }

  return {
    avg: response_avg(costs),
    res_95: response_95(costs),
  };
}
```

最后，我试了一下百度的响应结果：`{ avg: 2661.06, res_95: 3801 }`， 平均要 2 秒多；感觉挺慢的，看了一下浏览器加载时间也差不多，应该是百度需要加载的资源太多了吧。我又测了一下自家的网站：`{ avg: 473.87, res_95: 657 }`，竟然比百度要快😂，果然我平常没白忙活。

[1]: ./img/concurrent.png
[2]: https://github.com/axios/axios
