// 为浏览器环境提供空的Node.js API实现
// 这是为了解决pptxgenjs库在浏览器中的兼容性问题

// 这个文件会被客户端代码导入，提供空的实现以防止运行时错误

const noop = () => { };

// 模拟Node.js中的process全局对象
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = {
    env: {},
    cwd: () => '',
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

const mockFs = {
  readFileSync: noop,
  writeFileSync: noop,
  existsSync: () => false,
};

const mockPath = {
  resolve: (...args: string[]) => args.join('/'),
  join: (...args: string[]) => args.join('/'),
  basename: (path: string) => path.split('/').pop() || '',
};

export { mockFs, mockPath };

// 默认导出，以确保模块可以被正确导入
export default {
  fs: mockFs,
  path: mockPath,
}; 