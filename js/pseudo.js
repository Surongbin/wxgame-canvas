function drawAvatarAndStart() {
  if (authed) { // wx.getSetting
    save(userInfo)
    draw(userInfo)
  } else if (!authed || reject) {
    draw(blankInfo)
  }
  draw(startButton)
}

function onClick() {
  if (authed) {
    startGame()
  } else if (!authed || reject) {
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
