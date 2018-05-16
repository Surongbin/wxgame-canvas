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
## 开发问题小结
1、开放域sharedCanvas模糊的问题，其他canvas模糊问题同
  属于canvas模糊的基本问题，可以将sharedCanvas的宽高在主域设置成像素比倍数（注意不能在开放域设置，因为sharedCanvas是只读的在开放域设置宽高会报错），
  然后sharedCanvas里面设置缩放context.scale(ratio, ratio)。sharedCanvas里绘制的时候也需要按对应倍数放大绘制元素，可以缩放到750像素，然后按照750的尺寸进行绘制。
  上屏canvas通过drawImage方法将sharedCanvas绘制到上屏以显示sharedCanvas，这里drawImage里要设置宽高为当前屏幕的宽高，实现将sharedCanvas缩小实现高清

2、上屏canvas绘制sharedCanvas不显示的问题
  如果上屏没有实时绘制，显然不显示sharedCanvas是大概率会出现的。开放域获取用户接口是异步的，绘制图片等资源也是异步的，上屏绘制的时候，子域的canvas还没有将数据和图片绘制，
  但是子域又没有办法主动通知主域，所以建议在主域实时绘制。

3、真机分享后黑屏的问题
  如果页面不是实时绘制的，在分享后会黑屏，因为canvas没有绘制，所以需要监听onShareAppMessage的回调去绘制canvas，或者监听wx.onShow在小游戏回到前台的时候进行处理

4、主域获取用户信息wx.getUserInfo授权报错的问题
  因为小游戏官方近期修改了接口，需要改用wx.createUserInfoButton创建按钮，用户点击获取用户信息

5、 开放域依然可以用wx.getUserInfo获取用户信息，但是开放域无法获取openid

