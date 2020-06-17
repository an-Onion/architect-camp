# 极客时间《架构师训练营》第二章课后作业

## 作业一： 请描述什么是依赖倒置原则，为什么有时候依赖倒置原则又被称为好莱坞原则

> 依赖倒置（DIP）：高层模块不应该依赖低层模块，两者都应该依赖抽象；抽象不应该依赖细节，细节应该依赖抽象

自己的理解：

* 前半句的高层模块和低层模块指的都是实现类；高层的实现类不应该直接依赖低层的实现类，而只依赖低层的接口或抽象类。低层实现类在运行时通过“注入”赋予，通常的实现手段就是在构造时将抽象指针指向实现类的对象。

* 后半句就是对“面向接口编程”思想的解释：抽象和实现类里的依赖都应该是接口或是抽象类。

> Hollywood Principle: Don't Call Us, We'll Call You

好莱坞原则在开发中的体现就是：高层模块不直接调用底层组件，而是从容器中获取。为什么说有时候依赖倒置原则又被称为好莱坞原则，其实主要原因就是绝大多数框架在实现 DIP 的时候用了好莱坞原则：高层模块不会去 `new` 一个依赖，而是由框架在运行时动态给予，就是所谓的“别打电话给我，有事我会打电话给你”。

## 作业二：请描述一个你熟悉的框架，是如何实现依赖倒置原则的

[NestJs][1]是一款渐进式的 NodeJs 服务端应用框架。它通过 Typescript 的 Adapter（`@`）实现了一套依赖注入机制。NestJs 的依赖注入本质上是一种控制反转（IoC）技术，将依赖实例化委派给 IoC 容器，而不是在自己的代码中执行。我们写一个简单的示例来展示如何使用依赖注入，主要就三个步骤：

1. 先写一个服务

    `CatsService` 继承自接口 `CatsInterface`，利用 `@Injectable` 修饰器将 `CatsService` 标记为提供者：

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { CatsInterface } from './cat.interface';

    @Injectable()
    export class CatsService implements CatsInterface {
      findAll(): string[] {
        return ['Tomcat'];
      }
    }
    ```

2. 再写一个控制器

    `CatsController` 在构造器内申明了一个依赖于 `CatsInterface` 的令牌（`catsService`）用于注入服务，但是控制器依赖的仅仅是服务的接口：

    ```typescript
    import { Controller, Get } from '@nestjs/common';
    import { CatsInterface } from './cat.interface';

    @Controller('cats')
    export class CatsController {
      constructor(private readonly catsService: CatsInterface) {}

      @Get()
      async findAll(): Promise<string[]> {
        return this.catsService.findAll();
      }
    }
    ```

3. 最后写一个 Module 文件

    Module 文件就是 NestJs 里的配置文件，为 Next IoC 容器注册应用所需的 Controller 和 Service 实现类。

    ```typescript
    import { Module } from '@nestjs/common';
    import { CatsController } from './cats/cats.controller';
    import { CatsService } from './cats/cats.service';

    @Module({
      controllers: [CatsController],
      providers: [CatsService],
    })
    export class AppModule {}
    ```

    当 Nest Ioc 容器实例化 `CatsController` 时，将对 `catsService` 令牌执行查找（`Provider`内查找）；当发现 `CatsService` 后，返回实现类。NestJs 会单例化 `CatsService` 对象，并将其置于容器缓存；若有其他实例依赖 `CatsService` 对象，可立即从缓存中返回对象。

    分析依赖项代码的过程发生在应用程序引导期间。一个关键特性是依赖关系分析（或“创建依赖关系图”）是可传递的。 在上面的示例中，如果 `CatsService` 本身具有依赖项，那么那些依赖项也将得到解决。依赖关系图确保以正确的顺序解决依赖关系——本质上是“自下而上”。 这种机制使开发人员不必管理此类复杂的依赖关系图。

## 作业三： 请用接口隔离原则优化 Cache 类的设计，画出优化后的类图

```java
class Cache {
  Object get(Object key);
  void put(Object key, Object value);
  void delete(Object key);
  void reBuild(Config conf);
}
```

实现上很简单只需 `Cache` 类依赖两个接口，分别被应用和远程依赖：

![Cache UML][2]

[1]: https://github.com/nestjs/nest
[2]: ./img/Cache.png
