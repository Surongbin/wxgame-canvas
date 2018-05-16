import ResourceLoader from "./js/base/ResourceLoader";
import Director from './js/Director';
import DataStore from './js/base/DataStore';
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;

export default class Main {
    constructor () {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        // 解决图片模糊问题
        canvas.width = screenWidth * ratio;
        canvas.height = screenHeight * ratio;
        this.ctx.scale(ratio,ratio);

        let openDataContext = wx.getOpenDataContext();
        let sharedCanvas = openDataContext.canvas;
        sharedCanvas.width = screenWidth * ratio;
        sharedCanvas.height = screenHeight * ratio;
        DataStore.getInstance().sharedCanvas = sharedCanvas;

        this.dataStore = DataStore.getInstance();
        this.director = Director.getInstance(this.ctx);
        const loader = ResourceLoader.create();
        loader.onLoaded(map => this.onResourceFirstLoaded(map));
        this.director = Director.getInstance();
    }
    // 资源首次加载完成，
    onResourceFirstLoaded (map) {
        // console.log('onResourceFirstLoaded');
        this.dataStore.canvas = this.canvas;
        this.dataStore.ctx = this.ctx;
        this.dataStore.res = map;
        this.dataStore.director = this.director;
        this.dataStore.score = 0;
        this.init();
    }

    init () {
        this.director.run(this.ctx);
        this.setShare();
    }
    setShare () {
        wx.showShareMenu({
            withShareTicket: true,
        });
        wx.onShareAppMessage(function () {
            // 用户点击了“转发”按钮
            return {
                title: '转发标题',
                imageUrl: 'https://mtshop1.meitudata.com/5ad58b143a94621047.jpg',
                query: 'key1=1&key2=2',
                success: (res) => {
                    // 问题页面因为没有设置loop 绘制，分享完成后会黑屏，需要重新绘制canvas
                    if (DataStore.getInstance().currentCanvas === 'questionCanvas') {
                        DataStore.getInstance().ctx.drawImage(DataStore.getInstance().offScreenCanvas, 0, 0, screenWidth, screenHeight);
                    }
                    if (res.shareTickets) {
                        let shareTicket = res.shareTickets[0];
                        DataStore.getInstance().shareTicket = shareTicket;
                    }
                },
                fail: (res) => {

                }
            }
        })
    }
}