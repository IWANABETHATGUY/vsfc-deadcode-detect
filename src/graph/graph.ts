class Graph<T> {
  private adj: Map<T, Set<T>>;
  private visited: Set<T>;
  constructor() {
    this.adj = new Map();
    this.visited = new Set();
  }
  add(v: T, w: T) {
    if (!this.adj.has(v)) {
      this.adj.set(v, new Set());
    }
    if (!this.adj.has(w)) {
      this.adj.set(w, new Set());
    }
    this.adj.get(v).add(w);
  }
  validateVertex(v: T) {
    if (!this.adj.has(v)) {
      throw new Error("vertex isn't exist in this Graph");
    }
  }
  public dfs(start: T, cb: Function) {
    this.validateVertex(start);
    this._dfs(start, cb);
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
