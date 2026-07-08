/**
 * main.js — 应用入口
 * 组装所有模块，初始化全局工具栏
 */
import { EventBus } from './core/EventBus.js';
import { Store } from './core/Store.js';
import { Renderer } from './core/Renderer.js';
import { AnimationService } from './services/AnimationService.js';
import { TabManager } from './tabs/TabManager.js';

function initToolbar(ctx, tabManager) {
    const statsEl = document.getElementById('stats-display');

    document.getElementById('exportBtn').addEventListener('click', () => {
        const dataUrl = ctx.renderer.exportPNG();
        if (!dataUrl) {
            alert('导出 PNG 只能在图/树/矩阵/链表标签页使用。');
            return;
        }
        const link = document.createElement('a');
        link.download = 'graph.png';
        link.href = dataUrl;
        link.click();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        ctx.animation.stop();
        // 遍历所有 Tab 调用 reset()
        tabManager.tabs.forEach((tab) => {
            try { tab.reset(); } catch (e) { /* Tab 可能未实现 reset */ }
        });
        ctx.renderer.setData([], []);
        ctx.store.setGraph(null);
        ctx.store.setMatrix(null);
        ctx.store.setState({ animationRunning: false, animationAbort: false });
        const s = ctx.renderer.getStats();
        ctx.store.setStats(s.nodes, s.edges);
    });

    // 监听状态变化，更新统计
    ctx.eventBus.on('state:change', (state) => {
        const { nodes, edges } = state.stats;
        statsEl.textContent = `节点: ${nodes} | 边: ${edges}`;
    });

    // 监听 tab 切换更新统计
    ctx.eventBus.on('tab:change', () => {
        const s = ctx.renderer.getStats();
        ctx.store.setStats(s.nodes, s.edges);
    });

    // 监听动画完成/停止时更新统计
    const updateStats = () => {
        const s = ctx.renderer.getStats();
        ctx.store.setStats(s.nodes, s.edges);
    };
    ctx.eventBus.on('animation:done', updateStats);
    ctx.eventBus.on('animation:stop', updateStats);
}

function init() {
    const eventBus = new EventBus();
    const store = new Store(eventBus);
    const renderer = new Renderer(document.getElementById('mynetwork'));
    const animation = new AnimationService(store, eventBus);

    const ctx = { eventBus, store, renderer, animation };

    const tabManager = new TabManager(ctx);
    initToolbar(ctx, tabManager);
    tabManager.init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
