# 极客时间《架构师训练营》第十一周课后作业

## 第一题

> 导致系统不可用的原因有哪些？保障系统稳定高可用的方案有哪些？请分别列举并简述。

### 引起故障的主要原因

- 硬件故障
- 软件 bug
- 系统发布
- 并发压力
- 网络攻击
- 外部灾害

### 高可用架构

- 提高代码可用性

  - 高内聚、低耦合组件设计
  - 面向对象设计
  - DDD 建模

- 使用服务集群

  假设只有一台服务器执行所有应用，只要有人不小心踩到了电源插头，就可以导致整个服务宕机。通常系统设计时通常会将应用部署到不同的服务器上：若一台服务器宕机的概率为 10%，即可用性为 90% ；三台同样的服务器的可用性就可以提高到 `1 - 10% ^3 = 99.9%`，可用性明显上升。当然，服务集群意味着更高的硬件成本，现在比较流行虚拟化容器等技术降低成本。

- 无状态组件

  部署服务集群是保证高可用的最基本需求：确保任何一个节点都可以断连、关机、升级，但是剩余的服务依旧正常工作。应用集群一般设计为无状态服务，通过 Session、cache 或是数据库共享信息。

- Load Balancing

  负载均衡既是应对网络并发压力的解决方案，也可以在检测到某实例故障时，无缝切换流量，提高系统容错能力。

- 降级、熔断、限流

  - 降级也就是当我们的服务器压力剧增为了保证核心功能的可用性，而选择性的降低或是直接关闭一些次要功能
  - 熔断一般是指依赖的外部接口出现故障的情况断绝和外部接口的联系
  - 限流也就是系统规定了多少承受能力，只允许这么些请求能过来，拒绝超载请求

- 数据备份、恢复

  数据库奔溃比服务器宕机危害更大，因为用户的数据很可能会就此丢失，后果不堪设想。数据库冗余备份是系统设计时必须的考量。每个数据中心都应该具有完整的备份，并事先计划好数据丢失和恢复的策略。

- Failover

  失效转移指的是当主要组件异常时，其功能转移到备份组件。其要点在于有主有备，且主故障时备可启用并设置为主。通常的实现手段有：主从复制、主主复制，也可以结合数据分片等等技术。

- 异地多活

  服务集群、数据库扩展后，有些安全隐患依旧不可避免，比如地震、火灾这类自然灾害很可能导致整个机房遭遇重大破坏。为了避免这类事故，一般会在多地部署机房，实现异地容灾容错。当然地球爆炸时，异地多活也会失效，所以以防万一我们也可以将服务部署在卫星上 😅

- 故障恢复计划

  如上的架构设计仅仅是提高系统的可用性，但依旧不可能完全避免故障产生。因而还得建立一套系统的故障恢复流程：

  - 能及时地隔离故障设备，确保剩余系统功能正常
  - 建立故障历史记录，并追踪问题根源
  - 通过监控系统收集负载数据并分析趋势
  - 建立一系列恢复手册，并定期测试其实用性
  - 员工培训，以提高设计、部署、运维的能力
  - 还应制定安全策略，抑制安全漏洞……

## 第二题

> 请用你熟悉的语言写一个用户密码验证函数，`Boolean checkPW(String 用户ID, String 密码明文, String 密码密文)`， 返回密码是否正确 boolean 值，密码加密算法使用你认为认为合适的加密算法。

这题体面太简洁了，我都不知道怎么多写点字了 😅

通常来说如果两个用户密码相同，那么他们密码的单向散列之后的哈希值也是相同的。因而出现了一种叫“查表法”的算法破解哈希密码，主要的思想就是预计算密码字典中的每个密码，然后把哈希值和对应的密码储存到一个用于快速查询的数据结构中。但是查表法只有在所有密码都以相同方式进行哈希加密时才有效；我们可以通过“随机化”哈希来阻止这类攻击，于是当相同的密码被哈希两次之后，得到的值就不相同了。比如可以在密码中混入一段“随机”的字符串再进行哈希加密，这种字符串被称作盐值。

盐值是可以被暴露，但是要保证每个用户唯一，而且不要太短：

- 用相同的盐，意味着相同的密码又得到了相同的散列值，无法对抗“查表法”。有些算法包裹了好几层的散列算法事实上是没有意义的。
- 盐太短，又容易暴力破解，安全性又不够用了

我这里图简单就直接用了 userId 作盐了——userId 即唯一，通常又不至于很短。算法也非常简单直接`密码+盐`做 md5 散列：

```typescript
import * as md5 from 'md5'
import express = require('express');
import UserDao from './userDao';

function encrypt(userId: string, plaintext: string): string {
  return md5(plaintext+userId);
}

function checkPW(userId: string, plaintext: string, ciphertext: string): boolean {
  return encrypt(userId, plaintext) === ciphertext;
}

const app: express.Application = express();

app.post('/register', async (req: express.Request, res: express.Response) => {
  const {userId, password} = req.body;
  const ciphertext: string = encrypt(userId, password);
  const ret: boolean = await UserDao.save({userId, pwd: ciphertext});
  res.send(ret);
});

app.post('/login', async (req: express.Request, res: express.Response) => {
  const {userId, password} = req.body;
  const {pwd: ciphertext} = await UserDao.get(userId);
  const isValidUser: checkPW(userId, password, ciphertext);
  res.send(isValidUser);
});
```
