# 极客时间《架构师训练营》第十周课后作业

## 第一题

> 根据微服务框架 Dubbo 的架构图，画出 Dubbo 进行一次微服务调用的时序图

![Dubbo 架构][0]

0. 前提自然是需要 Provider 向注册中心注册，然后注册中心通知 Consumer 客户端更新服务列表
1. 发起访问时，Consumer 程序通过服务接口访问接口代理
2. 接口代理再调用 Dubbo 客户端框架
3. 客户端框架通过特定的负载均衡策略在服务列表里选择某 Provider 服务，然后通知远程通讯模块发起 RPC 调用
4. RPC 调用到达服务提供端
5. Dubbo 服务端框架调用 Provider 程序
6. 最后 Provider 的计算结果再依照上述链路一路返还到 Consumer 程序中

![RPC调用过程][1]

## 第二题

> 关于微服务架构（中台架构、领域驱动设计、组件设计原则），你有什么样的思考和认识？

这题有点大，随意讲讲学习心得吧，一一列举知识似乎更应该放在学习笔记里。

传统的开发模型，如经典的 Spring 分层模式——Controller/Service/Dao，就是所谓的贫血模型。我们绝大多数人在使用 Spring，只是使用 OO 语言开发，而不是 OO 开发；对象只是数据的载体，并没有行为。简单的业务系统采用这种贫血模型和过程化设计是没有问题的，但在业务逻辑复杂了，业务逻辑、状态会散落到在不同 Service 的不同方法中，原本的代码意图会渐渐不明确，我们将这种情况称为由贫血症引起的失忆症。相比之下，比较优异的抽象手段是采用领域模型的开发方式，将数据和行为封装在一起，并与现实世界中的业务对象相映射。各类具备明确的职责划分，将领域逻辑分散到领域对象中。

解决复杂和大规模软件的方法论可以被粗略地归为三类：抽象、分治和知识。

* 分治：把问题空间分割为规模更小且易于处理的若干子问题
* 抽象：使用抽象能够精简问题空间，而且问题越小越容易理解
* 知识：顾名思义，DDD、组件设计原则等等可以认为是知识的一种，让我们知道如何抽象出限界上下文以及如何去分治。

我们创建微服务时，事实上就是一个抽象+分治的手段；从复杂系统之中，抽象出一系列高内聚、低耦合的业务，以服务的形式分别运行。怎么提取？一般有两种方式：技术维度和业务维度。技术维度类似 MVC 的横向分层结构，业务维度则是按业务领域的纵向划分系统。微服务架构更强调从业务维度去分治复杂系统，以追求业务层面的复用；DDD 正巧也是以同样的视角去看待业务与技术的关系，在响应业务变化调整业务架构时，也随之变化系统架构。因此，DDD 与当今的微服务架构设计是有天然的契合点的。

但是，现实中我们往往被幸存者偏差所误导，以为微服务就是大路货了；其实不然，微服务很难落地。我自己所在的厂便实践过微服务，结果产品胎死腹中，连老板都被炒掉了。后来我读到康威定律，悟到了某些必然失败的原因：

> 康威定律：任何组织在设计一套系统时，所交付的设计方案在结构上都与该组织的沟通结构保持一致。

康威定律告诉我们，系统结构应尽量的与组织结构保持一致，限界上下文和团队结构应该保持一致。其实很好理解，梳理清楚上下文之间的关系，从团队内部的关系来看，好处显而易见：

* 任务更好拆分，一个开发人员可以全身心的投入到相关的一个单独的上下文中
* 沟通更加顺畅，一个上下文可以明确自己对其他上下文的依赖关系，从而使得团队内开发直接更好的对接

反过来，如果你的团队结构混乱、职责不清，那么你将会设计出一个混乱的系统。每个设计混乱、故障不断的系统背后都有一个混乱、没有战斗力的团队。重构这样的系统，首先要重构开发团队。

Anyway，厂里的事还是不要入戏太深了，就到此为止了。

[0]: ./img/Dubbo.png
[1]: ./img/dubbo-call.drawio.png
