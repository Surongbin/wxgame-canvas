/**
 * Created by cooky on 2018/5/9.
 */
/**
 * Created by cooky on 2018/5/9.
 */
import Sprite from '../base/Sprite'

const screenWidth  = window.innerWidth;
const screenHeight = window.innerHeight;

// const BG_IMG_SRC   = 'images/bg.png';

export default class Logo extends Sprite {
    constructor (ctx,scale) {
        let logoImg = Sprite.getImage('logo');
        super(logoImg, 10*scale, -10*scale, logoImg.width / 2*scale, logoImg.height /2*scale);
        this.draw(ctx);
    }
}