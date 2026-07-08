# LeetCode 可视化工具

一个用于可视化 LeetCode 常见数据结构与算法的 Web 工具。支持图、树、矩阵、链表、栈与队列的可视化，内置 BFS / DFS / Dijkstra / 最大流 / 动态规划 / 链表反转 / 快慢指针等经典算法的逐步动画演示。

## 功能一览

### 数据结构可视化

| 模块 | 支持格式 | 特性 |
|------|---------|------|
| 通用图/树 | 边列表 `[[u,v,w],...]`、邻接列表 `[[邻居...],...]` | 有向/无向、0/1-indexed、节点权重、边权重 |
| 二叉树 | LeetCode 数组 `[3,9,20,null,null,15,7]` | 层序布局、前中后序遍历动画 |
| 矩阵 | 二维数组 `[[1,2],[3,4]]` | 网格布局、DP 逐格填充动画 |
| 链表 | 值数组 `[1,2,3,4,5]` | 单链表 / 双链表 / 循环单 / 循环双，指针方向可视化 |
| 栈 & 队列 | 交互式 Push/Pop/Enqueue/Dequeue | 栈垂直 / 队列水平布局、弹出历史、操作日志 |

### 算法动画演示

**图算法**（通用图/树 Tab）
- **BFS 遍历** — 广度优先，高亮访问顺序与队列状态
- **DFS 遍历** — 深度优先，高亮栈状态与回溯
- **Dijkstra 最短路** — 单源最短路径，显示距离松弛过程与路径
- **Bellman-Ford 最短路** — 支持负权边，检测负环
- **最大流 (Edmonds-Karp)** — BFS 寻找增广路径，显示每轮流量

**二叉树遍历**（二叉树 Tab）
- **前序遍历**（根→左→右）
- **中序遍历**（左→根→右）
- **后序遍历**（左→右→根）

**链表算法**（链表 Tab）
- **反转链表**（迭代法）— 逐帧展示 `next` 指针反转，已反转/未反转部分用不同颜色区分
- **找中点**（快慢指针）— slow/fast 实时标注位置，slow 轨迹高亮
- **检测环**（快慢指针）— 自动判断有无环，相遇时红色高亮
- **删除倒数第 N 个**（双指针）— 快指针先走 N 步，再同步移动定位目标，展示删除后指针重连

**动态规划**（矩阵 Tab）
- **最小路径和** — `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`
- **最大路径和** — `dp[i][j] = grid[i][j] + max(dp[i-1][j], dp[i][j-1])`
- **不同路径数** — `dp[i][j] = dp[i-1][j] + dp[i][j-1]`

### 全局工具栏
- **导出 PNG** — 将当前画布导出为图片
- **清空** — 一键清空画布与状态
- **实时统计** — 节点数 / 边数

## 快速开始

由于使用 ES Modules，需要通过本地服务器打开（不能直接双击 `index.html`）：

```bash
# 在项目根目录执行
python3 -m http.server 8000
```

然后浏览器访问 `http://localhost:8000`。

## 使用示例

### 通用图 + Dijkstra
1. 选择「通用图/树」Tab
2. 输入图结构：`[[0,1,5],[1,3,10],[0,2,3],[2,3,4]]`，边权重选「第三元素」
3. 点击「绘制通用图/树」
4. 算法选择「Dijkstra 最短路」，起点 `0`，终点 `3`
5. 点击「运行」，观察距离松弛动画

### 二叉树 + 中序遍历
1. 选择「二叉树」Tab
2. 输入：`[3,9,20,null,null,15,7]`
3. 点击「绘制二叉树」
4. 遍历方式选「中序遍历」，点击「运行」

### 链表 + 反转
1. 选择「链表」Tab
2. 输入：`[1,2,3,4,5]`
3. 点击「绘制链表」
4. 算法选「反转链表」，点击「运行」
5. 观察 `next` 指针逐个反转，完成后链表自动更新为反转后的状态

### 栈 & 队列
1. 选择「栈 & 队列」Tab
2. 在输入框输入值，点击 Push/Enqueue 添加元素
3. 点击 Pop/Dequeue 弹出元素，弹出历史区实时记录

## 项目架构

采用 ES Modules + 事件驱动 + 集中状态管理 + 模板方法模式，零构建工具。

```
├── index.html                     # 纯结构入口
├── styles/
│   └── main.css                  # 全部样式（科技感蓝主题）
└── src/
    ├── main.js                   # 应用入口，组装模块 + 工具栏
    ├── core/
    │   ├── EventBus.js           # 发布/订阅事件总线
    │   ├── Store.js              # 集中状态管理（单一数据源）
    │   └── Renderer.js           # vis-network 封装
    ├── algorithms/               # 纯函数，与 UI 完全解耦
    │   ├── bfs.js                #   生成「帧序列」
    │   ├── dfs.js
    │   ├── dijkstra.js
    │   ├── bellmanFord.js
    │   ├── maxFlow.js
    │   ├── dp.js
    │   ├── treeTraversal.js      # 前中后序遍历
    │   └── linkedList.js         # 反转/找中点/检测环/删除倒数N
    ├── services/
    │   └── AnimationService.js   # 动画播放/停止控制
    ├── tabs/                     # 模板方法模式
    │   ├── BaseTab.js            #   基类（activate/deactivate 生命周期）
    │   ├── TabManager.js         #   标签切换管理
    │   ├── GeneralGraphTab.js    #   通用图/树 + 图算法
    │   ├── BinaryTreeTab.js      #   二叉树 + 遍历
    │   ├── MatrixTab.js          #   矩阵 + DP
    │   ├── LinkedListTab.js      #   链表 + 链表算法
    │   └── StackQueueTab.js      #   栈 & 队列
    └── utils/
        └── helpers.js            # DOM/解析工具函数
```

### 设计要点

- **算法与 UI 分离** — `algorithms/` 下每个文件是纯函数，只生成「帧序列」（frame array），不触碰 DOM。每帧描述节点颜色、标签、边等状态，由 Tab 层负责渲染。
- **集中状态管理** — 所有共享状态（当前 Tab、动画状态、图数据、统计）通过 `Store` 管理，变更自动通过 `EventBus` 广播 `state:change` 事件。
- **事件驱动** — 模块间通过 `EventBus` 通信，无直接依赖。事件包括 `tab:change`、`animation:start/done/stop`、`state:change`。
- **模板方法模式** — `BaseTab` 定义 `activate()` / `deactivate()` 生命周期，子类重写 `onActivate()` / `onDeactivate()` / `render()`。
- **动画统一控制** — `AnimationService.play(frames, delay, applyFn)` 接收帧序列，逐帧调用回调，支持中途停止。
- **零构建工具** — 纯 ES Modules，浏览器原生 `import/export`，无需 npm / webpack / vite。

## 技术栈

- [vis-network](https://github.com/visjs/vis-network) — 图/树/矩阵/链表可视化（CDN 引入）
- 原生 ES Modules — 无框架、无构建工具
- CSS Custom Properties — 主题变量化

## License

MIT
