# 第五周

这周的内容有点多，涉及到了 Cache、消息队列、负载均衡等话题，如果都复述一遍，我这周就不用交作业了，所以仅限于谈谈我自己用到过的一些相关技术。先老实交代一下，我用过的绝大多数服务都是 AWS 的云服务

## 缓存

缓存无处不在。

### DNS： Route 53

除了厂里自建的底层 DNS 服务外，我事实上只用过 Amazon 的 Route 53。Route 53 最大的优势还是在于和它全家桶应用的相互集成，我自己配过的就有 EC2、S3 和 CloudFront。Amazon Route 53 还可以配置 DNS 运行状况检查，以将流量路由到正常的终端节点，或者独立监控应用程序及其终端节点的运行状况。Route 53 是按查询次数收费的，阶梯收费，我自己项目组一个月的花费也就五六毛美刀的样子，推荐所有小厂使用。

### CDN & 反向代理：Cloud Front

Cloud Front 起初设计时只是一个遍布全球边缘站点的 CDN 服务，但是后来越做越大，实现了动静分离的功能，把反向代理的部分功能也集成进来了。我自己参与开发的系统大体如下，将 S3 和 EC2 交由 cloudfront 代理，为 S3 设置较长时间的 TTL，为 EC2 设置较短的 TTL。

![Could Front][1]

我是前端开发，CDN 缓存上碰到过一些坑。比如新的静态资源发布后，需要一定的时间去覆盖各个边缘站点的旧资源。若某客户端获得了新的动态网页，但是附近的 CDN 节点尚未更新最近发布的静态资源，客户端即便放弃本地缓存，它加载的依旧是位于 CDN 上的“脏数据”。后来的策略是给静态资源的文件名添加摘要信息，一般的操作就是 webpack 打包时，将输出的文件命名为 `[name].[contenthash].[extension]`。

### 浏览器缓存

浏览器缓存策略，我们前端就比较熟悉了，存储在客户端硬盘里的有 Cookie、localStorage、SessionStorage 和 Web SQL、IndexedDB。前三者 size 较小，K 或是 M 级别的；后两者较大，基本硬盘容量级别的。平常开发比较暴力，这些存储设备上装满了各种信息。

此外，web 应用一般还有浏览器内存级别的缓存，前端框架（如 react、vue）就有自己的 bus 缓存，框架基础上的一些插件（如 redux、vuex，apollo client）还会存储针对后端 api 的缓存。

### 后台缓存

后台应用的内存级缓存一般是工具完成的，比如 Java 里的 Guava 和 Nodejs 里的 dataloader。

### 应用缓存

应用级缓存我只用过 redis，而且都是掉封装好的 API——put 和 get。但是记忆中厂里的 Redis 又贵又难用，原因是：我厂的系统是多租户系统，出于数据铭感的考量，架构师为每个租户都部署了一套 Redis 服务；租户一多集群变得非常庞大而脆弱，然后每天都在宕机，一宕机各种依赖的应用全挂了，这种不稳定时常导致全公司都不能开发了。但是系统完成后，我们发现每个租户的读写量并不大，无缘无故就被安上 Redis 集群，反倒成了鸡肋。这架构师真可怕。

## 消息队列

消息队列事实上我不是很熟悉，厂里用的是 Kafka 搜集日志，不过印象中 Kafka 集群也时常宕机。后来我们转云平台了，用的是 Cloudwatch 自动搜集，所以我只对 Kafka 有一点点负面印象而已。

后来自学过 RabbitMQ，在 NodeJS 平台里实现过一个 demo，这里为了凑字数😅简单介绍一下该 Demo：如下图所示：

1. 客户端和服务端分别订阅两个不同的消息队列：
2. 客户端向队列 A 发送消息
3. 服务端消费 A 的内容后，将处理后的消息发给另一个队列 B
4. 客户端再通过监听 B 队列获得返还的消息

![RabbitMQ & RPC][2]

该方案用了两个队列将客户端和服务端解耦，并且客户端可以最终得到服务端的处理结果。

## 负载均衡

### AWS API Gateway

我没用过专门的 Load balance 服务，但是用过 AWS 的 API Gateway + Lambda function 架构，它事实上是有 LB 的功能了：AWS API Gateway 能处理每秒一万次的请求，而与之连接的 lambda 会自动扩容以满足 API Gateway 的请求。除此之外 API Gateway 还能处理 auth、token、IAM 服务等等。而且它的价格也很友好，小厂使用几乎免费。

### Session

老师在这一节提到了 Session 管理，所以我也提一下我所在项目里使用过的工具。我用的是 ExpressJS + [express-session][3] + [connect-dynamodb][4] 的组合。Session 存储在 Dynamodb 上，我本来以为会比较慢，后来发现是 ms 级别的，而且 Dynamodb 也是按需收费，小厂使用一个月也没几刀，再次推荐。

使用方式如下，给 express 服务配一个 middleware，然后直接操作`req.session`里的对象，它会通过订阅发布模式异步读取或更改 DB 里的数据。

```javascript
const app = express();
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')(session);

app.use(session({
  store: new DynamoDBStore(options),
  secret: 'keyboard cat',
}));

app.get('/private', (req, res) => {
  const numberOfViews = ++req.session.views
  res.send(`The /private page has been visited ${ numberOfViews } times.`)
});
```

## 小结

本次总结主要概述了一下我使用过的一些应用或是工具。作为前端开发，说实在写这些后端应用挺难的，绝大多数技术并没有太多印象。再如 Kafka 和 Redis 我一直持有负面情绪，当然并不是这些应用不行，而是很多架构师并没有驾驭它们的能力，就茫茫然开始使用了。我以前学系统设计知识时，看文章评价各种设计的优缺点，每个应用都会写上这么一个缺点：增加了系统复杂度。当时不以为意，后来在现实开发中，真的被各种无脑添加应用的设计恶心到了。所以在做架构设计时，还是要遵循“奥卡姆剃刀”——如无必要，勿增实体。

[1]: ./img/cloudfront.jpg
[2]: ./img/RabbitMQ.png
[3]: https://github.com/expressjs/session
[4]: https://github.com/ca98am79/connect-dynamodb
