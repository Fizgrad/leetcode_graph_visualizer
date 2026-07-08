/**
 * Store — 集中状态管理
 * 单一数据源，通过 setState 更新，通过事件通知变更
 */
export class Store {
    constructor(eventBus) {
        this._bus = eventBus;
        this._state = {
            currentTab: 0,
            animationRunning: false,
            animationAbort: false,
            graph: null,
            matrix: null,
            stats: { nodes: 0, edges: 0 },
        };
    }

    get state() {
        return this._state;
    }

    setState(partial) {
        this._state = { ...this._state, ...partial };
        this._bus.emit('state:change', this._state);
    }

    setGraph(graph) {
        this.setState({ graph });
    }

    setMatrix(matrix) {
        this.setState({ matrix });
    }

    setStats(nodes, edges) {
        this.setState({ stats: { nodes, edges } });
    }

    setTab(tabIndex) {
        this.setState({ currentTab: tabIndex });
    }
}
