# 食堂就餐卡系统设计

## 设计概述

食堂就餐卡系统是一款厂内就餐付费系统，是公司后勤部自使用的软件。

### 功能概述

* 系统中每个消费者都有一张卡，在管理中心注册缴费，卡内记着消费者的身份、余额。

* 使用时将卡插入收款机则显示卡上金额，服务员按收款机上数字键，收款机自动计算并显示消费额及余额。

* 管理中心的管理员监视每一笔消费，可打印出消费情况的相关统计数据。

归总后，系统主要功能包括：注册、充值、扣费、显示余额、打印清单。

![use case][1]

### 非功能约数

系统的日活用户在 20000 人。平均响应时间小于 300ms。

## 系统部署图与整体设计

系统上线时预计部署 50 台收款机，2 台管理中心 PC，两台服务器（1 主 1 备）。

### 系统部署图

![部署图][2]

* 收款机功能为扣费、显示余额等前台操作。在食堂部署 50 台物理机，与服务器之间通过 TCP/IP 同步交互。

* 管理中心 PC 用于注册、充值、打印清单相关的前台界面。共部署 2 台 PC，与服务器之间通过 TCP/IP 交互。

* 服务器为就餐卡后台系统，并准备一份用于备份的服务器。

### 服务器设计

服务器子组件有如下几个部分组成：

* 开卡操作：用于开新开时后台操作
* 就餐卡操作：就餐卡本身数据的增删改查
* 数据库：一主一备的两台数据库

![服务器子组件][3]

#### 开卡场景下的时序图

![开卡][4]

#### 就餐卡操作场景时序图

![就餐卡操作][5]

[1]: ./img/exercise/use-case.png
[2]: ./img/exercise/deployment.png
[3]: ./img/exercise/component.png
[4]: ./img/exercise/register.png
[5]: ./img/exercise/operators.png
