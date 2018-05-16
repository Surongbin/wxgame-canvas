import QuestionPage from './questionScene'
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
      this.loop();
  }
  drawHomeEle () {
      this.homeEle = Sprite.getImage('homepage');
      this.logoImg = Sprite.getImage('logo');
      this.homeImg = new Sprite(this.homeEle, 0, this.logoImg.height - 60, this.homeEle.width / 2, this.homeEle.height / 2);
      this.homeImg.draw(this.ctx);
  }
  drawButton () {
      this.btnImg = Sprite.getImage('start_btn');
      this.startSprite = new Sprite(this.btnImg, (screenWidth - this.btnImg.width / 2) / 2, this.homeImg.height + 60,
                                    this.btnImg.width / 2, this.btnImg.height / 2);
      this.startSprite.draw(this.ctx);

      this.rankImg = Sprite.getImage('rank_btn');
      this.rankSprite = new Sprite(this.rankImg, (screenWidth - this.rankImg.width / 2) / 2, this.startSprite.y + this.startSprite.height + 20,
          this.rankImg.width / 2, this.rankImg.height / 2);
      this.rankSprite.draw(this.ctx);

      this.bindEvent();
  }
  loop () {
        this.ctx.clearRect(0, 0, screenWidth, screenHeight);
        this.background = new Background(this.ctx);
        this.drawHomeEle();
        this.drawButton();
        // console.log(DataStore.getInstance().userInfo);
        // if (!DataStore.getInstance().userInfo) {
        //     createUserInfoButton();
        // }
        if (DataStore.getInstance().shareTicket && !this.showGroup){
            this.showGroup = true;
            this.messageSharecanvas('group', DataStore.getInstance().shareTicket);
        }
        if (this.ranking) {
            // 子域canvas 放大绘制，这里必须限制子域画到上屏的宽高是screenWidth， screenHeight
            DataStore.getInstance().ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0, screenWidth, screenHeight);
        }
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }
    messageSharecanvas (type, text) {
        // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            type: type || 'friends',
            text: text,
        });
        this.ranking = true;
    }
  bindEvent () {
      let _this = this;
      wx.offTouchStart();
      if (this.ranking) {
        wx.onTouchStart((e) => {
          let x = e.touches[0].clientX,
            y = e.touches[0].clientY;
            let scale = screenWidth/750;
          if (x >= 80*scale && x <= 180*scale && y >=1120*scale && y <= 12200*scale) {// 返回按钮
              _this.ranking = false;
              setTimeout(()=>{
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