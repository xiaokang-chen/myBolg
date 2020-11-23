---
title: react hook学习
date: 2020-11-16 19:01:29
tags:
---

## 一、Hook 简述

Hook 是 React16.8 的新特性，可以在不编写 class 的情况下在“函数”中使用 class 组件的特性，比如在函数中使用 state。

Hook 产生的<font color='red'>Motivation</font>：

1. 组件间状态逻辑复用困难（比如 B 组件中使用 A 组件内定义的函数）
2. 复杂组件变得难以理解（比如在周期函数中需要做大量处理，而这些处理又互不相关的组件）
3. 难以理解的 class（需要关注恶心的 this 指向）

Hook 包括内置 Hook（如 State Hook 和 Effect Hook），以及自定义 Hook（用来复用不同组件之间的状态逻辑）

## 二、Hook 使用规则

1. 只能在函数组件的“第一层作用域”调用 hook（也就是说不能在函数组件的子函数中调用 hook）
2. 只能在函数组件或自定义 hook 内调用，不能在条件、循环、嵌套函数中调用。

在多个 State Hook 使用时，React 通过调用顺序判定哪个 state 对应哪个 useState。**所以不能放到条件语句中！！！会打乱 Hook 调用顺序！！！**

## 三、State Hook

### 3.1 State Hook 例子

```js
import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Click me
      </button>
    </div>
  );
}
```

上述的 useState 就是一个 hook，通过它可以再函数组件中添加 state。useState()接收一个初始值，以及返回一个**状态值**和**更新这个状态值的函数**（由于返回 2 个值，所以用解构进行定义显然更为方便）。<font color='red'>他类似于 this.setState，但是不会将新的 state 和旧的 state 进行合并，而是**替换**。</font>

function 中 useState 和 class 中 this.state 的区别：

1. 读取：在 class 中显示当前 state，需要 this.state.count，而 function 中，可以直接用 count
2. 更新：在 class 中更新需要 this.setState()来更新 count 值，而 function 中，已经有了 setCount 和 count 变量，我们更新的时候直接调用 setCount 更新函数即可

### 3.2 State Hook 原理分析

页面在首次渲染时会 render 渲染 App 函数组件，实际是调用了 App()方法，得到虚拟 Dom，并将其渲染到浏览器页面。当用户点击 button 时，调用 setCount(count+1)方法，就会再次渲染 App 函数组件，实际还是调用了 App()方法，得到一个新的虚拟 Dom 元素，然后 React 执行 diff 算法，将 patch 更新到真实 Dom 上。

问题：页面首次渲染和进行+1 操作，都会调用 App()函数去执行 const [count, setCount] = useState(0);这行代码，那它是怎么做到在+1 操作后，第二次渲染时执行同样的代码，却不对变量 n 进行初始化的，而是拿到 n 的最新值的呢 ？

### 3.3 useState 简单实现

```js
function useState(initialValue) {
  let state = initialValue;
  function setState(newState) {
    state = newState;
    render();
  }
  return [state, setState];
}
```

上面的写法有一个<font color='red'>严重</font>的问题：当组件重新渲染时，state 又被初始化为**初始值**。一个直观的现象就是：点击 button 后，n 一直都会是 0，不会实现+1 的操作。

```js
let _state;
function useState(initialState){
  _state = _state || initialState;
  function setState(newState) {
    _state = newState(newState){
      _state = newState;
      render();
    }
  }
}
```

\_state = \_state || initialState 这段代码表示，当第一次执行时，把 initialState 复制给\_state，而后续则使用最新的\_state。我们更新状态也都是用\_state.

## 四、Effect Hook

Effect Hook 用于在函数组件内操作**副作用**，它与 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同用途，只不过这三个周期函数被合并为一个 api 作为 hook 在函数组件中使用。
&emsp;&emsp;我们需要先搞清**副作用**的含义：React 组件内数组获取、订阅、手动修改 DOM。其实副作用是相对于“纯函数”而言的，纯函数即只包含输入和输出，不会对外部进行影响。而带副作用的函数则会对函数外部造成影响（比如造成外部 dom 变化）。

下面看一个 Effect Hook 的例子：

```js
import React, { useState, useEffect } from "react";

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

在你调用 useEffect 时，就是告诉 React，在完成 Dom 更改后运行“副作用”函数。

我们也可以在函数组件中使用多个 useEffect：

```js
function FriendStatusWithCounter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // 后台接口数据拉取
  })
  useEffect(() => {
    // dom操作
  })
  ...
}
```

上面在函数内定义了两个 useEffect，两个 Effect Hook 分别完成不同的事情。在 class 组件中，或许我们需要把数据请求和 dom 操作等一些副作用放到 componentDidMount 中，这样会造成逻辑划分混乱，如果副作用数量少还好，如果副作用数量多，**并且同一个副作用在多个周期函数中使用到，就会造成巨石组件**。使用 Effect Hook 可以使我们像<font color='red'>写 class 内部纯函数那样去在函数组件中写副作用。</font>

## 五、Context Hook

试想一个场景：我们有一段用户信息（JSON），需要在全局进行共享。通常的做法是使用 redux，将用户信息存储到全局 store 里。而我们这里可以使用 Context Hook：

```jsx
const userInfo = {
  name: 'cxk',
  sex: 'male',
  ...
}
// 创建了全局的上下文环境
const myContext = React.createContext(userInfo);

function User(){
  const info = useContext(myContext);
  return (
    <div>
      <div>{info.name}</div>
      <div>{info.sex}</div>
      ...
    </div>
  )
}
```

## 六、其他内置 Hook

比如 useRef、useReducer 等具有特殊作用的 hook，这里先不详细展开。

## 七、自定义 Hook

试想在下面两个包含共同逻辑的函数组件：

```js
import React, { useState, useEffect } from "react";

function A(props) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    // some same code
  });

  if (isOnline === null) {
    return "Loading...";
  }
  return isOnline ? "Online" : "Offline";
}
```

```js
import React, { useState, useEffect } from "react";

function B(props) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    // some same code
  });

  return (
    <li style={{ color: isOnline ? "green" : "black" }}>{props.friend.name}</li>
  );
}
```

可以看到 A 和 B 都需要 isOnline 状态。通过自定义 hook 吧 A 和 B 函数组件中共同的逻辑部分提取出来，并返回这个状态作为公共逻辑供 A 和 B 使用：

```js
import { useState, useEffect } from "react";

function C(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    // some same code
  });
  return isOnline;
}
```

而此时我们就可以在 A 和 B 中使用 C 了：

```js
function A(props) {
  // 自定义hook的调用
  const isOnline = C(props.friend.id);

  if (isOnline === null) {
    return "Loading...";
  }
  return isOnline ? "Online" : "Offline";
}

function B(props) {
  // 自定义hook的调用
  const isOnline = C(props.friend.id);

  return (
    <li style={{ color: isOnline ? "green" : "black" }}>{props.friend.name}</li>
  );
}
```

注意：

1. 自定义 Hook 以<font color='red'>“use”</font>开头，这个约定很重要，从命名来代表它是一个自定义 Hook。
2. 两个组件内的相同 Hook 是不共享的，自定义 Hook 中的所有 state 和副作用和都是完全隔离的，不同组件调用自定义 Hook 时，他们都是相对独立的
