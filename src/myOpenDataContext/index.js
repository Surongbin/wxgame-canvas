let sharedCanvas = wx.getSharedCanvas();
let context = sharedCanvas.getContext('2d');

const screenWidth = wx.getSystemInfoSync().screenWidth;
const screenHeight = wx.getSystemInfoSync().screenHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;

// sharedCanvas.width = screenWidth * ratio;
// sharedCanvas.height = screenHeight * ratio;
let itemCanvas = wx.createCanvas();
let ctx = itemCanvas.getContext('2d');

let myScore = undefined;
let myInfo = {};
let myRank = undefined;
initEle();
getUserInfo();

// 初始化标题返回按钮等元素
function initEle() {
    context.restore();
    context.scale(ratio, ratio);
    context.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);

    // 画背景
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, screenWidth * ratio, screenHeight * ratio);

    // 按照 750的尺寸绘制
    let scales = screenWidth / 750;
    context.scale(scales, scales);

    // 画标题
    context.fillStyle = '#fff';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('好友排行榜', 750 / 2, 220);

    // 排名列表外框
    context.fillStyle = '#302F30';
    context.fillRect(80, 290, 750 - 80 * 2, 650);

    // 排行榜提示
    context.fillStyle = '#8D8D8D';
    context.font = '20px Arial';
    context.textAlign = 'left';
    context.fillText('每周一凌晨刷新', 100, 330);

    // 自己排名外框
    context.fillStyle = '#302F30';
    context.fillRect(80, 960, 750 - 80 * 2, 120);

    // 返回按钮
    let returnImage = wx.createImage();
    returnImage.src = 'images/return.png';
    returnImage.onload = () => {
        context.drawImage(returnImage, 80, 1120, 100, 100);
    };
}

function initRanklist (list) {
    // 至少绘制6个
    let length = Math.max(list.length, 6);
    let itemHeight = 590/6;

    // itemCanvas.width = screenWidth - 40 * 2;
    // itemCanvas.height = itemHeight * length;
    itemCanvas.width = (750 - 80 * 2);
    itemCanvas.height = itemHeight * length;

    ctx.clearRect(0, 0, itemCanvas.width, itemCanvas.height);

    for (let i = 0; i < length; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = '#393739';
        } else {
            ctx.fillStyle = '#302F30';
        }
        console.log(itemCanvas.width);
        ctx.fillRect(0, i * itemHeight, itemCanvas.width, itemHeight);
    }

    if (list && list.length >0) {
        list.map((item, index) => {
            let avatar = wx.createImage();
            avatar.src = item.avatarUrl;
            avatar.onload = function() {
                ctx.drawImage(avatar, 100, index*itemHeight + 14, 70, 70);
                reDrawItem(0);
            }
            ctx.fillStyle = '#fff';
            ctx.font = '28px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.nickname, 190, index * itemHeight + 54);
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(item.score || 0, 550, index * itemHeight + 60);
            ctx.font = 'italic 44px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(index + 1, 46, index * itemHeight + 64)
        });
    } else {
        // 没有数据
    }

   reDrawItem(0);
}

