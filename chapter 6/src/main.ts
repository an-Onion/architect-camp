import {fetch} from './fetch';
import {response_95, response_avg} from './utils';

async function getResult(url: string, concurrency: number, times: number) {
  const costs: number[] = [];
  const rounds: number = times / concurrency;

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

getResult('https://www.baidu.com', 10, 100).then(console.log);
