import {SortedSet} from 'collections/sorted-set';

export const fnv32Hash = (node: string): number => {
  const prime = 16777619;
  const offset  = 2166136261;

  let hash: number = node.split('')
                         .map((v) => v.charCodeAt(0))
                         .reduce((acc, v) => (acc^v)*prime, offset);

  hash += hash << 13;
  hash ^= hash >> 7;
  hash += hash << 3;
  hash ^= hash >> 17;
  hash += hash << 5;

  return Math.abs(hash);
}

export const stdDev = (data: number[]): number => {
  const sum = (x,y) => x+y;
  const square = (x) => x*x;
  const mean = data.reduce(sum) / data.length;
  const deviations = data.map(x => x-mean);
  return Math.sqrt( deviations.map(square).reduce(sum) / (data.length-1) );
}

export class HashCircle {
  #set: SortedSet;
  constructor() {
    this.#set = new SortedSet()
  }

  hitHashNode(value: string): number {
    const hash: number = fnv32Hash(value);
    return this.#set.findLeastGreaterThanOrEqual(hash)?.value ?? this.#set.min();
  }

  push(hashNodes: number): void {
    this.#set.push(hashNodes);
  }
}


