import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './main'
import DataStore from "./js/base/DataStore";

new Main();

wx.onShow(res => {
    DataStore.getInstance().shareTicket = res.shareTicket;
});