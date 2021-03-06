
import {fnv32Hash, stdDev, HashCircle} from './utils';

interface ConsistentHash {
  addNodes(ips: string[]): void;
  hitNode(key: string): string;
  getStandardDeviation(): number;
}

export class ConsistentHashingWithVirtualNode implements ConsistentHash {
  #virtualNodes: Record<number, string>;
  #circle: HashCircle;
  #hits: Record<string, number>;
  #virtualSize: number;

  constructor(virtualSize: number){
    this.#virtualSize = virtualSize;
    this.#virtualNodes = {};
    this.#hits = {};
    this.#circle = new HashCircle();
  }

  addNodes(ips: string[]): void {
    ips.forEach((ip) => {
      for(let i = 1; i <= this.#virtualSize; ++i) {
        const hash: number = fnv32Hash(`${ip}-${i}`)
        this.#virtualNodes[hash] = ip;
        this.#circle.push(hash);
      }
    })
  }

  hitNode(key: string): string {
    const hitHash: number = this.#circle.hitHashNode(key);
    const ip: string = this.#virtualNodes[hitHash];
    this.#hits[ip] = this.#hits[ip]+1 || 1;
    return ip;
  }

  printHits(): void {
    console.log(this.#hits);
  }

  getStandardDeviation(): number {
    const values = Object.values(this.#hits);
    return stdDev(values);
  }
}


export class ConsistentHashingWithoutVirtualNode  implements ConsistentHash {
  #nodes: Record<number, string>;
  #circle: HashCircle;
  #hits: Record<string, number>;

  constructor(){
    this.#hits = {};
    this.#nodes = {};
    this.#circle = new HashCircle();
  }

  addNodes(ips: string[]): void {
    ips.forEach((ip) => {
      const hash: number = fnv32Hash(`${ip}-1`);
      this.#nodes[hash] = ip;
      this.#circle.push(hash);
    })
  }

  hitNode(key: string): string {
    const hitHash: number = this.#circle.hitHashNode(key);
    const ip: string = this.#nodes[hitHash];
    this.#hits[ip] = this.#hits[ip]+1 || 1;
    return ip;
  }

  printHits(): void  {
    console.log(this.#hits);
  }

  getStandardDeviation(): number {
    const values =Object.values(this.#hits);
    return stdDev(values);
  }
}
