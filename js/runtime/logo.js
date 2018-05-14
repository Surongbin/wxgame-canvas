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
    constructor (ctx) {
        let logoImg = Sprite.getImage('logo');;
        super(logoImg, 10, -10, logoImg.width / 2, logoImg.height /2);
        this.draw(ctx);
    }
}