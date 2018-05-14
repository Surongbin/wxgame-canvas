import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Main from './main'
import DataStore from "./js/base/DataStore";

new Main();

wx.onShow(res => {
    DataStore.getInstance().shareTicket = res.shareTicket;
    // DataStore.getInstance().shareTicket = '1b8d8fb8-43aa-4bd5-8b72-df71c6046200';
    console.log(DataStore.getInstance().shareTicket);
});