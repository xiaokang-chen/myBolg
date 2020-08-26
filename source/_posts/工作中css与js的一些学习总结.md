---
title: 工作中css与js的一些学习总结
date: 2020-06-09 11:14:16
tags:
---

## 一、CSS 部分

### 1.1 pointer-events

在工作中，有一个需求是：在蒙版（也就是为了达到一些视觉效果，在轮播最左和最右的 item 上层加一个 div）上，需要点击到底层的 item。通俗的讲，就是有两个 div，一个 div 的 z-index 大，在上层，另外一个 div 的 z-index 小，在下层。需要做到点击这 2 个 div 所在的重叠区域，触发下层 div 的点击事件，而不触发上层的 div 点击事件。
这里就可以用到 pointer-events 属性。**它可以指定在什么情况下 (如果有) 某个特定的图形元素可以成为鼠标事件的 target**。
<font color='red'>常用的取值如下：</font>

- auto: 默认值，不改变元素上鼠标点击事件的效果
- none: 元素永远不会成为鼠标事件的 target。但是，当其后代元素的 pointer-events 属性指定其他值时，鼠标事件可以指向后代元素，在这种情况下，鼠标事件将在捕获或冒泡阶段触发父元素的事件侦听器。

所以在上述需求中，我直接将上层的 div 的 pointer-events 的值设置为 none 就在点击后不触发其事件了。

### 1.2 background 使用 url()问题

background 中使用 url 函数，并且 img 中没有设置默认的 src，会导致图片出现类似边框的边界（使用 border:none 去不掉，因为不是边框）

```html
<div class="container">
  <img />
  <span>文字部分</span>
</div>
```

```css
.container {
  width: 200px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: blanchedalmond;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  height: 30px;
  width: 30px;
  background: url("./pic/phone.svg") center center no-repeat;
}
```

![background 使用 url()问题](./../pic/1/1.png)

所以工作中有图片切换的需求（比如 hover 之后背景图片切换），就将 url 写到\<span>中即可

## 二、Js 部分

### 2.1 window.onload 和\$(document).ready（js 原生不提供，jQ 的方法）执行顺序

$(document).ready 和 window.onload 的区别是：
&emsp;&emsp;&emsp;&emsp;document.ready 方法在 DOM 树加载完成后就会执行，而 window.onload 是在页面资源（比如图和媒体资源，它们的加载速度远慢于 DOM 的加载速度）加载完成之后才执行。也就是说\$(document).ready 要比 window.onload 先执行。

```js
window.onload = function () {
  console.log(456);
};
$(document).ready(function () {
  console.log(123);
});
```

![$(document).ready和window.onload执行顺序](./../pic/1/2.png)

### 2.2 Swiper 组件垂直 loop 下的问题

Swiper 组件是现在用的最多的轮播组件，但是我在使用它的过程中发现一些问题。就是当同时设置垂直和循环的时候，在点击轮播中的某一个 item 的时候，会出现轮播从垂直变成水平，并且位置也移出视图之外

```js
this.$leftSwiper = new Swiper('.left-content', {
    // 下面这两个属性同时设置的时候会有一些问题
    loop: true,
    direction: 'vertical',
    // autoplay: {
    // delay: 2000,
    // },
    on: {
        // some event
        ...
    },
});
```

经过查看，发现在点击事件之后，轮播的 class 会丢失，丢失的 class 在设置的轮播那一层，会丢失 vertical-wrap、swiper-container-initialized、swiper-container-vertical（这些 class 本身在你定义 Swiper 时会被自动加上，在点击事件之后会丢失）。
&emsp;&emsp;&emsp;&emsp;这里我的解决方法是将这三个 class 写死在轮播 class 中，猜想应该是 Swiper 的 bug，后续有时间去看看 Swiper 的源码，看看有没有更优雅的解决方案。
