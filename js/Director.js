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
        // 预加载问题图片，减少空白时间
        Question.getInstance();
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
        // 按照 750设计稿绘制
        questionCtx.scale(ratio, ratio);
        let scales = screenWidth / 750;
        questionCtx.scale(scales, scales);

        DataStore.getInstance().offScreenCanvas = this.offScreenCanvas;
        ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
        this.questionScene = new QuestionScene(questionCtx, Question.getInstance().currentList[this.currentIndex], this.currentIndex);

        ctx.drawImage(this.offScreenCanvas, 0, 0, screenWidth, screenHeight);
        DataStore.getInstance().currentCanvas = 'questionCanvas';
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
        this.resultCanvas = wx.createCanvas();
        let resultCtx = this.resultCanvas.getContext('2d');
        this.resultCanvas.width = screenWidth * ratio;
        this.resultCanvas.height = screenHeight * ratio;
        let scales = screenWidth / 750;
        resultCtx.scale(ratio, ratio);

        resultCtx.scale(scales, scales);

        DataStore.getInstance().resultCanvas = this.resultCanvas;
        new ResultScene(resultCtx);

        // new ResultScene(DataStore.getInstance().ctx);
        DataStore.getInstance().currentCanvas = 'resultCanvas';
    }
}
