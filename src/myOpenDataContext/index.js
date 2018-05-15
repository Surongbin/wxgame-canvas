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
    context.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
    context.scale(ratio, ratio);
    // 画背景
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, screenWidth * ratio, screenHeight * ratio);

    // 画标题
    context.fillStyle = '#fff';
    context.font = '25px Arial';
    context.textAlign = 'center';
    context.fillText('好友排行榜', screenWidth / 2, 110);

    // 排名列表外框
    context.fillStyle = '#302F30';
    context.fillRect(40, 145, screenWidth - 40 * 2, 325);

    // 排行榜提示
    context.fillStyle = '#8D8D8D';
    context.font = '10px Arial';
    context.textAlign = 'left';
    context.fillText('每周一凌晨刷新', 50, 165);

    // 自己排名外框
    context.fillStyle = '#302F30';
    context.fillRect(40, 480, screenWidth - 40 * 2, 60);

    // 返回按钮
    let returnImage = wx.createImage();
    returnImage.src = 'images/return.png';
    returnImage.onload = () => {
        context.drawImage(returnImage, 40, 560, 50, 50);
    };
}

function initRanklist (list) {
    // 至少绘制6个
    let length = Math.max(list.length, 6);
    let itemHeight = 295/6;

    // itemCanvas.width = screenWidth - 40 * 2;
    // itemCanvas.height = itemHeight * length;
    itemCanvas.width = (screenWidth - 40 * 2)*ratio;
    itemCanvas.height = (itemHeight * length)*ratio;
    ctx.scale(ratio, ratio);
    // ctx.translate(0.5, 0.5);

    ctx.clearRect(0, 0, itemCanvas.width, itemCanvas.height);

    for (let i = 0; i < length; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = '#393739';
        } else {
            ctx.fillStyle = '#302F30';
        }
        ctx.fillRect(0, i * itemHeight, itemCanvas.width, itemHeight);
    }

    if (list && list.length >0) {
        list.map((item, index) => {
            let avatar = wx.createImage();
            avatar.src = item.avatarUrl;
            avatar.onload = function() {
                ctx.drawImage(avatar, 50, index*itemHeight + 7, 35, 35);
                reDrawItem(0);
            }
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.nickname, 95, index * itemHeight + 27);
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(item.score || 0, 275, index * itemHeight + 30);
            ctx.font = 'italic 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(index + 1, 23, index * itemHeight + 32)
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
            context.drawImage(avatar, 90, 480 + 12, 35, 35);
        }
        context.fillStyle = '#fff';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(myInfo.nickName, 135, 480 + 36);
        context.font = 'bold 18px Arial';
        context.textAlign = 'right';
        context.fillText(myScore || 0, 315, 480 + 38);
        // 自己的名次
        if (myRank !== undefined) {
            context.font = 'italic 22px Arial';
            context.textAlign = 'center';
            context.fillText(myRank + 1, 63, 480 + 40);
        }

    }
    // context.fillRect(40, 480, screenWidth - 40 * 2, 60);
}
// 因为头像绘制异步的问题，需要重新绘制
function reDrawItem(y) {
    context.clearRect(40, 175, screenWidth - 40*2, 295);
    context.fillStyle = '#302F30';
    context.fillRect(40, 175, screenWidth - 40 * 2, 295);
    // 这里每次都绘制295都高，只显示6项
    // context.drawImage(itemCanvas, 0, y, screenWidth - 40 * 2, 295, 40, 175, screenWidth - 40 * 2, 295);
    //
    context.drawImage(itemCanvas, 40, y+175, screenWidth - 40 * 2, 295);
}
function sortByScore (data) {
    let array = [];
    data.map(item => {

        array.push({
            avatarUrl: item.avatarUrl,
            nickname: item.nickname,
            openid: item.openid,
            score: item['KVDataList'][1] ? item['KVDataList'][1].value : (item['KVDataList'][0]?item['KVDataList'][0].value:0) // 取最高分
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
                saveMaxScore(myScore);
                myScore = lastScore;
            } else if (myScore > data.KVDataList[1].value) {
                saveMaxScore(myScore);
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
    } else if (moveY > itemCanvas.height - 295) { // 到底
        moveY = itemCanvas.height - 295;
    }
    reDrawItem(moveY);
});