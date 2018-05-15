import questionList from '../data/questions.js'
import {drawText} from '../utils/index.js';
import Background from '../runtime/background';
import Sprite from '../base/Sprite';
import DataStore from "../base/DataStore";
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const CHOICE_WIDTH = 144;
const CHOICE_HEIGHT = 44;

// 创建问题canvas, 离屏canvas
export default class QuestionPage{
    constructor(ctx, question, index) {
        this.background = new Background(ctx);
        this.question = question;
        this.index = index;
        this.ctx = ctx;
        this.selected = false;
        this.init(this.question);
        this.drawProgress();
        this.drawPic();
        this.drawTitle();
        this.drawChoice();
        this.addTouch();
    }
    init(data) {
        this.img = data.pic;
        this.title = data.title;
        this.choices = data.choices;
        this.answer = data.answer;
    }
    drawProgress () {
        let barImg = Sprite.getImage('progress_bar');
        let bar = new Sprite(barImg, (screenWidth - barImg.width/2)/2, 10, barImg.width/2, barImg.height/2);
        bar.draw(this.ctx);
        let percent = (this.index+1)/10;
        // this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = '#fed443';
        this.ctx.fillRect(bar.x+2, bar.y+41, (bar.width-4)*percent, 8);
        this.bar = bar;
    }
    drawPic() {
        let _this = this;
        let bgImg = Sprite.getImage('question_bg');
        let bg = new Sprite(bgImg, (screenWidth - bgImg.width/2)/2, 10 + this.bar.height + 10, bgImg.width/2, bgImg.height/2);
        bg.draw(this.ctx);
        this.bg = bg;
        let pic = new Image();
        pic.src = this.img;
        pic.onload = () => {
            _this.centerImg(pic, bg.x + 10, bg.y + 10, bg.width-20, bg.height-20);
            _this.reDrawCanvas();
        }
    }
    drawTitle () {
        drawText(this.title, this.bg.x, this.bg.y+this.bg.height+10, screenWidth-2*this.bg.x, this.ctx);
    }
    // 图片居中
    centerImg(pic,x,y,limitW,limitH,ctx) {
        let drawWidth = pic.width/2;
        let drawHeight = pic.height/2;
        if(drawWidth/drawHeight>1){
            drawHeight = limitW * (drawHeight / drawWidth);
            drawWidth = limitW;
            y = y + (limitH - drawHeight) / 2;
        } else {
            drawWidth = limitH * (drawWidth / drawHeight);
            drawHeight = limitH;
            x = x + (limitW - drawWidth) / 2;
        }

        this.ctx.drawImage(pic,x,y,drawWidth,drawHeight);
    }
    drawChoiceItem (index, bgsrc, callback) {
        this.ctx.globalCompositeOperation = 'source-over';
        let chart = ['A', 'B', 'C', 'D'];
        let choiceBgImg = Sprite.getImage(bgsrc);

        let x = index%2 === 0 ? this.bg.x : ((screenWidth-CHOICE_WIDTH)-20);
        let y = index < 2 ? 450 : (470 + CHOICE_HEIGHT);
        let choiceSprite = new Sprite(choiceBgImg, x , y, CHOICE_WIDTH, CHOICE_HEIGHT);
        choiceSprite.draw(this.ctx);
        this.drawCircle(this.ctx, x + 20, y + 25, chart[index]);
        this.ctx.fillStyle = '#654e01';
        this.ctx.fillText(this.choices[index], x + 40, y + 25);

        if (bgsrc != 'select_bg') {
            callback && callback();
            return;
        }
        // 选项的选择区域
        if (!this.selectArea) {
            this.selectArea = {
                x: this.bg.x,
                y: 450,
                endX: screenWidth - this.bg.x,
                endY: 470 + choiceSprite.height*2,
                width: choiceSprite.width,
                height: choiceSprite.height
            }
        }
        if (index === 1) { // 记B选项的X坐标
            this.selectArea.rightX = (screenWidth-choiceSprite.width)-20;
        }
        if (index === 2) { // 记C选项的Y坐标
            this.selectArea.bottomY = 470 + choiceSprite.height;
        }
    }
    drawChoice(ctx) {
        this.ctx.font = '12px Arial';
        for (let i = 0; i < 4; i++) {
            this.drawChoiceItem(i, 'select_bg');
        }
    }
    drawCircle(ctx,x,y,text,isGray){
        // ctx.fillStyle = !isGray?"#ecb020":"#bcb7a7";
        ctx.fillStyle = '#ecb020';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#654e01";
        ctx.font = '12px Arial';
        ctx.strokeText(text, x-4, y);
    }
    // 判断答案是否正确
    judgeAnswer (x, y) {
        let index;
        let time = 1000;
        if (x <= this.selectArea.x + this.selectArea.width) { // a  c  无
            index = y < (this.selectArea.y + this.selectArea.height) ? 0 : 2;
        } else if (x > this.selectArea.rightX) { // b  d
            index = y < (this.selectArea.y + this.selectArea.height) ? 1 : 3;
        } else {
            this.selected = false;
            return;
        }

        if (index === this.answer) {
            DataStore.getInstance().score += 10;
            this.drawChoiceItem(index, 'select_right',this.reDrawCanvas);
        } else {
            this.drawChoiceItem(index, 'select_error',this.reDrawCanvas);
            time += 800;
            setTimeout(() => {
                this.drawChoiceItem(this.answer, 'right_choice',this.reDrawCanvas);
            }, 800);
        }

        setTimeout(() => {
            DataStore.getInstance().director.nextQuestionScene();
        }, time);


    }
    // 重新绘制canvas 到主屏上
    reDrawCanvas() {
        DataStore.getInstance().ctx.drawImage(DataStore.getInstance().offScreenCanvas, 0, 0, screenWidth, screenHeight);
    }
    addTouch(){
        let _this = this;
        // DataStore.getInstance().offScreenCanvas.removeEventListener('touchstart');
        wx.offTouchStart();
        wx.onTouchStart((e)=>{
            if (!this.selected
                && e.touches[0].clientX >= _this.selectArea.x
                && e.touches[0].clientX <= _this.selectArea.endX
                && e.touches[0].clientY >= _this.selectArea.y
                && e.touches[0].clientY <= _this.selectArea.endY){
                this.selected = true;
                // console.log('select');
                _this.judgeAnswer(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
    }
}