/**
 * 统一颜色常量 — 适配暗色主题
 * 所有算法动画的高亮色从此模块引用，避免散落各处且与主题冲突。
 */

export const COLORS = {
    /** 默认节点色（未被算法处理时） */
    default:    { background: '#1e3a5f', border: '#38bdf8' },
    /** 空闲/未访问 */
    idle:       { background: '#334155', border: '#475569' },
    /** 已访问 */
    visited:    { background: '#1e3a5f', border: '#38bdf8' },
    /** 当前操作节点 */
    current:    { background: '#78350f', border: '#fbbf24' },
    /** 已确定/已最终化 */
    finalized:  { background: '#14532d', border: '#34d399' },
    /** 在队列/栈中 */
    inQueue:    { background: '#0c4a6e', border: '#22d3ee' },
    /** prev 指针 */
    prev:       { background: '#14532d', border: '#34d399' },
    /** next/fast 指针 */
    next:       { background: '#4c1d95', border: '#a78bfa' },
    /** 找到目标 */
    found:      { background: '#14532d', border: '#34d399' },
    /** 匹配/相遇 */
    matched:    { background: '#7f1d1d', border: '#f87171' },
    /** slow 走过的路径 */
    visitedTrack: { background: '#0c4a6e', border: '#7dd3fc' },
};
