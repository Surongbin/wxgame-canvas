/**
 * Created by cooky on 2018/5/10.
 */
import Background from "../runtime/background";
import Sprite from "../base/Sprite";
import DataStore from "../base/DataStore";
import {remarks} from '../data/questions';
import {drawText} from '../utils/index';
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

export default class ResultScene {
    constructor (ctx) {
        // this.background = new Background(ctx);
        this.ctx = ctx;
        this.score = DataStore.getInstance().score;
        // this.drawEle();
        this.saveUserCloadStorage();
        this.loop();
    }
    loop() {
        this.background = new Background(this.ctx);
        this.drawEle();

        if (DataStore.getInstance().shareTicket && !this.showGroup){
            this.showGroup = true;
            this.messageSharecanvas('group', DataStore.getInstance().shareTicket);
        }
        if (this.ranking) {
            this.ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0);
        }
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }
    drawEle () {
        let titleImg = Sprite.getImage('title');
        let imgSprite = new Sprite(titleImg, (screenWidth-titleImg.width/2)/2, 20, titleImg.width/2, titleImg.height/2);
        imgSprite.draw(this.ctx);

        let resultImg = Sprite.getImage('result_bg');
        let resultSprite = new Sprite(resultImg, (screenWidth-resultImg.width/2)/2, imgSprite.height+30, resultImg.width/2, resultImg.height/2);
        resultSprite.draw(this.ctx);

        this.ctx.fillStyle = '#1b282c';
        this.ctx.font = '15px Arial';
        console.log(DataStore.getInstance().userInfo);
        //DataStore.getInstance().userInfo.nickName 主域获取用户信息需要用户点击按钮，不获取了
        this.ctx.fillText('你的分数', resultSprite.x + 50, resultSprite.y + 95);
        this.ctx.fillText('分', (screenWidth-resultSprite.x) - 60, resultSprite.y + 95);
        this.ctx.save();
        this.ctx.font = '12px Arial';
        drawText(remarks[this.score], resultSprite.x + 50, resultSprite.y + 120,resultSprite.width-100 ,this.ctx);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '38px Arial';
        this.ctx.fillText(this.score, (screenWidth-resultSprite.x) - 150, resultSprite.y + 85);
        this.ctx.save();

        this.rankImg = Sprite.getImage('result_rank');
        this.rankSprite = new Sprite(this.rankImg, (screenWidth - this.rankImg.width / 2) / 2, resultSprite.y + resultSprite.height + 20,
            this.rankImg.width / 2, this.rankImg.height / 2);
        this.rankSprite.draw(this.ctx);

        this.bindEvent();
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
                if (x >= 40 && x <= 90 && y >= 560 && y <= 610) {// 返回按钮
                    _this.ranking = false;
                }
            });
            return;
        }
        wx.onTouchStart((e) => {
            let x = e.touches[0].clientX,
                y = e.touches[0].clientY;
            if (x >= _this.rankSprite.x
                && x <= _this.rankSprite.x + _this.rankSprite.width
                && y >= _this.rankSprite.y
                && y <= _this.rankSprite.y + _this.rankSprite.height) {
                // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
                _this.messageSharecanvas();
                wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
            }
        });
    }
    saveUserCloadStorage() {
        console.log('setUserCloudStorage');
        let score = '' + this.score;
        wx.setUserCloudStorage({
            KVDataList: [{ 'key': 'score', 'value': score }],
            success: res => {
                console.log(res);
                // 让子域更新当前用户的最高分，因为主域无法得到getUserCloadStorage;
                let openDataContext = wx.getOpenDataContext();
                openDataContext.postMessage({
                    type: 'updateMaxScore',
                });
            },
            fail: res => {
                console.log(res);
            }
        });
    }
}