# 极客时间《架构师训练营》第八周课后作业

## 第一题

> 有两个单向链表（链表长度分别为 m，n），这两个单向链表有可能在某个元素合并，如下图所示的这样，也可能不合并。现在给定两个链表的头指针，在不修改链表的情况下，如何快速地判断这两个链表是否合并？如果合并，找到合并的元素，也就是图中的 x 元素。请用（伪）代码描述算法，并给出时间复杂度和空间复杂度。

![Double Link][1]


1. 先计算两个链表的长度`len1`、`len2`，找到那个较长的链表（`longList`）
2. 让 `longList` 的头指针向后移动 `abs(len1-len2)` 个节点；这样长、短链表就一样长了
3. 然后挨个比较两个链表的头结点，如果一样则返回该节点；不一样则头结点分别往后移动一位
4. 循环步骤 3，直到链表遍历结束

若返回为 `null`, 则表示两链表未合并；反之，则为合并节点。

```typescript
class LinkedNode {
  value: string;
  next: LinkedNode

  constructor(value: string, next: LinkedNode = null) {
    this.value = value;
    this.next = next;
  }
}

function lengthOf(list: LinkedNode): number {
  let len = 0;
  let pointer: LinkedNode = list;

  while( pointer ){
    len++;
    pointer = pointer.next;
  }

  return len;
}

function findTheMergedNode(list1: LinkedNode, list2: LinkedNode): LinkedNode {
  const len1: number = lengthOf(list1);
  const len2: number = lengthOf(list2);

  let longList: LinkedNode, shortList: LinkedNode;

  if( len1 > len2 ) {
    longList = list1;
    shortList = list2;
  } else {
    longList = list2;
    shortList = list1;
  }

  let delta: number = Math.abs(len1 - len2);

  while( delta-- ) {
    longList = longList.next;
  }

  // Then the length of longList and shortList is the same

  while( longList ) {
    if( longList === shortList )
      return longList;

    longList = longList.next;
    shortList = shortList.next;
  }

  return null;
}
```

## 第二题

> 请画出 DataNode 服务器节点宕机的时候，HDFS 的处理过程时序图。

![HDFS][2]

所以 namenode 如果在 10 分钟+30 秒后，仍然没有收到 datanode 的心跳，就认为 datanode 已经宕机，并标记为 dead

[1]: ./img/double-link.png
[2]: ./img/hdfs.drawio.png
