# 极客时间《架构师训练营》第五章课后作业

> 用你熟悉的语言实现一致性 hash 算法

## 简介

一致性 Hash 被广泛的应用于负载均衡领域的 Hash 算法，我们常见的一些应用如 nginx 和 memcached 都采用了一致性 Hash 来作为集群负载均衡的方案。一致性 Hash 通过构建环状的 Hash 空间来解决集群数量变化导致的 hash 映射失效的情况。下图中 NODE012，就是服务器映射到 hash 环上的节点：

![无虚拟节点][1]

当消息被送到负载均衡器上后，计算出该消息 hash 值后，它也会被映射到 hash 环上，然后沿顺时针方向找到第一个节点，这个节点就是处理该消息的服务器。

新增服务器，如 NODE4，相当于在 Hash 环空白位置上加一个节点，之后落在该节点逆时针附近的一些消息会被分派到该服务器上处理。

当然，这个算法有点问题，Node 数量相对于 Hash 环来说太稀疏了，落点很难均匀分布，所以负载往往非常的不平衡。为了更加均匀的分派负载，人们想到了虚拟节点的方案，就是让一个服务器映射到多个 hash 节点上去：这样的话节点就没那么稀疏了，负载也就更均匀了。

![虚拟节点][5]

好了，简介到此为止，本次作业要求是写代码，所以我不再啰嗦，直接撸代码。

## 工具

首先我们要确认一个 hash 算法。Hash 算法可以很简单，直接给一个 random 值范围控制在 `[1, 2^32)` 上即可；但是我查了一下资料，一般会使用一些经典算法，比如 memcached 用了 md5 算法，我偷个懒找了一个叫[FNV_32_hash][0]的算法，它能将所有的字符串映射为一个*特定的*32 位 int 值，很符合我们的需求。我用 typescript 简单实现了一下，之后就可以随意调用了。

```typescript
const fnv32Hash = (node: string) => {
  const prime: number = 16777619;
  const offset : number = 2166136261;

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
```

接着，根据题目要求计算标准差，我顺便又写了一个计算标准差的简单方法：

![标准差][2]

```typescript
const stdDev = (data: number[]) => {
  const sum = (x,y) => x+y;
  const square = (x) => x*x;
  const mean = data.reduce(sum) / data.length;
  const deviations = data.map(x => x-mean);
  return Math.sqrt( deviations.map(square).reduce(sum) / (data.length-1) );
}
```

## Hash 环

我本来想用一个简单数组实现 Hash 环，但是搜索节点时实在是太慢了。所以改用了树装结构的数组，数据结构是[collections-js][3]里的`SortedSet`。它有一个方法叫`findLeastGreaterThanOrEqual`，正好是找到容器内大于等于目标值的最小值；若找不到则意味着目标值大于容器内的所有元素，那就让它返回容器最小值，这样就模拟了环状搜索。

```typescript
const SortedSet = require('collections/sorted-set');

class HashCircle {
  #set: any;
  constructor(hashNodes: number[]) {
    this.#set = new SortedSet(hashNodes)
  }

  hitHashNode(value: string): number {
    const hash: number = fnv32Hash(value);
    return this.#set.findLeastGreaterThanOrEqual(hash)?.value ?? this.#set.min();
  }
}
```

## ConsistentHash

接着写一致性 Hash 类里的方法。我的一致性函数类有三个方法：

* addNodes: 用于添加节点
* hitNode： 返回当前数值命中的节点
* getStandardDeviation：这个是纯粹计算标准差用的方法

```typescript
interface ConsistentHash {
  addNodes(ips: string[]): void;
  hitNode(key: string): string;
  getStandardDeviation(): number;
}
```

### 无虚拟节点

先从无虚拟节点的算法说起：

* addNodes

  添加 node 就是把每个新增的服务器 ip 转化成 hash 值，然后添加到 #circle 里。我这里写了个 #node 对象，用于存储 hash 到 ip 的映射

  ```typescript
  addNodes(ips: string[]) {
    ips.forEach((ip) => {
      const hash: number = fnv32Hash(ip);
      this.#circle.push(hash);
      this.#nodes[hash] = ip;
    })
  }
  ```

* hitNode

  该方法把 key 传入 #circle 并返回命中节点的 hash，再通过 #nodes 里的映射关系返回具体的 ip 值。顺便把命中数累计到 #hits 对象中去。

  ```typescript
  hitNode(key: string){
    const hitHash: number = this.#circle.hitHashNode(key);
    const ip: string = this.#nodes[hitHash];
    this.#hits[ip] = this.#hits[ip]+1 || 1;
    return ip;
  }
  ```

* getStandardDeviation

  这个是无脑操作，把各个节点的命中总数以数组形式出入 stdDev 方法中，算出标准差：

  ```typescript
  getStandardDeviation() {
    const values =Object.values(this.#hits);
    return stdDev(values);
  }
  ```

### 带虚拟节点的一致性 hash

虚拟节点的算法其实也没啥复杂的，在初始化时传入一个 N 确定给每个实际节点创建的虚拟节点数。

```typescript
class ConsistentHashingWithVirtualNode implements ConsistentHash {

  constructor(N: number){
      this.#virtualSize = N;
      this.#virtualNodes = {};
      // omit
    }

  addNodes(ips: string[]) {
    ips.forEach((ip) => {
      for(let i = 1; i <= this.#virtualSize; ++i) {
        const hash: number = fnv32Hash(`${ip}-${i}`)
        this.#virtualNodes[hash] = ip;
        this.#circle.push(hash);
      }
    })
  }
}
```

接着稍微修改一下`addNodes`，之前是一个 ip 对应一个 hash 值，现在就是一个 ip 映射 N 个 hash。我这里就粗暴处理一下，虚拟节点的 hash 值由`${ip}-${i}`计算得到。剩下两个方法和之前一样。贴一下完整的代码：

```typescript
class ConsistentHashWithVirtualNode implements ConsistentHash {
  #virtualNodes: object;
  #circle: HashCircle;
  #hits: object;
  #virtualSize: number;

  constructor(virtualSize: number){
    this.#virtualSize = virtualSize;
    this.#virtualNodes = {};
    this.#hits = {};
    this.#circle = new HashCircle();
  }

  addNodes(ips: string[]) {
    ips.forEach((ip) => {
      for(let i = 1; i <= this.#virtualSize; ++i) {
        const hash: number = fnv32Hash(`${ip}-${i}`)
        this.#virtualNodes[hash] = ip;
        this.#circle.push(hash);
      }
    })
  }

  hitNode(key: string){
    const hitHash: number = this.#circle.hitHashNode(key);
    const ip: string = this.#virtualNodes[hitHash];
    this.#hits[ip] = this.#hits[ip]+1 || 1;
    return ip;
  }

  getStandardDeviation() {
    const values = Object.values(this.#hits);
    return stdDev(values);
  }
}
```

## 方差

最后我算了一下在无虚拟节点的算法里 10 个节点的一百万数据方差大约在 7 万左右。我们再对比一下有虚拟节点的算法，刚开始也是在七八万这个区间内，但是随着虚拟节点的增加，方差迅速下降；到 150 个虚拟节点时，方差只有约 5000 了，之后就开始趋于稳定。

![标准差-虚拟节点数][4]

[0]: https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
[1]: ./img/withoutVirtual.png
[2]: ./img/formula.png
[3]: https://www.collectionsjs.com/
[4]: ./img/stddev.png
[5]: ./img/virtualNode.png
