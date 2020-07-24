import {fetch} from './fetch';
import {response_95, response_avg} from './utils';

function getResult(
  args: {url: string, concurrency: number, times: number},
  asyncHandler: (url: string) => Promise<number>,
  ) {

  function executor(requests: boolean [], rts: number[] = []) {

    const tail: boolean  = requests.pop();

    if(tail === undefined) return Promise.resolve(rts)

    return asyncHandler(args.url)
      .then((rt) => executor(requests, [...rts, rt]));
  }

  const asyncPool: Promise<number[]>[] = [];
  const requests: boolean[] = [...Array(args.times)].fill(true);
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

getResult(
  {url: 'https://www.baidu.com/', concurrency: 10, times: 100},
  fetch,
).then(console.log);
