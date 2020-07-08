
import { ConsistentHashingWithVirtualNode, ConsistentHashingWithoutVirtualNode } from './consistencyHash'

function getTenHashNodes() {
  return [...Array(10).keys()]
         .map((v, i) => `192.168.0.${i+1}`)
}

const runMillion = (virtualSize: number) => {
  const ch: ConsistentHashingWithoutVirtualNode = new ConsistentHashingWithoutVirtualNode();
  ch.addNodes(getTenHashNodes());

  for(let i = 0; i < 1000_000; ++i){
    ch.hitNode(Math.random()+'');
  }

  ch.printHits();
  console.log(ch.getStandardDeviation());
}

runMillion(1)



