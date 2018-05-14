// 控制游戏逻辑
import HomeScene from './scene/homeScene';
import QuestionScene from './scene/questionScene';
import Question from './player/question';
import ResultScene from './scene/resultScene';
import DataStore from './base/DataStore';
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;
export default class Director {
    constructor (ctx) {
        this.currentIndex = 0;
        this.ctx = ctx; // 主屏的ctx
    }
    static getInstance () {
        if (!Director.instance) {
            Director.instance = new Director();
        }
        return Director.instance;
    }

    run(ctx) {
        this.showHomeScene(ctx);
        // if (DataStore.getInstance().shareTicket) {
        //     this.messageSharecanvas();
        //     DataStore.getInstance().ranking = true;
        // }
        // this.showResultScene();
    }
    // 首页场景
    showHomeScene (ctx) {
        this.homeScene = new HomeScene(ctx);
    }

    toQuestionScene () {
        let ctx = DataStore.getInstance().ctx;
        this.offScreenCanvas = wx.createCanvas();

        this.offScreenCanvas.width = screenWidth * ratio;
        this.offScreenCanvas.height = screenHeight * ratio;
        let questionCtx = this.offScreenCanvas.getContext('2d');
        questionCtx.scale(ratio, ratio);
        questionCtx.translate(0.5, 0.5);
        DataStore.getInstance().offScreenCanvas = this.offScreenCanvas;
        ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
        this.questionScene = new QuestionScene(ctx, Question.getInstance().currentList[this.currentIndex], this.currentIndex);

        // ctx.drawImage(this.offScreenCanvas, 0, 0);
    }
    // 问题场景
    nextQuestionScene () {
        if (this.currentIndex === 9) {
            this.showResultScene();
            return;
        }
        this.currentIndex++;
        if (this.offScreenCanvas) {
            this.offScreenCanvas = null;
        }
        this.toQuestionScene();
    }
    // 结果场景
    showResultScene () {
        // console.log('showResultScene');
        // this.resultCanvas = wx.createCanvas();
        // let resultCtx = this.resultCanvas.getContext('2d');
        new ResultScene(DataStore.getInstance().ctx);

        // setTimeout(() => {
        //     DataStore.getInstance().ctx.drawImage(this.resultCanvas, 0, 0, screenWidth, screenHeight);
        // }, 2000);
    }
}
