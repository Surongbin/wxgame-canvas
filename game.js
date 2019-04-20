import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './main'
import DataStore from "./js/base/DataStore";

new Main();

// wx.openSetting({
//   success(res) {
//     console.log(res.authSetting)
//     // res.authSetting = {
//     //   "scope.userInfo": true,
//     //   "scope.userLocation": true
//     // }
//   }
// })

wx.onShow(res => {
  DataStore.getInstance().shareTicket = res.shareTicket;
});
