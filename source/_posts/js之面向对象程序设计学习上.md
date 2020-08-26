---
title: js之面向对象程序设计学习（上）
date: 2020-07-28 10:25:18
tags:
---

## 一、理解对象

创建自定义对象最简单的方法是创建一个 Object 实例，然后再为它添加属性和方法或者通过对象字面量的方式创建：

```js
// Object实例方式
let person = new Object();
person.name = 'Mike';
person.sayHello = function(){
  ...
}
// 对象字面量方式
let person = {
  name: 'Lucy',
  sayName: function(){
    console.log(this.name);
  }
};
```

### 1.1 属性类型

属性类型包括**数据属性和访问器属性**。

1. 数据属性
   数据属性包括以下 4 个描述特征

- [[Configurable]]:是否可以通过 delete 删除属性，默认为 true
- [[Enumerable]]:是否可枚举（能否通过 for-in 循环返回属性），默认为 true
- [[Writable]]:能否修改值，默认为 true
- [[Value]]:属性的值，默认为 undefined
  想要**修改**属性特性，必须使用 Object.defineProperty(obj, key, descriptor)，其中第三个**描述符**属性为一个对象，接受以上 4 个数据属性描述作为 key

```js
let person = {};
// 描述符为空对象时，Configurable、Enumerable、Writable都为false
Object.defineProperty(person, "name", {});
delete person.name; // false
```

2. 访问器属性
   访问器属性不包括数据值，只=只包含一对儿 getter 和 setter 函数，在读取访问器属性时，调用 getter 函数，获取值；写入访问器属性时，调用 setter 函数并传入新值

- [[Configurable]]:是否可以通过 delete 删除属性，默认为 true
- [[Enumerable]]:是否可枚举（能否通过 for-in 循环返回属性），默认为 true
- [[Get]]:读取属性调用的函数，默认为 undefined
- [[Set]]:写入属性调用的函数，默认为 undefined
  想要**定义**访问器属性，必须使用 Object.defineProperty(obj, key, descriptor)

```js
let book = {
  _year: 2004,
  edition: 1,
};

Object.defineProperty(book, "year", {
  get: function () {
    return this._year;
  },
  set: function (newValue) {
    if (newValue > 2004) {
      this._year = newValue;
      this.edition += newValue - 2004;
    }
  },
});

book.year = 2005;
console.log(book.edition); // 2
```

上述 edition 之所以变成了 2 是因为修改了 year，调用 set 方法，从而使得 edtion 的值发生改变。这也是访问器属性的常用场景：**设置一个属性导致其他属性发生变化**。

3. 定义多个属性
   通过 Object.defineProperties(obj, props)

```js
let book = {};
Object.defineProperties(book, {
  _year: {
    value: 2004,
    // 数据属性字段
    ...
  },
  year: {
    get: function(){
      ...
    }
    // 访问器属性字段
  }
})
```

4. 读取属性特性
   通过 Object.getOwnPropertyDescriptor(obj, props)

```js
let descriptor = Object.getOwnPropertyDescriptor(book, "_year");
console.log(descriptor);
// {configurable: false, enumerable: false, value: 2004, writable: false }
```

## 二、创建对象

通过 Object 构造函数或者字面量创建对象有一个明显的缺点：**使用一个接口创建很多对象，产生了大量重复的代码**，通过引入模式的概念来解决这一问题。

### 2.1 工厂模式

工厂模式是软件领域最广为人知的设计模式（创建型），在 java 中，就是“抽象类”的概念。js 中没有类，使用函数来封装以特定接口创建对象的细节：

```js
function createPerson(name, age) {
  let o = new Object();
  o.name = name;
  o.age = age;
  o.sayName = function () {
    console.log(this.name);
  };
  return o;
}
let p1 = createPerson("p1", 19);
let p2 = createPerson("p2", 20);
```

工厂模式解决了创建多个相似对象的问题，但是却没有解决<font color='red'>对象识别的问题（对象的类型）</font>，比如本例中 p1 是由 createPerson 函数创建，它应该属于“Person 类型”。

### 2.2 构造函数模式

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.seyName = function () {
    console.log(this.name);
  };
}
let p1 = new Person("p1", 18);
let p2 = new Person("p2", 20);
```

构造函数模式和工厂模式有以下的改动：

- 没有显式地创建对象
- 直接将属性和方法赋给了 this 对象
- 没有 return 语句
- 创建对象的使用使用了 new 操作符

new 操作符会经历以下 4 个步骤

1. 创建一个新对象
2. 将构造函数作用域赋给新对象（此时 this 指向了这个新对象）
3. 执行构造函数中的代码（为新对象添加属性）
4. 返回新对象

```js
let p = new Person("name", 20);
// new等同于以下步骤
let p = {};
p.__proto__ = Person.prototype;
Person.call(p, "name", 20);
return p;
```

构造函数模式中对象 p 中，p.constructor 保存了对象的类型（Person），解决了对象无法识别的问题。但是这种模式也有缺点，就是每个方法都要在每个实例上重新创建一遍。上述的 p1 和 p2，都是 Person 的实例，他们都包含了相同的 sayName 方法，但是两个方法不是同一个 Function 实例，而是创建了两遍。
