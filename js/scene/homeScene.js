import Background from '../runtime/background'
import DataStore from '../base/DataStore';
import Sprite from '../base/Sprite';
// import {getAuthSettings, createUserInfoButton} from '../utils/auth.js';
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

export default class HomeScene {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = DataStore.getInstance().canvas;
    // this.loop();
    this.getSettingAndDrawAvatarAndStartButton();
  }

  getSettingAndDrawAvatarAndStartButton = () => {
    let self = this;
    wx.getSetting({
      success(res) {
        let authSetting = res.authSetting;
        if (authSetting['scope.userInfo'] === true) {
          // 用户已授权，可以直接调用相关 API
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              self.userInfo = res.userInfo;
              console.log(`getUserInfo success`, res.userInfo)
              // self.drawAvatar()
              // self.drawStartButton()
              self.loop()
            },
          });
        } else {
          // self.drawAvatar()
          // self.drawStartButton()
          self.loop()
        }
        console.log(`authSetting['scope.userInfo']: `, authSetting['scope.userInfo'])

        // else if (authSetting['scope.userInfo'] === false) {
        //   // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
        //   console.log('到设置页面打开授权开关');
        //   // wx.showModal({
        //   //   title: '提示',
        //   //   content: '请到设置页面打开授权开关',
        //   //   showCancel: false,
        //   //   confirmText: '知道了',
        //   //   success: res => {
        //   //   }
        //   // });
        // } else {
        //   // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
        //   wx.authorize({
        //     scope: 'scope.userInfo',
        //     success: res => {
        //       _this.dataStore.userInfo = res.userInfo;
        //       // console.log(_this.dataStore.userInfo);
        //     },
        //     fail: res => {
        //       // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
        //       if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
        //         // 处理用户拒绝授权的情况
        //       }
        //     }
        //   })
        // }


      }
    })

    // self.drawAvatar()
    // self.drawStartButton()
  }

  drawAvatar() {
    if (this.userInfo) {
      let self = this;
      this.homeEle = wx.createImage();
      this.homeEle.src = this.userInfo.avatarUrl;
      this.homeImg = new Sprite(this.homeEle, screenWidth / 3, screenHeight / 4, screenWidth / 3, screenWidth / 3);
      this.homeEle.onload = function () {
        self.homeImg.draw(self.ctx);
      }
    } else {
      this.homeEle = Sprite.getImage('blank_avatar');
      this.homeImg = new Sprite(this.homeEle, screenWidth / 3, screenHeight / 4, screenWidth / 3, screenWidth / 3);
      this.homeImg.draw(this.ctx)
    }
    console.log(`homeEle: `, this.homeEle)
    this.logoImg = Sprite.getImage('logo');
    console.log(`logoImg: `, this.logoImg)


  }

  drawStartButton() {
    this.btnImg = Sprite.getImage('start_btn');
    this.startSprite = new Sprite(this.btnImg, (screenWidth - this.btnImg.width / 2) / 2, screenHeight / 2,
      this.btnImg.width / 2, this.btnImg.height / 2);
    this.startSprite.draw(this.ctx);

    this.rankImg = Sprite.getImage('rank_btn');
    this.rankSprite = new Sprite(this.rankImg, (screenWidth - this.rankImg.width / 2) / 2, this.startSprite.y + this.startSprite.height + 20,
      this.rankImg.width / 2, this.rankImg.height / 2);
    this.rankSprite.draw(this.ctx);

    this.bindEvent();
  }

  loop() {
    console.log(`loop`)
    this.ctx.clearRect(0, 0, screenWidth, screenHeight);
    this.background = new Background(this.ctx);
    this.drawAvatar();
    this.drawStartButton();
    // console.log(DataStore.getInstance().userInfo);
    // if (!DataStore.getInstance().userInfo) {
    //     createUserInfoButton();
    // }
    if (DataStore.getInstance().shareTicket && !this.showGroup) {
      this.showGroup = true;
      this.messageSharecanvas('group', DataStore.getInstance().shareTicket);
    }
    if (this.ranking) {
      // 子域canvas 放大绘制，这里必须限制子域画到上屏的宽高是screenWidth， screenHeight
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0, screenWidth, screenHeight);
    }
    // this.requestId = requestAnimationFrame(this.loop.bind(this));
  }

  messageSharecanvas(type, text) {
    // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
    let openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage({
      type: type || 'friends',
      text: text,
    });
    this.ranking = true;
  }

  bindEvent() {
    let _this = this;
    wx.offTouchStart();
    if (this.ranking) {
      wx.onTouchStart((e) => {
        let x = e.touches[0].clientX,
          y = e.touches[0].clientY;
        let scale = screenWidth / 750;
        if (x >= 80 * scale && x <= 180 * scale && y >= 1120 * scale && y <= 12200 * scale) {// 返回按钮
          _this.ranking = false;
          setTimeout(() => {
            cancelAnimationFrame(_this.requestId);
          }, 20);
        }
      });
      return;
    }
    wx.onTouchStart((e) => {
      let x = e.touches[0].clientX,
        y = e.touches[0].clientY;
      if (x >= _this.startSprite.x
        && x <= _this.startSprite.x + _this.startSprite.width
        && y >= _this.startSprite.y
        && y <= _this.startSprite.y + _this.startSprite.height) {
        cancelAnimationFrame(_this.requestId);
        DataStore.getInstance().director.toQuestionScene(_this.ctx);
      } else if (x >= _this.rankSprite.x
        && x <= _this.rankSprite.x + _this.rankSprite.width
        && y >= _this.rankSprite.y
        && y <= _this.rankSprite.y + _this.rankSprite.height) {
        // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
        _this.messageSharecanvas();
        _this.loop();
        wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
      }
    });
  }
}
