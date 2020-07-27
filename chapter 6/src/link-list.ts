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

const LinkX: LinkedNode = new LinkedNode('x',
                          new LinkedNode('y',
                             new LinkedNode('z')));

const list1: LinkedNode = new LinkedNode('a',
                          new LinkedNode('b', LinkX));

const list2: LinkedNode = new LinkedNode('d',
                          new LinkedNode('e',
                            new LinkedNode('f', LinkX)));

const node: LinkedNode = findTheMergedNode(list1, list2);

if( node ) {
  console.log(`The merged node is: ${node.value}`);
} else {
  console.log('Those 2wo link-lists are not merged');
}


