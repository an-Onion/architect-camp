# 极客时间《架构师训练营》第十二周课后作业

## 第一题

> 在你所在的公司（行业，领域）内，正在用大数据处理哪些业务？可以用大数据实现哪些价值？

我是做招聘软件的，说实在我们厂根本就没有大数据 😅。但是在这个领域里，我还是听说过一些使用场景，这里就道听途说列举一二：

- 整合招聘渠道

  通过大数据算法将企业自有库、猎头简历库、人脉简历库等等进行整合，实现多渠道简历搜索、筛选、标识。

- 智能推荐

  企业 HR 主动搜索人才常常要花费较大的时间和精力。通过大数据算法和人工智能技术，可以实现算法主动推荐候选人，直接提高 HR 招聘效率及候选人面试成功概率。

- 管理流程智能化

  企业在发展的各个阶段都需要适配新的招聘模式，大数据算法根据全渠道信息，向企业主提供最佳人力资源管理流程，打通各地区、各部门、甚至是各个环节的信息通路。

- 为人才决策提供重要价值

  通过对人力资源管理中各个行为数据和考评结果的学习，形成一套新人的岗位素质模型，为 HR 挑选适合企业各个发展阶段的人才提供重要参考。还可以根据行业动态、市场状况分析职工离职意向，帮助 HR 快速制定下一年的招聘计划。

## 第二题

> 分析如下 HiveQL，生成的 MapReduce 执行程序，map 函数输入是什么，输出是什么？reduce 函数输入是什么，输出是什么？

```sql
INSERT OVERWRITE TABLE pv_users
SELECT pv.pageid, u.age
FROM page_view pv
JOIN user u
ON (pv.userid = u.userid)
```

Page_view 表和 user 表结构与数据示例如下：

![page_view & user][0]

### Map 函数

首先，我们看到该题中 page_view & user 两表的 JOIN 操作是通过 userid 关联的，所以 Map 操作必然是以 userid 为 key 值输出：

- page_view 表

  | pageid | userid |
  | :----: | :----: |
  |   1    |  111   |
  |   2    |  111   |
  |   1    |  222   |

  - page_view 表关联的 Map 函数：`map(key: Offset, value: LineOfPageView, ...)`

    - key 是 value 所在行的偏移量，一般可以不管
    - value 是 page_view 表中某一行的文本内容，这里可以通过分词器提取出`pageid`和`userid`等信息

  - map 函数输出格式：`{key: UserId, value: <TableId, PageId>}`

    - key 就是 userid 的值
    - value 是一个键值对，键是表编号（我这里用`pv`缩写示意一下），值就是 pageid

    输出如下所示：

    | key: UserId | value: <TableId, PageId> |
    | :---------: | :----------------------: |
    |     111     |         <pv, 1>          |
    |     111     |         <pv, 2>          |
    |     222     |         <pv, 1>          |

- user 表

  | userid | age |
  | :----: | :-: |
  |  111   | 25  |
  |  222   | 32  |

  - 该表关联的 Map 函数是`map(key: Offset, value: LineOfUser, ...)`，几乎和上表一样：

    - key 是偏移量
    - value 是表中某一行的文本内容，通过分词器可以提取出`userid`和`age`等信息

  - map 函数输出格式：`{key: UserId, value: <TableId, Age>}`

    - key 就是 userid
    - value 也是一个键值对，键也是表编号（用`u`缩写示意），值就是 age

    输出如下所示：

    | key: UserId | age: <TableId, Age> |
    | :---------: | :-----------------: |
    |     111     |       <u, 25>       |
    |     222     |       <u, 32>       |

### Shuffle

Shuffle 会将上述 Map 输出结构按 Key 值（userid）排序以及合并，会生成如下两张表的内容再交给不同的 Reduce 服务计算：

| key: UserId | value: <TableId, AgeOrPageId> |
| :---------: | :---------------------------: |
|     111     |            <u, 25>            |
|     111     |            <pv, 1>            |
|     111     |            <pv, 2>            |

和

| key: UserId | value: <TableId, AgeOrPageId> |
| :---------: | :---------------------------: |
|     222     |            <u, 32>            |
|     222     |            <pv, 1>            |

### Reduce 函数

- 输入就是上面 Shuffle 的输出：

  `reduce(Key: UserId, values: <TableId, AgeOrPageId>[], ...)`

  - key 就是 UserId
  - values 是一系列键值对（`<u, age>`或是`<pv, pageid>`）的数组

- 输出：

  ```typescript
  const ages: [] = values.filter((v) => v.key === "u").map((v) => v.value);
  const pageIds: [] = values.filter((v) => v.key === "pv").map((v) => v.value);

  return pageIds.flatMap((p) => ages.map((a) => ({ pageid: p, age: a })));
  ```

  先利用不同的表编号（`pv`或`u`），从 values 中过滤出 ages 和 pageIds 两个数组；然后对 ages 和 pageId 这两个数组做 combination 操作（两 for 循环啦），得到所有的`<pageid, age>`键值对的列表，这个列表就是 Reduce 的输出。最后输出结果如下：

  | pageid | age |
  | :----: | :-: |
  |   1    | 32  |
  |   1    | 25  |
  |   2    | 25  |

[0]: ./img/exercise2.png
