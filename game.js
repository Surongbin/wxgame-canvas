import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './main'
import DataStore from "./js/base/DataStore";

new Main();

wx.getSetting({
  success(res) {
    console.log(`getSetting success res: `, res)
    // console.log(`to authorize`)
    // wx.authorize({
    //   scope: 'scope.userInfo',
    //   success(res) {
    //     console.log(`authorize success res:`, res)
    //   },
    //   fail(res){
    //     console.log(`authorize fail res: `, res)
    //   }
    // })
  }
})

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
