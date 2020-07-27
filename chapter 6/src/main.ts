import {fetch} from './fetch';
import {response_95, response_avg} from './utils';

type Request = () => Promise<number>;

function executor(requests: Request [], rts: number[] = []) {

  const req: Request  = requests.pop();

  if(req === undefined) return Promise.resolve(rts)

  return req().then((rt) => executor(requests, [...rts, rt]));
}


function runConcurrencyTest(
  args: {url: string, concurrency: number, times: number},
  asyncHandler: (url: string) => Promise<number>,
  ) {

  const asyncPool: Promise<number[]>[] = [];
  const requests: Request[] = [...Array(args.times)].fill(() => asyncHandler(args.url));
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

runConcurrencyTest(
  {url: 'https://www.baidu.com', concurrency: 10, times: 100},
  fetch,
).then(console.log);
