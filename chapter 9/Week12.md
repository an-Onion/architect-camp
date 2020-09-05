# 极客时间《架构师训练营》第十二周学习笔记

## HDFS

HDFS 事实上在前面的课程里已经学过了，当时也写了很多，这里就简单过一些。先看一下 HDFS 的整体架构，之后我们再拆解：

![HDFS架构][1]

### Block

Block 块是 HDFS 基本存储单元，Hadoop 1.X 版本是 64MB，2.X 版本是 128MB。每个 Block 都有一个 id，相同的副本保证 id 一致。由于 block 的存储机制，HDFS 比较适合大文件、快速备份。

### NameNode

NameNode 是 HDFS 的核心内容：用于管理 DataNode，记录元数据 Meta。在 1.x 中，最多设置 1 个；在 2.x 以上，最多可以设置 2 个。如果设置两个，不能设置 SecondaryNameNode。

- 元数据

  - 记录切块数量
  - 记录数据库存储位置
  - 记录数据库复本数量
  - 记录文件权限

- 管理 DataNode 流程

  - 心跳机制：DataNode 每隔一段时间，会发生给 NameNode 一条信息，包含当年节点状态， 以及 block 信息
  - 若 NameNode 长时间没有收到 DataNode 的信息，那么就认为 DataNode 信息丢失。默认 10 分钟。
  - 若 DataNode 信息丢失，NameNode 会将 DataNode 的数据再次备份到其他 DataNode，以保证复本数量
  - 安全模式：在启动或者 DataNode 块损坏太多，HDFS 会进入安全模式，安全模式无法进行任何操作

- 复本策略

  客户端不是当前 DataNode，上传数据时，NameNode 选择相对空闲的节点，存放第一个复本；客户端是当前 DataNode，上传数据时，第一个复本为当前节点。第二个复本放在和第一个复本不同机架的节点上。第三个复本放在和第二个复本相同机架的节点上。
  超过三个复本，随机放。

- 机架感知策略

  重要的安全策略，防止同属一个物理机架的服务器宕机，HDFS 会主动分机架存储。这里机架并不是物理结构，而是逻辑结构。通俗一点说，就是一个简单的 ip=>name 的映射。实际使用中，一般会将一个物理机架上的所有节点，放到一个逻辑机架上。

- Secondary NameNode

  Secondary NameNode 与 NameNode 并不是严格意义上的主从关系。仅用来辅助 NameNode 进行元数据合并，不能做到和 NameNode 实时热备。对集群影响不大，能起到一定的备份作用。在 Hadoop2.0 以上，为了 NameNode 的热备，舍弃了 Secondary NameNode。

### DataNode

DataNode 用于存储数据，主要以 block 的形式存储。DataNode 会通过心跳机制发送给 NameNode 信息。

- 读流程

  1. 客户端发送请求到 NameNode 中，NameNode 收到请求后，校验文件存在与否，并将文件的 block 对应的地址(一个 block 对应多个地址)以队列的形式，返回给客户端。

  2. 客户端将各个地址依次取出。从离该客户端较近的地址中取数据。读完一个 block，会依次读取下一个。直到所有 block 都读完。若文件足够大(几 TB)，NameNode 会分几次返回 block。

- 写流程

  客户端发起 RPC 请求到 NameNode，该请求包含对文件信息的描述
  NameNode 收到请求后，检查户是否权限和是否有同名文件。通过文件信息，计算数据块，分配块存储地址。将地址放入队列返回给客户端
  客户端收到地址后，将数据进行封包，写入对应 DataNode 节点上。当写完所有的 block 都放置成功后，客户端通知 NameNode 关流，同时将该文件更改为不可再写。

- 删流程

  客户端发起请求到 NameNode，NameNode 收到请求后，校验文件存在与否和客户端是否有删除权限。将操作记录到 edits_inprogess 中
  删除内存中记录，并返回 ACK 信号，表示删除成功。等待 DataNode 的心跳，如果该 DataNode 存在要删除的数据，则对该节点发送指令进行删除。

## MapReduce

MapReduce 是一种计算模型，该模型可以将大型数据处理任务分解成很多单个的、可以在服务器集群中并行执行的任务，而这些任务的计算结果可以合并在一起来计算最终的结果。

![MapReduce架构][2]

我们来看看 MapReduce 是怎么做的：

1. 用户程序首先将文本切割为 16M~64M 大小的数据分片（可由用户设置），然后它会在计算机集群上启动该程序的许多副本。

2. 用户启动的所有副本中有一个副本叫 master，剩余的副本叫 worker。 master 负责将 worker 分配给 Map 或是 Reduce 任务。

3. Map worker 会读取相关的数据分片（第 1 步提到了），以 key-value 对的形式作为 Map 函数的入参传入并计算。

4. Map 函数运行结束后，又以新的 key-value 对形式存储到本地磁盘中。

