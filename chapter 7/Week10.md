# 极客时间《架构师训练营》第十周学习笔记

## 领域对象

30 年以前，一些软件设计人员就已经意识到领域建模和设计的重要性，并形成一种思潮，称为领域驱动设计（Domain-Driven Design，简称 DDD）。DDD 设计思想古老而缓慢，我们并不需要过度地嵌入到领域范式的细枝末节之中；万千理论的背后，只需要抓住一点——高内聚、低耦合——便可以帮助我们朝着一种良性演进方向前进。Anyway，先看一个简单的业务，以及它的常规实现：

> 修改订单中产品的数量，订单总价随之更新

1. 基于 Service+贫血模型的实现

    这种方式被绝大多数项目采用，业务逻辑依靠一个 Service 类实现，然后通过 setter 方法更新领域对象，最后通过 DAO 保存到数据库中。

    ```java
    // OrderService.java
    public void changeProductCount(String id, ChangeProductCountCommand command) {
      Order order = DAO.findById(id);
      OrderItem orderItem = this.getOrderItem(command.getProductId(), command.getCount());
      order.setItem(orderItem);
      int totalPrice = this.calculateTotalPrice(order);
      order.setTotalPrice(totalPrice);
      DAO.saveOrUpdate(order);
    }
    ```

    这种方式就是典型的面向过程编程（外加职责模糊不清）。Order 的业务细节泄露到了 OrderService 中，而 Order 沦为一个充当数据容器的贫血模型。也许在业务极简的场景中，这种模式能解决大部分问题；但是随着项目演进，Order 业务逻辑会逐渐分散到了各种不同的 Service 类中，而各种 Service 类又不得不添加处理各种不同领域业务的方法。最终的结果是代码变得难以理解而丧失扩展能力：最典型的特征就是各种`if-else`语句。

    > 贫血领域对象（Anemic Domain Object）是指仅用作数据载体，而没有行为和动作的领域对象。

2. 基于事务脚本的实现

    上述方法中，我们把 DAO 视作 ORM 工具的封装，所以一般只有`find`和`save`两种方法；此时的 Order 对象仅仅是为了方便 ORM 工具一次性地持久化。但是在不使用 ORM 框架的设计中，我们其实并不需要 Order 对象：

    ```java
    // OrderService.java
    @Transactional
    public void changeProductCount(String id, ChangeProductCountCommand command) {
        DAO.updateProductCount(id, command.getProductId(), command.getCount());
        DAO.updateTotalPrice(id);
    }
    ```

    将业务下沉到 DAO 中，通过添加`@Transactional`这类注释确保操作事务的隔离性;`updateTotalPrice(id)`方法中可以实现直接的 SQL 调用，并完成 Order 总价的更新。但是此时的 DAO 便不再是持久层的封装，换句话说失去了单一职责；此外和第一种方式一样，随着复杂度上升，部分逻辑只是从不同的 Service 分散到一系列不同 DAO 中罢了，业务的内聚度依旧没有提升。

3. 基于领域对象的实现

    在这种方式中，行为和对象高度统一，所有对象的业务逻辑被封装在了 Order 对象中。看看同样的`changeProductCount`方法实现，我们把它放在了 Order 类内：

    ```java
    // Order.java
    public void changeProductCount(ProductId productId, int count) {
      OrderItem orderItem = this.retrieveItem(productId);
      orderItem.updateCount(count);
    }
    ```

    然后在 Controller 中直接调用 Order 对象方法：

    ```java
    // OrderController.javascript
    @PostMapping("/order/{id}/products")
    public void changeProductCount(@PathVariable(name = "id") String id, @RequestBody ChangeProductCountCommand command) {
        Order order = DAO.byId(id);
        order.changeProductCount(command.getProductId(), command.getCount());
        order.updateTotalPrice();
        DAO.saveOrUpdate(order);
    }
    ```

    可以看到，DAO 依旧只是 DB 的适配器（ORM 与否皆可）；而所有订单业务——Order 信息、修改 Product 数量和更新 Order 总价——都被包含在了 Order 对象中，将职责尽可能多地聚合在一起。当然，这和经典的 DDD 战术模式一比，依旧相形见绌；但是高内聚的思想已经把握在手。

