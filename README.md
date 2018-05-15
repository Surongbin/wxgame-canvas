## quickstart

## 源码目录介绍
```
./js
├── base                                   // 定义游戏开发基础类
│   ├── DataStore.js                       // 对象临时存储类
│   ├── ResoutceLoader.js                  // 源文件加载类
│   │── Resource.js                        // 需要提前加载到资源文件
│   └── sprite.js                          // 游戏基本元素精灵类
│
├── data
│   └── question.js                        // 题库
│
├── libs
│   ├── symbol.js                          // ES6 Symbol简易兼容
│   └── weapp-adapter.js                   // 小游戏适配器
│
├── player
│   └── question.js                        // 问题类
│
├── runtime
│   ├── background.js                      // 背景类
│   └── logo.js                            // logo 类
│
├── scene
│   ├── homeScene.js                       // 首页场景
│   ├── questionScene.js                   // 问题页场景
│   └── resultScene.js                     // 结果页场景
│
└── Director.js                            // 导演类，控制游戏场景逻辑
./src
├── myOpenDataContext
│   └── index.js                           // 定义开放域

main.js                                    // 游戏入口
```