/**
 * Created by cooky on 2018/5/9.
 */
import Sprite from '../base/Sprite'
import Logo from './logo'

const screenWidth  = window.innerWidth;
const screenHeight = window.innerHeight;

const BG_IMG_SRC   = 'images/bg.png';

export default class Background extends Sprite {
    constructor (ctx) {
        let bgImg = Sprite.getImage('background');
        super(bgImg, 0, 0, screenWidth, screenHeight);
        this.draw(ctx);
        this.logo = new Logo(ctx);
        this.logo.draw(ctx);
    }
}