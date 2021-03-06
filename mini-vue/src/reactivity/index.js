// 1. 构建响应式库 -> reactivity
// 2. 构建初始化流程
// 3. 构建更新流程
// 4. 构建虚拟节点
// 5. 构建 diff

// 1. 收集依赖
// 2. 触发依赖
let currentEffect;
class Dep {
  constructor() {
    // 收集依赖的容器
    this.effects = new Set();
  }

  // get value() {
  //   this.depend();
  //   return this.val;
  // }

  // set value(newVal) {
  //   this.val = newVal;
  //   this.notice();
  // }

  depend() {
    if (currentEffect) {
      this.effects.add(currentEffect);
    }
  }

  notice() {
    for (const effect of this.effects) {
      effect();
    }
  }
}

// 监听
const watchEffect = (effect) => {
  currentEffect = effect;
  effect();
  currentEffect = null;
};

// export function ref (rawVal) {
//     return new Dep(rawVal)
// }

// 响应
const targetMap = new WeakMap();
function reactive(raw) {
  // 对象
  // 如果对象的每个 key 当做之前的 dep 的话，那么一个 key 就应该有一个 dep
  // 每一个 key 的 dep 应该存储在哪里
  // 设置的时候，是不是需要调用到 dep 的 notice 或者是 depend
  // 之前我们学过用 object.definePropriety
  // Proxy

  // 多个对象
  // 当前这个对象
  // 基于它的key 来找对应的 dep 啊

  const getDep = (target, key) => {
    // 去找到当前 key 对应的 dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
      dep = new Dep();
      depsMap.set(key, dep);
    }

    return dep;
  };

  return new Proxy(raw, {
    get(target, key) {
      // 去找到当前 key 对应的 dep
      const dep = getDep(target, key);
      // 依赖收集
      dep.depend();

      // return target[key]
      return Reflect.get(target, key);
    },
    set(target, key, val) {
      // 还是需要找到 dep
      const dep = getDep(target, key);
      const result = Reflect.set(target, key, val);

      dep.notice();
      return result;
    },
  });
}

// cjs环境
if (typeof exports !== 'undefined') {
  module.exports = {
    reactive,
    watchEffect,
  };
}

// const state = reactive({
//   a: 10,
// });

// let b;
// watchEffect(() => {
//   b = state.a * 10;
//   console.log(b);
// });

// state.a = 20;

// const dep = new Dep();

// let a = 10;
// let b;
// watchEffect(() => {
//   b = a * 10;
//   dep.depend()
//   console.log(b)
// });

// a = 20;
// dep.notice()

// a = 30;
// dep.notice()

// 1. 设置状态 -> 响应式数据
// 2. 设置状态变更后的函数 -> 依赖

// ref
// 值类型
// const dep = new Dep(10);

// let b;

// watchEffect(() => {
//   b = dep.value * 10;
//   console.log(b)
// });

// dep.value = 20;
// dep.value = 30;