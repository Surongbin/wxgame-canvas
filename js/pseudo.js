{
  onLoad()
  {
    if (authed) { // wx.getSetting
      save(userInfo)
      draw(userInfo)
    } else if (!authed) {
      draw(blankInfo)
    }
    draw(startButton)
  }

  onClick()
  {
    if (authed) {
      startGame()
    } else if (!authed) {
      popAuthWindow() // wx.createUserInfoButton
      if (agree) {
        save(userInfo)
        draw(userInfo)
        startGame()
      } else if (!agree) {
        // do nothing till agree
      }
    }
  }
}
