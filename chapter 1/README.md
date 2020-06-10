# 第一章学习笔记

## 什么是软件架构

> 软件架构是有关软件整体结构与组件的抽象描述，用于指导大型软件系统各个方面的设计  ——维基百科

![Architecture][0]

软件架构包括上图的系统、架构、文档、相关方等等元素。任何系统，无论大小皆拥有软件架构，并且需要做专门的软件设计。软件设计真正目的其实是降低成本，因为设计成本一般会低于实现。当然，软件设计的核心并不在于系统或是架构本身，而在于利益相关方（stakeholder）。在软件设计的不同时段，设计文档应该根据评审的参与者（相关方）的不同，应用不同的设计图纸。

架构师就是这个软件设计的负责人，职责便是通过架构设计理清业务逻辑：对上交给组织一份宏观的系统概况；对下帮助开发人员降低噪音，提高软件开发效率和质量。

## 架构视图

软件架构包括：元素、形式、关系/约束。由于单一的视图很难完整地表述架构，所以需要多种形式的图纸来表述各个方面的设计意图，因此需要一份完备的视图集，业界常采用的方法就是**4+1 视图**。

![4+1视图][1]

4+1 视图分别是：

* 逻辑视图：设计的对象模型
* 过程视图：扑捉设计的并发和同步特征
* 物理视图：描述软件到硬件的映射，反映了部署特征
* 开发视图：描述开发环境中，软件的静态组织结构
* 场景视图：描述用例的场景

## UML 模型

建模是对一个系统的完整抽象；在计算机开发中，实现从领域问题到计算机系统的映射，以便从抽象出更易得的解决方案。UML 就是在面向对象开发中最常用的建模手段。UML 图有大约 10 种，其中常用的有 7 种，这些例图可以映射上文提到的 4+1 视图。

* UML 中的通用元素有：类、对象、节点、包、组件等等：

  ![UML元素][2]

* 元素之间的关系又有：关联、依赖、泛化、聚合等等：

  ![UML关系][3]

* UML 中的消息：简单消息、同步消息、异步消息

### 用例图

Use Case 是系统分析阶段最常用的模式。在宏观上给出系统的总体轮廓，一般是 PM 来写。每个 Use Case 的元素不宜过多，总数控制在十个左右；可以自顶而下逐步细化。

![Use Case][4]

### 时序图

时序图用以描述对象之间的动态交互行为，是穿插于开发各个阶段重要的视图。时序图有两个轴：横轴表示对象；纵轴表示时间。

![时序图][5]

时序图有两种形式，一般格式和实例格式：

* 一般格式：描述所有情节，包括分支、条件和循环，比较复杂
* 实例格式：描述一次可能的交互，没有分支判断，仅仅显示特定情节的交互

### 泳道图

泳道图是活动图里最常使用的视图。它用以描述完成活动的对象以及活动；泳道图的最大特色就是显示分组机制，可以描述跨系统的交互互动：

![泳道图][6]

### 状态图

状态图用来描述特定对象的所有可能态，是 PM 在需求设计阶段重要的工具，开发阶段会进一步把状态图的内容转化为特定的方法和条件判断：

![状态图][7]

### 组件图 & 部署图

组件图和部署图提供了物理层面的建模，描述子系统间的关系，是架构师最早该写的一份视图：

![组件图][8]

![部署图][9]

### 视图与整体设计

开发的不同阶段，我们可以依据不同的现实，书写不同的视图，下面是各个阶段常用到的视图：

* 需求分析阶段： 用例图、活动图、状态图、时序图

* 概要设计阶段（子系统级别）：部署图（架构师第一张图）、序图、活动图、组件图、时序图

* 详细设计阶段（方法和类级别）：类图、时序图、状态图、活动图

当然，视图的意义不在于多，而在于正确的抽象业务；以最少的视图抽象出最完整的现实，才是一个架构师的能力所在。

## 小结

第一周的课程除了开场白之外，主要还是集中在怎么写架构设计文档上，其中 UML 建模是课程的重中之重吧。架构设计文档是团队中交流、协同工作的重要依据；熟练掌握这些技能，可以极大的改善开发体验；当然也是架构师的一项必备技能。

这次课程中，老师提到了一个很有趣的现象：很多中小企业在开发阶段是完全没有架构设计文档的。一不小心被说中了，我厂就是这种现状——开发全靠“口口相传”；上了一次课，感触还是挺深刻的。之后的工作中，我也想慢慢尝试加入 UML 设计；人微言轻，自然很难改变一个团队的氛围，但至少自己的代码要为自己负责。

[0]: ./img/architecture.png
[1]: ./img/4+1.png
[2]: ./img/event.png
[3]: ./img/relation.png
[4]: ./img/use-case.png
[5]: ./img/Sequence.png
[6]: ./img/Swimlane.png
[7]: ./img/state.png
[8]: ./img/component.png
[9]: ./img/deployment.png