5. 接着，Reduce worker 得到 master 的通知，并远程读取步骤 4 中存入的数据。Reduce worker 会对这些数据再按 key 分组，相同 key 值的数据被分配给相同的 Reduce worker 节点，这个步骤叫做 shuffle。

6. 再之后，Reduce worker 开始调用 Reduce 函数，并迭代处理相同 key 值的数据。Reduce 函数的输出最终写入到特定的文件里。

7. 当所有 Map 和 Reduce 任务执行完成后，master 唤醒用户程序，并返回结果。

## Yarn

Yarn 就是个多了资源管理框架的 Hadoop 架构——Yet Another Resource Negotiator。

![Yarn 架构][3]

- Container

  容器（Container）这个东西是 Yarn 对资源做的一层抽象。就像我们平时开发过程中，经常需要对底层一些东西进行封装，只提供给上层一个调用接口一样，Yarn 对资源的管理也是用到了这种思想。容器由 NodeManager 启动和管理，并被它所监控。同时，容器又被 ResourceManager 进行调度。

- ResourceManager

  图中最中央的那个 ResourceManager（RM）。从名字上我们就能知道这个组件是负责资源管理的，整个系统有且只有一个 RM ，来负责资源的调度。它也包含了两个主要的组件：定时调用器(Scheduler)以及应用管理器(ApplicationManager)。

- ApplicationMaster

  每当 Client 提交一个 Application 时候，就会新建一个 ApplicationMaster 。由这个 ApplicationMaster 去与 ResourceManager 申请容器资源，获得资源后会将要运行的程序发送到容器上启动，然后进行分布式计算。

- NodeManager

  NodeManager 是 ResourceManager 在每台机器的上代理，负责容器的管理，并监控他们的资源使用情况（cpu，内存，磁盘及网络等），以及向 ResourceManager/Scheduler 提供这些资源使用报告。

提交一个 Application 到 Yarn 的流程大致如下：

1. Client 向 Yarn 提交 Application，这里我们假设是一个 MapReduce 作业。

2. ResourceManager 向 NodeManager 通信，为该 Application 分配第一个容器。并在这个容器中运行这个应用程序对应的 ApplicationMaster。

3. ApplicationMaster 启动以后，对 作业（也就是 Application） 进行拆分，拆分 task 出来，这些 task 可以运行在一个或多个容器中。然后向 ResourceManager 申请要运行程序的容器，并定时向 ResourceManager 发送心跳。

4. 申请到容器后，ApplicationMaster 会去和容器对应的 NodeManager 通信，而后将作业分发到对应的 NodeManager 中的容器去运行，这里会将拆分后的 MapReduce 进行分发，对应容器中运行的可能是 Map 任务，也可能是 Reduce 任务。

5. 容器中运行的任务会向 ApplicationMaster 发送心跳，汇报自身情况。当程序运行完成后， ApplicationMaster 再向 ResourceManager 注销并释放容器资源。

## Hive

Hive 是基于 Hadoop 的一个数据仓库工具，用于计算基于 Hadoop 实现的一个特别的计算模型 MapReduce。它可以将计算任务分割成多个处理单元，然后分散到一群家用或服务器级别的硬件机器上，降低成本并提高水平扩展性。Hive 的数据存储在 Hadoop 一个分布式文件系统上，即 HDFS。

![Hive架构][4]

### Hive v.s. RDBMS

Hive 作为数仓应用工具，对比 RDBMS 有许多“不能”：

- 不能实时响应，Hive 查询延时大；
- 没有事务机制；
- 不能有行级别的变更操作（包括插入、更新、删除）。
- 没有定长的 varchar 这种类型，字符串都是 string；
- 读时模式，它在保存表数据时不会对数据进行校验，而是在读数据时校验不符合格式的数据设置为 NULL。

### Hive 工作原理

如上图所示，Hive 的工作原理就是一个查询引擎，和普通的 SQL 执行原理大致相同，分为如下几步：

1. 词法分析： 使用 antlr 将 SQL 语句解析成抽象语法树（AST）

2. 语义分析： 从 Megastore 获取模式信息，验证 SQL 语句中队表名，列名，以及数据类型的检查和隐式转换，以及 Hive 提供的函数和用户自定义的函数（UDF/UAF）

3. 逻辑计划生成，生成逻辑计划——算子树

4. 计划优化：对算子树进行优化，包括列剪枝，分区剪枝，谓词下推等

5. 物理计划生成：将逻辑计划生成包含由 MapReduce 任务组成的 DAG 的物理计划

6. 计划执行：将 DAG 发送到 Hadoop 集群进行执行

7. 最后返回查询结果

[1]: ./img/hdfs-arc.jpg
[2]: ./img/map-reduce-arc.jpg
[3]: ./img/yarn-arc.jpg
[4]: ./img/hive-arc.png
