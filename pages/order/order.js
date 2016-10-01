// order.js

Page({
  data:{
    matrix: 4,
    bord: null,
    score: 0,
    best: 0,
    startPoint: {},
    movePoint: {},
    startTiles: 2,
    animationData: {},
    gameMessage: true,
    gameWon: true,
    keepGoing: false,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.newGame();
    wx.getStorage({
      key: 'best',
      success: res => {
        this.setData({
          best: res.data || 0
        });
      } 
    })
  },
  onReady:function(){
    // 页面渲染完成
    console.log("I am ready.");
  },
  onShow:function(){
    // 页面显示
    console.log("I am showing");
  },
  onHide:function(){
    // 页面隐藏
    console.log("I am hiding!");
  },
  onUnload:function(){
    // 页面关闭
    console.log("I am unload!");
  },
  newGame:function() {
    let matrix = this.data.matrix;
    let newBord = new Array(matrix);
    for (let i = 0; i < newBord.length; i++) {
        newBord[i] = new Array(matrix);
        newBord[i].fill(0);
    }

    this.setData({
      bord: newBord,
      keepGoing: false,
      score: 0
    });

    for (let i = 0; i < this.data.startTiles; i++) {
      this.createRandomTile();
    }
  },
  touchstart: function(event) {
    this.setData({
      startPoint: event.touches[0]                        
    });
  },
  touchmove: function(event) {
    this.setData({
      movePoint: event.touches[0]
    });
  },
  touchend: function(event) {
    let vectorX = this.data.movePoint.clientX - this.data.startPoint.clientX;
    let vectorY = this.data.movePoint.clientY - this.data.startPoint.clientY;
    let vectorZ = Math.sqrt(vectorX*vectorX + vectorY*vectorY);
    
    if (!vectorZ || vectorZ < 50) {
      return
    }
    
    if (Math.abs(vectorX) > Math.abs(vectorY)) {
      if (vectorX > 0) {
        this.move("right")
      } else {
        this.move("left");
      }
    } else {
      if (vectorY > 0) {
        this.move("down");
      } else {
        this.move("up");
      }
    }
  },
  move: function(move) {
    let bord = this.data.bord;
    takeMove = {
      "right": this.moveRight,
      "left": this.moveLeft,
      "down": this.moveDown,
      "up": this.moveUp,
    }
    let ret = takeMove[move](bord);
    if (ret.score > this.data.best) {
      wx.setStorage({
        key: "best",
        data: ret.score
      });
      ret.best = ret.score;
    }

    this.setData(ret);
    this.createRandomTile();
  },
  createRandomTile: function() {
    let bord = this.data.bord;
    let emptyTile = this.getEmptyCell();
    
    randomTile = emptyTile[Math.floor(Math.random()*emptyTile.length)];
    bord[randomTile.x][randomTile.y] = Math.random() > 0.1 ? 2 : 4;

    this.setData({
      bord: bord,
    });
  },
  getEmptyCell: function() {
    let bord = this.data.bord;
    let emptyTile = [];

    for (let i = 0; i < bord.length; i++) {
      for (let j = 0; j < bord[i].length; j++) {
        if (bord[i][j] == 0) {
          emptyTile.push({x: i, y: j});
        }
      }
    }
    if (emptyTile.length < 1) {
      this.setData({
        gameMessage: false
      });
    }
    return emptyTile;
  },
  moveRight: function(bord) {
    let score = this.data.score;
    for (let i = 0; i < bord.length; i++) {
      for (let j = bord[i].length-1; j >= 0; j--) {
        for (let k = j-1; k >= 0; k--) {
          if (bord[i][k]) {
            if (bord[i][j]) {
              if (bord[i][j] === bord[i][k]) {
                bord[i][j] *= 2;
                bord[i][k] = 0; 
                this.isWin(bord[i][j]);
                score += bord[i][j];
              } 
              else {
                if (k !== (j-1)) {
                  bord[i][j-1] = bord[i][k];
                  bord[i][k] = 0;
                  j--;
                }
              }
              break;
            } else {
              bord[i][j] = bord[i][k];
              bord[i][k] = 0;
            }
          }
        }
      }
    }
    return { bord: bord, score: score };
  },
  moveLeft: function(bord) {
    let score = this.data.score;
    for (let i = 0; i < bord.length; i++) {
      for (let j = 0; j < bord[i].length; j++) {
        for (let k = j+1; k < bord[i].length; k++) {
          if (bord[i][k]) {
            if (bord[i][j]) {
              if (bord[i][j] === bord[i][k]) {
                bord[i][j] *= 2;
                bord[i][k] = 0; 
                this.isWin(bord[i][j]);
                score += bord[i][j];
              } 
              break;
            } else {
              bord[i][j] = bord[i][k];
              bord[i][k] = 0;
            }
          }
        }
      }
    }
    return { bord: bord, score: score };
  },
  moveUp: function(bord) {
    bord = this.transpose(bord);
    let ret = this.moveLeft(bord);
    ret.bord = this.transpose(ret.bord);
    return ret;
  },
  moveDown: function(bord) {
    bord = this.transpose(bord);
    let ret = this.moveRight(bord);
    ret.bord = this.transpose(ret.bord);
    return ret;
  },
  transpose: function (bord) {
    let matrix = bord.length;
    let tempBord = new Array(matrix);
    for (let i = 0; i < tempBord.length; i++) {
        tempBord[i] = new Array(matrix);
        tempBord[i].fill(0);
    }

    for (let i = 0; i < bord.length; i++) {
      for (let j = 0; j < bord[i].length; j++) {
        tempBord[j][i] = bord[i][j];
      }
    }

    return tempBord;
  },
  tryAgain: function() {
    this.setData({
      gameMessage: true,
    });
    this.newGame();
  },
  cancel: function() {
    this.setData({
      gameMessage: true
    });
  },
  isWin: function(value) {
    if (value === 2048 && !this.data.keepGoing) {
      this.setData({
        gameWon: true
      });
    }
  },
  keepGoing: function() {
    this.setData({
      keepGoing: true,
      gameWon: false
    });
  },
  testAnimat: function () {
    // let animation = wx.createAnimation({ 
    //   duration: 2000,
    //   timingFunction: 'ease',
    //   delay: 1000,
    // });
    // animation.scale(0.5).step();
    // animation.translate(30).step();
    // animation.scale(2).step();
    // animation.translate(-30).step();
    // animation.scale(1).step();
    
    // this.setData({
    //   animationData: animation.export()
    // });
    this.setData({
      gameMessage: false
    });
  }
})