// 绘制自己的排名
function drawMyRank () {
    if (myInfo.avatarUrl && myScore) {
        let avatar = wx.createImage();
        avatar.src = myInfo.avatarUrl;
        avatar.onload = function() {
            context.drawImage(avatar, 180, 960 + 24, 70, 70);
        }
        context.fillStyle = '#fff';
        context.font = '28px Arial';
        context.textAlign = 'left';
        context.fillText(myInfo.nickName, 270, 960 + 72);
        context.font = 'bold 36px Arial';
        context.textAlign = 'right';
        context.fillText(myScore || 0, 630, 960 + 76);
        // 自己的名次
        if (myRank !== undefined) {
            context.font = 'italic 44px Arial';
            context.textAlign = 'center';
            context.fillText(myRank + 1, 126, 960 + 80);
        }
    }
    // context.fillRect(40, 480, screenWidth - 40 * 2, 60);
}
// 因为头像绘制异步的问题，需要重新绘制
function reDrawItem(y) {
    context.clearRect(80, 350, 750 - 80 * 2, 590);
    context.fillStyle = '#302F30';
    context.fillRect(80, 350, 750 - 80 * 2, 590);
    context.drawImage(itemCanvas, 0, y, 750 - 80 * 2, 590, 80, 350, 750 - 80 * 2, 590);
    //
    // context.drawImage(itemCanvas, 40, y+175, screenWidth - 40 * 2, 295);
}
function sortByScore (data) {
    let array = [];
    data.map(item => {

        array.push({
            avatarUrl: item.avatarUrl,
            nickname: item.nickname,
            openid: item.openid,
            score: item['KVDataList'][1] && item['KVDataList'][1].value!='undefined' ? item['KVDataList'][1].value : (item['KVDataList'][0]?item['KVDataList'][0].value:0) // 取最高分
        })

    })
    array.sort((a, b) => {
        return a['score'] < b['score'];
    });
    myRank = array.findIndex((item) => {
       return item.nickname === myInfo.nickName && item.avatarUrl === myInfo.avatarUrl;
    });
    if (myRank === -1)
        myRank = array.length;

    return array;
}
// 开放域的getUserInfo 不能获取到openId, 可以在主域获取，并从主域传送
function getUserInfo() {
    wx.getUserInfo({
        openIdList:['selfOpenId'],
        lang: 'zh_CN',
        success: res => {
            myInfo = res.data[0];
        },
        fail: res => {

        }
    })
}

// 获取自己的分数
function getMyScore () {
    wx.getUserCloudStorage({
        keyList: ['score', 'maxScore'],
        success: res => {
            let data = res;
            console.log(data);
            let lastScore = data.KVDataList[0].value || 0;
            if (!data.KVDataList[1]){
                saveMaxScore(lastScore);
                myScore = lastScore;
            } else if (lastScore > data.KVDataList[1].value) {
                saveMaxScore(lastScore);
                myScore = lastScore;
            } else {
                myScore = data.KVDataList[1].value;
            }
        }
    });
}

function saveMaxScore(maxScore) {
    wx.setUserCloudStorage({
        KVDataList: [{ 'key': 'maxScore', 'value': (''+maxScore) }],
        success: res => {
            console.log(res);
        },
        fail: res => {
            console.log(res);
        }
    });
}

function getFriendsRanking () {
  wx.getFriendCloudStorage({
    keyList: ['score', 'maxScore'],
    success: res => {
        let data = res.data;
        console.log(res.data);
        // drawRankList(data);
        initRanklist(sortByScore(data));
        drawMyRank();
    }
  });
}

function getGroupRanking (ticket) {
    wx.getGroupCloudStorage({
        shareTicket: ticket,
        keyList: ['score', 'maxScore'],
        success: res => {
            console.log('getGroupCloudStorage:success');
            console.log(res.data);
            let data = res.data;
            initRanklist(sortByScore(data));
            drawMyRank();
        },
        fail: res => {
            console.log('getGroupCloudStorage:fail');
            console.log(res.data);
        }
    });
}
// getGroupRanking();
wx.onMessage(data => {
    if (data.type === 'friends') {
        // sharedCanvas.height = screenHeight;
        getFriendsRanking();
        getMyScore();
    } else if (data.type === 'group') {
        getGroupRanking(data.text);
        getMyScore();
    } else if (data.type === 'updateMaxScore') {
        // 更新最高分
        console.log('更新最高分');
        getMyScore();
    }
});

let startY = undefined, moveY = 0;
// 触摸移动事件
wx.onTouchMove(e => {
    let touch = e.touches[0];
    // 触摸移动第一次触发的位置
    if (startY === undefined) {
        startY = touch.clientY + moveY;
    }
    moveY = startY - touch.clientY;
    reDrawItem(moveY);
});
wx.onTouchEnd(e => {
    startY = undefined;
    if (moveY < 0) { // 到顶
        moveY = 0;
    } else if (moveY > itemCanvas.height - 590) { // 到底
        moveY = itemCanvas.height - 590;
    }
    reDrawItem(moveY);
});