class Graph<T> {
  private adj: Map<T, Set<T>>;
  private visited: Set<T>;
  constructor() {
    this.adj = new Map();
    this.visited = new Set();
  }
  addEdge(v: T, w: T) {
    this.addVertex(v)
    this.adj.get(v).add(w);
  }
  addVertex(v: T) {
    if (!this.adj.has(v)) {
      this.adj.set(v, new Set());
    }
  }
  validateVertex(v: T) {
    if (!this.adj.has(v)) {
      throw new Error("vertex isn't exist in this Graph");
    }
  }
  public dfs(cb: Function) {
    for (const node of this.adj.keys()) {
      this._dfs(node, cb);
    }
  }
  private _dfs(node: T, cb: Function) {
    this.visited.add(node);
    cb(node);
    const set = this.adj.get(node);
    for (const w of set) {
      if (!this.visited.has(w)) {
        this._dfs(w, cb);
      }
    }
  }
}

export default Graph;