## 微服务与限界上下文

我们创建微服务时，需要创建一个高内聚、低耦合的微服务。而 DDD 中的限界上下文则完美匹配微服务要求，我们甚至可以将该限界上下文理解为一个微服务进程。

> 限界上下文：一个由显示边界限定的特定职责。领域模型便存在于这个边界之内。在边界内，每一个模型概念，包括它的属性和操作，都具有特殊的含义。

微服务落地注重：

* 业务先行，理顺业务边界和依赖，技术知识手段而不是目的
* 先有独立的模块，后有分布式的服务
* 明确的目的，实现业务复用、清晰的边界和分布式的性能，最后再决定技术以及框架
* 技术架构上则关注系统模块之间是否充分解耦，可以自由地选择合适的技术架构，去中心化地治理技术和数据。

领域设计的步骤一般如下：

1. 根据需求划分出初步的领域和限界上下文，以及上下文之间的关系；
2. 进一步分析每个上下文内部，识别出哪些是实体，哪些是值对象；
3. 对实体、值对象进行关联和聚合，划分出聚合的范畴和聚合根；
4. 为聚合根设计仓储，并思考实体或值对象的创建方式；
5. 在工程中实践领域模型，并在实践中检验模型的合理性，倒推模型中不足的地方并重构。

DDD 与微服务的核心诉求高度一致，这也是为什么 DDD 在沉寂 30 年之后，在微服务领域再放光彩的缘由。

## 康威定律与上下文映射

不同的界限上下文中，也就是不同的子系统或者模块之间会有各种各样的交互合作；DDD 使用上下文映射来设计这种交互。但是我个人的亲身感觉是，上下文中最重要的交互合作是人：

> 任何组织在设计一套系统（广义概念上的系统）时，所交付的设计方案在结构上都与该组织的沟通结构保持一致。

在进行上下文划分之后，我们还需要进一步梳理上下文之间的关系，最重要的是要梳理人的关系。康威定律告诉我们系统结构应尽量的与组织结构保持一致。也就是说团队结构应该和限界上下文保持一致，好处显而易见：

1. 每个团队在它的上下文中能够更加明确自己领域内的概念，因为上下文是领域的解释系统；
2. 对于限界上下文之间发生交互，团队与上下文的一致性，能够保证我们明确对接的团队和依赖的上下游。
3. 每个团队内部也可以更快地构建由团队，开发人员，领域专家和其他参与者共享的语言，从而使得团队内开发直接更好的对接。

理清人与人的关系后，再去分配任务便可顺理成章：每个开发人员都可全身心地投入到相关的单独的上下文中；上下文映射图反过来也可以知道上下游的依赖关系，从而实现更好的对接。

## 其他概念

* 合作关系（Partnership）：两个上下文紧密合作的关系，一荣俱荣，一损俱损。
* 防腐层（Anticorruption Layer）：一个上下文通过一些适配和转换与另一个上下文交互。
* 大泥球（Big Ball of Mud）：混杂在一起的上下文关系，边界不清晰。
* 实体（Entity）：当一个对象由其标识（而不是属性）区分时，这种对象称为实体
* 值对象（Value Object）：用于对事务进行描述而没有唯一标识对象
* 聚合根（Aggregate Root）：聚合是一组相关对象的集合，作为一个整体被外界访问，聚合根是这个聚合的根节点。
* 领域服务（Domain Service）：一些重要的领域行为或操作，可以归类为领域服务。它既不是实体，也不是值对象的范畴。
* 领域事件（Domain Event）：领域事件是对领域内发生的活动进行的建模。

## 小结

本周主要讲了微服务架构、微服务实践和领域驱动设计相关的技术点。知识量有点大，夜深人静，已写不过来了，只能胡乱梳理了一些 DDD 的相关知识。学习 DDD 对我来说最重大的收获还是增长了见识；不过，如果有机会带队，我保证不会去尝试 DDD 的。平日里也见识过所谓落地 DDD 的团队，除了一个小组长偶尔用 DDD 术语讲讲大道理，似乎也没人听得进去什么。还是不要落入教条之中为好。理清业务，从书写设计文档做起，落实 Code review，这种最基础的工作也许才是绝大多数团队首要执行的任务。
