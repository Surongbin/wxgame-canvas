function drawAvatar() {
  if (authed) { // wx.getSetting
    draw(userInfo)
  } else if (!authed || reject) {
    draw(blankInfo)
  }
}

function drawStartButton() {
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
