import Background from '../runtime/background'
import DataStore from '../base/DataStore';
import Sprite from '../base/Sprite';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

export default class HomeScene {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = DataStore.getInstance().canvas;
    // this.loop();
    // this.getSettingAndDrawAvatarAndStartButton();


    this.drawBackground()
    this.getSettingAndDrawAvatar()
    this.drawStartButton()
  }

  getSettingAndDrawAvatar() {
    this.wxgetSetting()
  }

  wxgetSetting() {
    let self = this
    wx.getSetting({
      success(res) {
        console.log(`getSetting success: `, res)
        if (res.authSetting['scope.userInfo'] === true) {
          self.wxgetUserInfo()
        } else {
          self.drawAvatar()
        }
      }
    })
  }

  wxgetUserInfo() {
    let self = this
    wx.getUserInfo({
      success(res) {
        console.log(`getUserInfo success: `, res)
        self.userInfo = res.userInfo
        self.wxdownloadFile(self.userInfo.avatarUrl)
      }
    })
  }

  wxdownloadFile(url) {
    let self = this
    wx.downloadFile({
      url: url,
      success(res) {
        console.log(`downloadFile success: `, res)
        if (res.statusCode === 200) {
          self.wxsaveFile(res.tempFilePath)
        }
      }
    })
  }

  wxsaveFile(url) {
    let self = this
    wx.saveFile({
      tempFilePath: url,
      success(res) {
        console.log(`saveFile success: `, res)
        self.userInfo.savedFilePath_avatar = res.savedFilePath;
        self.drawAvatar()
      }
    })
  }


  drawBackground() {
    this.ctx.clearRect(0, 0, screenWidth, screenHeight);
    this.background = new Background(this.ctx);
  }

  drawAvatar() {
    if (this.userInfo && this.userInfo.savedFilePath_avatar) {
      let self = this;
      this.homeEle = wx.createImage();
      this.homeEle.src = this.userInfo.savedFilePath_avatar;
      this.homeImg = new Sprite(this.homeEle, screenWidth / 3, screenHeight / 4, screenWidth / 3, screenWidth / 3);
      this.homeEle.onload = function () {
        self.homeImg.draw(self.ctx);
      }
    } else {
      // this.homeEle = Sprite.getImage(this.userInfo ? 'pfc_local' : 'blank_avatar');
      this.homeEle = Sprite.getImage('blank_avatar');
      this.homeImg = new Sprite(this.homeEle, screenWidth / 3, screenHeight / 4, screenWidth / 3, screenWidth / 3);
      this.homeImg.draw(this.ctx)
    }

    console.log(`homeEle: `, this.homeEle)
    // this.logoImg = Sprite.getImage('logo');
    // console.log(`logoImg: `, this.logoImg)
  }

  drawStartButton() {
    var button = wx.createUserInfoButton({
      type: 'text',
      text: 'Start',
      style: {
        left: screenWidth / 3,
        top: screenHeight / 2,
        width: screenWidth / 3,
        height: screenHeight / 20,
        lineHeight: 40,
        backgroundColor: '#ff0000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    });
    // button.show();
    let self = this;
    button.onTap((res) => {
      // console.log(`createUserInfoButton res: `, res)
      console.log(`onTap res: `, res)
      if (res.userInfo) {
        DataStore.getInstance().director.toQuestionScene(self.ctx);
        button.destroy();
      }
    });
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
          console.log(`onTouchStart 1 return??`)
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
        console.log(`onTouchStart 2 toQuestionScene`)
        cancelAnimationFrame(_this.requestId);
        if (!this.userInfo) {
          let self = this;
          // wx.authorize({
          //   scope: 'scope.userInfo',
          //   success: res => {
          //     self.userInfo = res.userInfo;
          //     console.log(`authorize`);
          //     DataStore.getInstance().director.toQuestionScene(_this.ctx);
          //   },
          //   fail: res => {
          //     // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
          //     if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
          //       // 处理用户拒绝授权的情况
          //       console.log(`reject authorize`);
          //
          //     }
          //   }
          // })
        } else {
          DataStore.getInstance().director.toQuestionScene(_this.ctx);
        }
      } else if (x >= _this.rankSprite.x
          && x <= _this.rankSprite.x + _this.rankSprite.width
          && y >= _this.rankSprite.y
          && y <= _this.rankSprite.y + _this.rankSprite.height) {
        // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
        console.log(`onTouchStart 3 messageSharecanvas`)
        _this.messageSharecanvas();
        _this.loop();
        wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
      }
    });
  }
}
