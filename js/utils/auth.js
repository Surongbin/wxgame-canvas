/**
 * Created by cooky on 2018/5/14.
 */
import DataStore from '../base/DataStore.js';

export const checkSession = () => {
  wx.checkSession({
    success: res => {
        console.log('success:'+res);
    },
    fail: res => {
        console.log('fail:'+res);
        login((userInfo) => {
          
        });
    }
  })
}

export const login = (success, fail) => {
    wx.login({
        success: function () {
            wx.getUserInfo({
                success: (res) => {
                  success && success(res.userInfo);
                    console.log(res.userInfo);
                },
                fail: (res) => {
                    console.log(res);
                    fail && fail();
                    // wx.authorize({
                    //     scope: 'scope.userInfo'
                    // })
                }
            });
        }
    });
};
// wx.getUserInfo调整之后需要用户按钮点击获取用户信息，不能再直接登陆授权获取用户信息了。
export const getAuthSettings = () => {
    wx.getSetting({
        success: res => {
            let authSetting = res.authSetting;
            if (authSetting['scope.userInfo'] === true) {
                // 用户已授权，可以直接调用相关 API
                wx.getUserInfo({
                    withCredentials: true,
                    success: (res) => {
                      DataStore.getInstance().userInfo = res;
                      console.log(DataStore.getInstance().userInfo);
                    },
                });
            } else if (authSetting['scope.userInfo'] === false){
                // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
                console.log('到设置页面打开授权开关');
                wx.showModal({
                  title: '提示',
                  content: '请到设置页面打开授权开关',
                  showCancel: false,
                  confirmText: '知道了',
                  success: res => {
                  }
                });
            } else {
                // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
                wx.authorize({
                    scope: 'scope.userInfo',
                    success: res => {
                        _this.dataStore.userInfo = res.userInfo;
                        // console.log(_this.dataStore.userInfo);
                    },
                    fail: res => {
                        // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                        if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                            // 处理用户拒绝授权的情况
                        }
                    }
                })
            }
        }
    });
};

export const createUserInfoButton = () => {
      var button = wx.createUserInfoButton({
          type: 'text',
          text: '获取用户信息',
          style: {
              left: 10,
              top: 76,
              width: 200,
              height: 40,
              lineHeight: 40,
              backgroundColor: '#ff0000',
              color: '#ffffff',
              textAlign: 'center',
              fontSize: 16,
              borderRadius: 4
          }
      });
      button.show();
      button.onTap((res) => {
          DataStore.getInstance().userInfo = res;
      });
}
