/**
 * AnimationService — 控制算法动画的播放/停止
 * 依赖 Store 来读写动画状态
 */
import { sleep } from '../utils/helpers.js';

export class AnimationService {
    constructor(store, eventBus) {
        this._store = store;
        this._bus = eventBus;
    }

    /** 当前是否正在播放 */
    get isRunning() {
        return this._store.state.animationRunning;
    }

    /** 停止当前动画 */
    stop() {
        this._store.setState({ animationAbort: true, animationRunning: false });
        this._bus.emit('animation:stop');
    }

    /**
     * 播放一帧序列
     * @param {Array} frames
     * @param {number} delay — 毫秒
     * @param {Function} applyFn — 每帧调用，接收 (frame, index)
     * @returns {Promise<boolean>} 是否正常完成（true）或被中止（false）
     */
    async play(frames, delay, applyFn) {
        // 空帧序列: 不启动动画，直接返回成功
        if (!frames || frames.length === 0) return true;

        this._store.setState({ animationAbort: false, animationRunning: true });
        this._bus.emit('animation:start');

        for (let i = 0; i < frames.length; i++) {
            if (this._store.state.animationAbort) {
                this._store.setState({ animationRunning: false });
                return false;
            }
            applyFn(frames[i], i);
            await sleep(delay);
        }

        this._store.setState({ animationRunning: false, animationAbort: false });
        this._bus.emit('animation:done');
        return true;
    }
}
