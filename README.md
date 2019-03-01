# 重力感应小游戏-通过重力感应集中目标打怪兽

页面地址：[https://zengzoe.github.io/pacificRim/dist/
](https://zengzoe.github.io/pacificRim/dist/)

![](https://github.com/ZENGzoe/pacificRim/blob/master/qrcode.png)
 
## 实现技术：

Phaser.js

## 总结

### 1.陀螺仪处理
**问题：** 陀螺仪数据直接加到光标的位移上，由于陀螺仪数据敏感，导致光标出现抖动现象。

**解决：** 光标中的beta、gamma的和作为光标的速度，偏移方向为光标的运动速度。
```
var speed = 15 * (Math.abs(betaDirection) + Math.abs(gammaDirection));    //速度
game.physics.arcade.moveToXY(光标，临界点x，临界点y，速度);        //偏移
```

临界点：光标移动的临界位置。（最左上、最右上、最左下、最右下）。


### 2.陀螺仪角度计算
![陀螺仪角度](http://img11.360buyimg.com/cms/jfs/t19552/86/964632687/55559/c7dbcdc0/5ab4a859Nb5586d60.jpg)

**中心点：**
beta：45
gamma：0
手机为改中心点，光标速度为0；

```
//beta以45度为中间点，小于45度范围值为-45～0，大于45度范围值为0～45。
// gamama以0度为中心点，范围值为-45～45。

this.betaDirection = beta > 90 ? 45 : (beta >= 45 && beta <= 90) ? (beta - 45) : (beta > 0 && beta < 45) ? (beta - 45) : -45;   
this.gammaDirection = gamma > 45 ? 45 : gamma < -45 ? -45 : gamma;
```

### 3.临界点
**问题：** 当光标靠近临界点时，会有抖动的情况发生。

**解决：** 当光标靠近临界点，强制光标速度设为0，位置定位为临界点。

### 4.音乐处理
（1）使用audio标签（据测试统计，audio标签bug较少）

（2）离开H5时，如APP退到后台，音乐一定要暂停播放，再回到页面时，音乐保持离开前的状态
```
document.addEventListener("visibilitychange", function(){
    if(document.hidden){
         //暂停音乐
    }else{
        //播放音乐
    }
});
```

### 4.防止休眠

库：[noSleep](https://github.com/richtr/NoSleep.js)

问题：在uc浏览器会弹出视频，在ios9.3.1~ios9.3.5会一直刷新页面，跳转出去再回来会发生错误

解决：直接出现问题的设备或浏览器中，直接取消防止休眠功能。

```
var noSleep = new NoSleep();
    noSleep.enable();   //在点击事件中enable
```
