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
const ratio = 750 / screenWidth;//wx.getSystemInfoSync().pixelRatio;
const scale = 750 / screenWidth;

export default class ResultScene {
    constructor (ctx) {
        this.ctx = ctx;
        this.score = DataStore.getInstance().score;
        this.saveUserCloadStorage();
        this.loop();
    }
    loop() {
        this.background = new Background(this.ctx, scale);
        this.drawEle();
        // if (DataStore.getInstance().shareTicket && !this.showGroup){
        //     this.showGroup = true;
        //     this.messageSharecanvas('group', DataStore.getInstance().shareTicket);
        // }
        if (this.ranking) {
            // 子域canvas 放大绘制，这里必须限制子域画到上屏的宽高是screenWidth， screenHeight
            this.background = new Background(this.ctx, scale);
            this.drawEle();
            DataStore.getInstance().ctx.drawImage(DataStore.getInstance().resultCanvas, 0, 0, screenWidth, screenHeight);
            DataStore.getInstance().ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0, screenWidth, screenHeight);
        } else {
            DataStore.getInstance().ctx.drawImage(DataStore.getInstance().resultCanvas, 0, 0, screenWidth, screenHeight);
        }
        this.requestId = requestAnimationFrame(this.loop.bind(this));

    }
    drawEle () {
        let titleImg = Sprite.getImage('title');
        let imgSprite = new Sprite(titleImg, (750-titleImg.width)/2, 40, titleImg.width, titleImg.height);
        imgSprite.draw(this.ctx);

        let resultImg = Sprite.getImage('result_bg');
        let resultSprite = new Sprite(resultImg, (750-resultImg.width)/2, imgSprite.height+60, resultImg.width, resultImg.height);
        resultSprite.draw(this.ctx);

        this.ctx.fillStyle = '#1b282c';
        this.ctx.font = '30px Arial';
        // console.log(DataStore.getInstance().userInfo);
        //DataStore.getInstance().userInfo.nickName 主域获取用户信息需要用户点击按钮，不获取了
        this.ctx.fillText('你的分数', resultSprite.x + 100, resultSprite.y + 190);
        this.ctx.fillText('分', (750-resultSprite.x) - 120, resultSprite.y + 190);
        this.ctx.save();
        this.ctx.font = '24px Arial';
        drawText(remarks[this.score], resultSprite.x + 100, resultSprite.y + 240,resultSprite.width-200 ,this.ctx, ratio);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '76px Arial';
        this.ctx.fillText(this.score, (750-resultSprite.x) - 300, resultSprite.y + 170);
        this.ctx.save();

        this.rankImg = Sprite.getImage('result_rank');
        this.rankSprite = new Sprite(this.rankImg, (750 - this.rankImg.width) / 2, resultSprite.y + resultSprite.height + 40,
            this.rankImg.width, this.rankImg.height);
        this.rankSprite.draw(this.ctx);

        this.reportImg = Sprite.getImage('report_btn');
        this.reportSprite = new Sprite(this.reportImg, (750 - this.reportImg.width) / 2, this.rankSprite.y + this.rankSprite.height + 40,
            this.reportImg.width, this.reportImg.height);
        this.reportSprite.draw(this.ctx);

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
                let scale = screenWidth/750;
                if (x >= 80*scale && x <= 180*scale && y >= 1120*scale && y <= 1220*scale) {// 返回按钮
                    _this.ranking = false;
                    setTimeout(()=>{
                        cancelAnimationFrame(_this.requestId);
                    }, 20);
                }
            });
            return;
        }
        wx.onTouchStart((e) => {
            let x = e.touches[0].clientX*ratio,
                y = e.touches[0].clientY*ratio;
            if (x >= _this.rankSprite.x
                && x <= _this.rankSprite.x + _this.rankSprite.width
                && y >= _this.rankSprite.y
                && y <= _this.rankSprite.y + _this.rankSprite.height) {
                // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
                _this.messageSharecanvas();
                _this.loop();
                wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
            } else if (x >= _this.reportSprite.x
                && x <= _this.reportSprite.x + _this.reportSprite.width
                && y >= _this.reportSprite.y
                && y <= _this.reportSprite.y + _this.reportSprite.height) {
                // 导出成绩单
                _this.report();
            }
        });
    }
    report () {
        let _this = this;
        let reportCanvas = wx.createCanvas();
        let reportCtx = reportCanvas.getContext('2d');
        reportCanvas.width = screenWidth * ratio;
        reportCanvas.height = screenHeight * ratio;
        reportCtx.scale(ratio, ratio);
        reportCtx.scale(screenWidth / 750, screenWidth / 750);
        new Background(reportCtx, scale);

        let titleImg = Sprite.getImage('title');
        let imgSprite = new Sprite(titleImg, (750-titleImg.width)/2, 40, titleImg.width, titleImg.height);
        imgSprite.draw(reportCtx);

        let resultImg = Sprite.getImage('result_bg');
        let resultSprite = new Sprite(resultImg, (750-resultImg.width)/2, imgSprite.height+60, resultImg.width, resultImg.height);
        resultSprite.draw(reportCtx);

        reportCtx.fillStyle = '#1b282c';
        reportCtx.font = '30px Arial';
        //DataStore.getInstance().userInfo.nickName 主域获取用户信息需要用户点击按钮，不获取了
        reportCtx.fillText('你的分数', resultSprite.x + 100, resultSprite.y + 190);
        reportCtx.fillText('分', (750-resultSprite.x) - 120, resultSprite.y + 190);
        reportCtx.save();
        reportCtx.font = '24px Arial';
        drawText(remarks[this.score], resultSprite.x + 100, resultSprite.y + 240,resultSprite.width-200 ,this.ctx, ratio);

        reportCtx.fillStyle = '#fff';
        reportCtx.font = '76px Arial';
        reportCtx.fillText(this.score, (750-resultSprite.x) - 300, resultSprite.y + 170);
        reportCtx.save();

        let tipImg = Sprite.getImage('report_tip');
        let tipSprit = new Sprite(tipImg, (750-tipImg.width)/2, resultSprite.y+resultSprite.height+40, tipImg.width, tipImg.height);
        tipSprit.draw(reportCtx);

        // DataStore.getInstance().ctx.clearRect(0, 0, screenWidth * ratio, screenHeight*ratio);
        // DataStore.getInstance().ctx.drawImage(reportCanvas, 0, 0, screenWidth, screenHeight);
        // return;
        // wx.saveImageToPhotosAlbum,
        reportCanvas.toTempFilePath({
            x: 0,
            y: 0,
            width: screenWidth * ratio,
            height: screenHeight * ratio,
            destWidth: screenWidth * ratio,
            destHeight: screenHeight * ratio,
            success: (response) => {
                // wx.shareAppMessage({
                //     imageUrl: res.tempFilePath
                // });
                wx.getSetting({
                    success: res => {
                        let authSetting = res.authSetting;
                        if (authSetting['scope.writePhotosAlbum'] === false) {
                            wx.showModal({
                                title: '提示',
                                content: '您拒绝了保存到相册到权限，请手动到设置页面打开授权开关',
                                showCancel: false,
                                confirmText: '知道了',
                                success: res => {
                                }
                            });
                        } else {
                            wx.saveImageToPhotosAlbum({
                                filePath: response.tempFilePath,
                                success: res => {
                                    console.log(res);
                                },
                                fail: res => {
                                    console.log(res.errMsg);
                                    if (res.errMsg.indexOf('deny')) {

                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    saveUserCloadStorage() {
        let score = '' + this.score;
        wx.setUserCloudStorage({
            KVDataList: [{ key: 'score', value: score }],
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