var NoSleep = require('./NoSleep');

var util = require('../lib/util');


const play = {
    init : function(){
        this.gameTimeCounter = 40;
        this.totalTime = 40;
        this.gameTimeStart = false;
        this.canMove = false;
        this.canGameMove = false;
        this.controlTargetTime = false;
        this.createTargetTimes = 1;
        this.monsterLife = 10;
        this.canDraw = false;
        this.hasGreenLaser = false;
        this.courseBoom = false;
        this.couseendFlag = false;
        this.deleteCourse = false;
        this.courseMove = false;
        // this.laserFlyout = false;
        

        this.showRule();
        this.checkFirst();
        this.audio = document.getElementById('jy_audio');
        
        this.goAhead();
        this.checkOut();
        this.checkEnv();
        this.targetPos = [ 
            { x : -170 , y : -10},   //左上2——3
            { x : -120 , y : 200},  //左下1——7
            { x : -75 , y : -110},  //左上1——1
            { x : 170 , y : -20},     //右上2——5
            { x : -250 , y : 120},    //左上3——6
            { x : 120 , y : 200},   //右下1——9
            { x : 0 , y : 50 },       //最中——4
            { x : 75 , y : -110},   //右上1——2
            { x : 250 , y : 120},   //右上3——10
            { x : 0 , y : 250}     //最下——9     
        ];
        
        CONF.custom.star = 0;


        if(window.DeviceOrientationEvent){
            window.addEventListener('deviceorientation', this.deviceorientationListener.bind(this))
        }else{
            alert('您的设备不支持Device Orientation');
        }

        this.centerX = customGame.world.centerX;
        this.centerY = customGame.world.centerY;

        // this.test();

        if(CONF.custom.restartMode){
            this.courseMove = true;
            this.deleteCourse = true;
            this.courseMove = true;
            this.hideTeamPage(0);
            this.monsterLife = 10;
            this.targetGroup && this.targetGroup.destroy();
            this.checkOut();
            this.createLaser();
            this.createHand();
            this.createShot();
            $('.jy_gif').hide();
        }
    },

    test : function(){
        this.hideTeamPage(0);
        this.canMove = true;
    },

    checkEnv : function(){
        var ua = window.navigator.userAgent.toLowerCase();
        var uc = ua.indexOf('ucbrowser') != -1;
        var wxApp = /MicroMessenger/i.test(ua);
        var inQQ = ua.indexOf('MQQBrowser') != -1;
        var ver = ua.match(/cpu iphone os (.*?) like mac os/);
        var isUnder9;
        if(ver){
            var iosVer = ver[1].replace(/_/g,".");
            this.iosVer = iosVer;
            var parseVer = parseInt(iosVer);
            isUnder9 = parseVer <= 9 ? true : false;
        }


        if(wxApp || inQQ){
            $('body').addClass('jy_wx');
        }

        if(uc || isUnder9){
            return true;
        }
        return false;
    },

    checkOut : function(){
        var _this = this;

        document.addEventListener("visibilitychange", function(){
            if(document.hidden){
                customGame.paused = true;
                if(CONF.custom.isPlayMusic){
                    _this.audio.pause();
                }
            }else{
                customGame.paused = false;
                if(CONF.custom.isPlayMusic){
                    _this.audio.play();
                }
            }
        });
    },

    showRule : function(){
        $('.jy_go .rulebtn').on('click',function(e){
            e.preventDefault();
            $('.pop-rule').show();
        });

        $('.rule-close').on('click',function(e){

            e.preventDefault();
            $('.pop-rule').hide();
        })
    },

    checkFirst : function(){
        var cookie = this.getCookie('pacificRim'),
            text = '';

        if(cookie){
            this.firstEnter = false;
            $('.jy_course').addClass('nofirst');
            text = '又见面了，老战友！准备好了吗，再让怪兽尝尝我们的厉害！';
            $('.jy_gif').hide();
        }else{
            this.firstEnter = true;
            this.setCookie('pacificRim','1');
            text = '终于等到你，赶紧启动机甲！只要我们同时瞄准怪物身上的相同位置，就能完成一次攻击！';
            this.inCourse = true;
        }
        $('.jy_course p').text(text);
    },
    getCookie : function(name){
        var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr != null) {
            return unescape(arr[2]);
        }
        return null;
    },
    setCookie : function(name , value){
        var Days = 1; //保存 1 天
        var exp  = new Date();    //new Date("December 31, 9998");
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        var cookies = document.cookie;

        if((typeof value == "string")&&(value.length > 0)){
            document.cookie = name + "="+ escape(value) + ";expires=" + exp.toGMTString();
        }else{
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.getCookie(name);
            if(cval!=null)
            document.cookie=name +"="+cval+";expires="+exp.toGMTString();
          }
    },

    goAhead : function(){

        var goPage = $('.jy_go'),
            _this = this;
        goPage.find('.go').on('click',function(){
            //防止休眠
            if(!_this.checkEnv()){
                var noSleep = new NoSleep();
                noSleep.enable();
            }
            
            goPage.addClass('hide');
            setTimeout(function(){
                goPage.hide();

                if(_this.firstEnter){
                    
                    setTimeout(function(){
                        $('.jy_gif').hide();
                        $('.jy_course .team').css({
                            opacity : 1
                        })

                        $('.jy_course .tip').css({
                            opacity : 1
                        })
                        setTimeout(function(){
                            var courseTarget = customGame.add.sprite(140,853,'totalSprite2','courseTarget.png');
                            courseTarget.anchor.set(0.5);
                            customGame.add.tween(courseTarget).to({ alpha : 0.2 } , 600 , Phaser.Easing.Linear.None , true , 0 , -1 , true);
                            customGame.physics.enable(courseTarget);
                            _this.courseTarget = courseTarget;


                        },1000)

                        setTimeout(function(){
                            
                            var courseW = _this.centerX - _this.courseTarget.x,
                                courseH =  _this.courseTarget.y - _this.centerY,
                                angle = -_this.caleAngle(courseW,courseH);

                            $('.jy_course .guideline').css({
                                top : parseInt($(window).height())/2 + 6,
                                left : parseInt($(window).width())/2 - 14,
                                transform : "rotate(" + angle + "deg)",
                                '-webkit-transform' : "rotate(" + angle + "deg)",
                                opacity : 1
                            })
                            //激光
                            _this.createLaser();
                            //手
                            _this.createHand();
                            //弹
                            _this.createShot();

                            setTimeout(function(){
                                _this.canMove = true;
                                _this.courseMove = true;
                                $('.jy_course .guideline').hide();
                                //test
                                //  if(_this.courseTarget){
                                //     _this.shot.x = _this.courseTarget.x;
                                //     _this.shot.y = _this.courseTarget.y;
                                // }
                            },3000)
                                
                        },2500)
                    },2000)
                }    
            },1000);
        })
    },

    caleAngle : function(x,y){

        return -360*Math.atan(x/y)/(2*Math.PI);
    },

    deviceorientationListener : function(e){
        if(e.alpha == null || e.beta == null || e.gamma == null){
            alert('您的设备不支持重力感应~')
        }

        var beta = Math.round(e.beta),
            gamma = Math.round(e.gamma);

        this.betaDirection = beta > 90 ? 45 : (beta >= 45 && beta <= 90) ? (beta - 45) : (beta > 0 && beta < 45) ? (beta - 45) : -45;
        this.gammaDirection = gamma > 45 ? 45 : gamma < -45 ? -45 : gamma;
    },

    createTeamPage : function(){
        var courseBg = customGame.add.sprite(0,0,'courseBg'),
            _this = this;
        courseBg.width = customGame.width;
        courseBg.height = customGame.height;
        if(_this.firstEnter){
            $('.jy_gif').css({
                opacity : 0.6
            });
        }else{
            this.courseMove = true;
             $('.jy_course .team').css({
                opacity : 1
            })

            $('.jy_course').on('click',function(e){
                e.preventDefault();

                _this.hideTeamPage(0);

                //激光
                _this.createLaser();

                //手
                _this.createHand();

                //弹
                _this.createShot();

            })

        }

        this.courseBg = courseBg;

    },

    showGoFire : function(){
        var goFire = customGame.add.sprite(this.centerX,this.centerY,'totalSprite','fight.png');

        goFire.anchor.set(0.5);
        goFire.scale.set(3);

        var goFireShow = customGame.add.tween(goFire.scale).to({ x : 1 , y : 1} , 200 , Phaser.Easing.Sinusoidal.in , true);
        goFireShow.onComplete.add(this.showStart,this);

        this.goFire = goFire;
    },

    showStart : function(){
        var _this = this;
        setTimeout(function(){

            _this.goFire.kill();

            var go = customGame.add.sprite(_this.centerX,_this.centerY,'totalSprite2','go.png');

            go.anchor.set(0.5);
            go.scale.set(3);

            var goShow = customGame.add.tween(go.scale).to({ x : 1 , y : 1} , 200 , Phaser.Easing.Sinusoidal.in , true);
            goShow.onComplete.add(_this.goHide , _this);

            _this.go = go;
        },500)
    },

    goHide : function(){
        var _this = this,
            target = _this.targetGroup.getFirstAlive();

        setTimeout(function(){
            _this.go.kill();
            _this.canMove = true;
            _this.gameTimeStart = true;;
            _this.createMate(target.x , target.y);
        },500);
    },

    createMate : function(x,y){
        var target = this.targetGroup.getFirstAlive(),
            posx = x ? x : target.x,
            posy = y ? y : target.y;

        var mate = customGame.add.sprite(posx, posy - 180 ,'totalSprite','here.png'),
            mateShow = customGame.add.tween(mate).from({ alpha : 0} , 200 , Phaser.Easing.Sinusoidal.out , true , 500 , 1 , true);

        this.mate = mate;
    },

    getUrlParam : function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
            r = window.location.search.substr(1).match(reg);

        if(r !== null){
            return unescape(r[2]);
        }

        return "";
    },

    getCookies : function(name){
        var strCookie = document.cookie;
        var arrCookie = strCookie.split("; ");
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if (name == arr[0]) {
                return arr[1];
            }
        }
        return "";
    },

    dealMusicBtn : function(){
        if(CONF.custom.isPlayMusic){
            this.musicBtn.frameName = 'soundBtn.png';
        }else{
            this.musicBtn.frameName = 'soundBtnClose.png';
        }
    },

    create : function(){
        //物理效果
        customGame.physics.startSystem(Phaser.Physics.ARCADE);

        this.createTeamPage();
        
        //背景
        this.createRedFlog();

        //怪兽
        this.createMonster();

        customGame.add.sprite(0,customGame.height - 480 , 'totalSprite2','stone.png');
        
        this.targetGroup = customGame.add.group();

        //目标
        this.createTarget();
        
        //飞机
        this.createPlane();
        
        

        //数据框
        var wrap = customGame.add.image(this.centerX,this.centerY,'wrap');
        wrap.anchor.set(0.5);
        wrap.height = 1284/1342*customGame.height;
        this.wrap = wrap;


        //音乐按钮
        this.createMusicBtn();

        //游戏时间
        this.gameTime();

        //血条
        this.createBlood();

        // 时间
        // this.createTimer();
    },

    updateCounter : function(){
        var _this = this,
            gameTimeCounter = _this.gameTimeCounter,
            timeSec;

            if(_this.gameTimeStart == false) return;
            if(_this.canDraw) return;

            gameTimeCounter--;
            timeSec = gameTimeCounter >= 10 ? gameTimeCounter : '0' + gameTimeCounter;
            _this.timeWord.setText('00:' + timeSec);
            _this.gameTimeCounter = gameTimeCounter;

            if(gameTimeCounter == 0){
                _this.canDraw = true;
                customGame.time.events.remove(_this.gameTimeEvent);
                _this.targetTime && customGame.time.events.remove(_this.targetTime);
                clearTimeout(_this.laserTimeout);
                CONF.custom.star = 0;
                _this.canMove = false;
                _this.shot.body.velocity.set(0);
                _this.createTimeout();
            }
    },

    createTimeout : function(){
        var timeout = customGame.add.sprite(this.centerX,this.centerY,'totalSprite','timeout.png');
        timeout.anchor.set(0.5,0.5);
        timeout.scale.set(3);

        var timeoutShow = customGame.add.tween(timeout.scale).to({ x : 1 , y : 1} , 300 , Phaser.Easing.Sinusoidal.in , true);
        timeoutShow.onComplete.add(this.timeoutEnd,this);

        this.timeout = timeout;

    },

    timeoutEnd : function(){
        var _this = this;
        setTimeout(function(){
            _this.timeout.kill();
            _this.goDraw(false)
        },2000)
    },

    goDraw : function(win,star,name){

        var isPlayMusic = CONF.custom.isPlayMusic ? '1' : '0';
        this.setCookie('isPlayMusic',isPlayMusic);
        if(win){
            game.popup.success_login({star:star,name:name})
        }else{
            game.popup.fail_login({star:0,name:"勇敢者的嘉奖"});
        }
        
    },

    gameTime : function(){
        var timeBg = customGame.add.sprite(294,87,'totalSprite','timgbg.png'),
            word = '00:' + this.totalTime, 
            timeWord = customGame.add.text(333,95,word,{ font : 'bold 63px 微软雅黑', fill : '#ffa33e' });
            sWord = customGame.add.text(503,106,'S',{ font : 'bold 50px 微软雅黑', fill : '#ffa33e' })

        this.gameTimeEvent = customGame.time.events.loop(1000,this.updateCounter,this);
        this.timeWord = timeWord;

    },

    removeTime : function(time){
        customGame.time.events.remove(time);
    },

    createBlood : function(){
        var bloodWrap = customGame.add.sprite(173,201,'totalSprite','bloodWrap.png'),
            blood = customGame.add.sprite(191,217,'totalSprite','blood.png');

        this.bloodWidth = 371;
        this.blood = blood;
    },

    createMusicBtn : function(){
        this.musicBtn = customGame.add.sprite(165,86,'totalSprite','soundBtn.png');
        this.musicBtn.inputEnabled = true;
        this.musicBtn.events.onInputDown.add(this.controlMusic,this);
        this.dealMusicBtn();
    },

    controlMusic : function(){
        var musicBtn = this.musicBtn;
        if(musicBtn.frameName == 'soundBtn.png'){
            this.musicBtn.frameName = 'soundBtnClose.png';
            this.audio.pause();
            CONF.custom.isPlayMusic = false;
        }else{
            this.musicBtn.frameName = 'soundBtn.png';
            this.audio.play();
            CONF.custom.isPlayMusic = true;
        }
    },

    createPlane : function(){
        var plane = customGame.add.sprite(106,363,'plane');
        plane.animations.add('fly');
        plane.play('fly',5,true);
        customGame.add.tween(plane).to({ y : 333} , 1000 , Phaser.Easing.Linear.None , true , 0 , -1 , true)

        var plane = customGame.add.sprite(616,343,'plane');
        plane.scale.set(0.5);
        plane.animations.add('fly');
        plane.play('fly',3,true);
        customGame.add.tween(plane).to({ y : 353} , 1500 ,Phaser.Easing.Linear.None , true , 0 , -1 , true)
    },

    createRedFlog : function(){
        var bg = customGame.add.image(0,0,'bg');

        var redFlog = customGame.add.sprite(0,449,'redFlog');
        redFlog.animations.add('float');
        redFlog.play('float',4,true);

        var fire = customGame.add.sprite(this.centerX,963,'fire'),
            fireTween = customGame.add.tween(fire);
        fire.anchor.set(0.5,1);
        fireTween.to({alpha : 0,} , 2500, Phaser.Easing.Linear.None ,true , 1000, -1 ,false);
        customGame.add.tween(fire.scale).to({ y : 2.5 } , 2500, Phaser.Easing.Linear.None ,true , 1000, -1 ,false);

        var bgFront = customGame.add.sprite(0,0,'bgFront');

        var firework = customGame.add.sprite(this.centerX,904,'firework');
        firework.anchor.set(0.5);
        firework.animations.add('fire');
        firework.play('fire',4,true);
    },

    createTimer : function(callback){
        this.controlTargetTime = true;
        this.targetTime = customGame.time.events.repeat(1000,1,callback,this);
    },


    createMonster : function(){
        var monster = customGame.add.sprite(this.centerX,this.centerY+505,'totalSprite2','monster.png');
            monster.anchor.set(0.5,1);            
            monster.scale.set(2);

        this.monster = monster;
        this.createMonsterBreath();

        var monsterLeft = monster.left,
            monsterTop = monster.top,
            monsterWidth = monster.width,
            monsterHeight = monster.height; 

        this.monsterXMin = 30;
        this.monsterXMax = customGame.width - 30;
        this.monsterYMin = monsterTop;
        this.monsterYMax = monsterTop + monsterHeight - 200;

    },

    createMonsterBreath : function(){
        var monster = this.monster;

        monster.loadTexture('totalSprite2','monster.png');
        var monsterBreathTween = customGame.add.tween(monster.scale).to({ y : 2.02 , x : 2.01 },400,"Linear",true,0,2,true);
        monsterBreathTween.onComplete.add(this.createMonsterRun,this);

        this.monsterBreathTween = monsterBreathTween;
    },

    createMonsterRun : function(){
        var monster = this.monster;

        monster.loadTexture('monsterRun');
        monster.anchor.set(0.5,1);            
        monster.scale.set(2);

        var run = monster.animations.add('run');
        run.onLoop.add(this.monsterRunLooped,this);
        run.onComplete.add(this.createMonsterBreath,this);
        run.play(4,true);

        this.monsterRun = run;
    },

    createMonsterDead : function(){
        var monster = this.monster,
            ko = customGame.add.sprite(this.centerX,this.centerY,'totalSprite','ko.png');

        this.monsterBreathTween.pause();
        monster.animations.stop(null,true);
        

        monster.loadTexture('monsterDead');
        monster.anchor.set(0.5,1);
        monster.scale.set(2);

        var dead = monster.animations.add('dead');
        dead.onLoop.add(this.monsterDeadLooped , this);
        dead.onComplete.add(this.monsterDead , this);
        dead.play(4,false);

        ko.anchor.set(0.5,0.5);
        ko.scale.set(3);
        this.ko = ko;

        this.getWinStar();

        var koShow = customGame.add.tween(ko.scale).to({ x : 1 , y : 1} , 300 , Phaser.Easing.Sinusoidal.in , true,0,0);

        koShow.onComplete.add(this.koEnd,this);

    },

    getWinStar : function(){
        var winTime = this.totalTime - this.gameTimeCounter,
        // var winTime = this.totalTime - 24  ,
            starArr = CONF.custom.starArr,star;

        for(var i = 0 ; i < starArr.length ; i++){
            var item = starArr[i];
            if(winTime >= item.minTime && winTime <= item.maxTime){
                CONF.custom.star = i;
                break;
            }
        }

    },


    koEnd : function(){

        var txt = CONF.custom.starArr[CONF.custom.star].txt,
            _this = this;


        setTimeout(function(){

            _this.goDraw(true,CONF.custom.star,txt);
        },2000)
        
    },

    monsterDeadLooped : function(sprite,animation){
        if(animation.loopCount === 0){
            animation.loop = false;
        }
    },

    monsterDead : function(){
        // alert('怪兽终于死了')
    },


    createMonsterShot : function(){
        var monster = this.monster;

        this.monsterBreathTween.pause();
        monster.animations.stop(null,true);

        monster.loadTexture('monsterShot');
        monster.anchor.set(0.5,1);
        monster.scale.set(2);

        var shot = monster.animations.add('shot');
        shot.onLoop.add(this.monsterShotLooped,this);
        shot.onComplete.add(this.createMonsterBreath,this);
        shot.play(4,false);
    },

    // monsterRunStoped : function(){
    //     var monster = this.monster;
    //     monster.loadTexture('monster');
    //     var monsterBreathTween = customGame.add.tween(monster.scale).to({ y : 2.02 , x : 2.01 },400,"Linear",true,0,2,true);
    //     monsterBreathTween.onComplete.add(this.createMonsterRun,this);
    // },

    monsterRunLooped : function(sprite,animation){
        if(animation.loopCount === 1){
            animation.loop = false;
        }
    },

    monsterShotLooped : function(sprite,animation){
        if(animation.loopCount === 0){
            animation.loop = false;
        }
    },

    createTarget : function(){

        var targetGroup = this.targetGroup;
        targetGroup.enableBody = true;
        targetGroup.physicsBodyType = Phaser.Physics.ARCADE,
        createTargetTimes = this.createTargetTimes;

        var i = 10 - this.monsterLife;

        var pos = this.targetPos[i];
        targetGroup.create(this.centerX + pos.x , this.centerY + pos.y , 'totalSprite2','courseTarget.png');

        targetGroup.setAll('anchor.x' , 0.5);
        targetGroup.setAll('anchor.y' , 0.5);
        targetGroup.setAll('outOfBoundsKill', true);
        targetGroup.setAll('checkWorldBounds', true);

        this.targetGroup = targetGroup;
        this.createTargetTimes++;
    },

    createHand : function(){
        var hand = customGame.add.image(customGame.width - 436 , customGame.height - 347 , 'hand');
        hand.animations.add('light');
        hand.play('light',5,true);
        this.hand = hand;
    },

    createShot : function(){
        var shot = this.shot;

        shot = customGame.add.sprite(this.centerX,this.centerY,'totalSprite2','target.png');
        shot.anchor.set(0.5);

        customGame.physics.arcade.enable(shot);

        this.shot = shot;

    },

    createLaser : function(){

        this.laser = customGame.add.image(this.centerX,this.centerY,'totalSprite2','redLaser.png');
        this.laser.anchor.set(27/this.laser.width,27/this.laser.height);

        this.laserNode = customGame.add.graphics(customGame.width-250,customGame.height-100);
        this.laserNode.beginFill(0xFF0000,1); 
        this.laserNode.drawCircle(0,0,10);

        var laserMask = customGame.add.graphics(0,0);
            laserMask.beginFill(0xFFFFFF);
            laserMask.drawRect(0,0,customGame.width,customGame.height-80);
        this.laser.mask = laserMask;

    },

    caleLaserAngle : function(x,y){
        var a = x - this.laserNode.x,
            b = y - this.laserNode.y;

        return -360*Math.atan(a/b)/(2*Math.PI);
    },

    caleLaser : function(){
        if(this.hasGreenLaser){
            this.laser.x = this.shot.x;
            this.laser.y = this.shot.y;
        }else{
            this.laser.x = this.shot.x - 23;
            this.laser.y = this.shot.y + 10;
        }   
        
        
        this.laser.angle = this.caleLaserAngle(this.laser.x,this.laser.y);
    },

    moveShot : function(){
        var betaDirection = this.betaDirection,
            gammaDirection = this.gammaDirection;
        if(!this.shot) return false;
        var speed = 15 * (Math.abs(betaDirection) + Math.abs(gammaDirection));
        var _monsterXMin = this.monsterXMin + 5,
            _monsterYMin = this.monsterYMin + 5,
            _monsterXMax = this.monsterXMax,
            _monsterYMax = this.monsterYMax;

            if(betaDirection < 0 && gammaDirection < 0){
                if(this.shot.x <= _monsterXMin && this.shot.y <= _monsterYMin){
                    this.shot.body.velocity.set(0);
                    customGame.add.tween(this.shot).to({ x : _monsterXMin , y : _monsterYMin } , 20 , Phaser.Easing.Linear.None , true , 0 , 0);
                }else{
                    customGame.physics.arcade.moveToXY(this.shot , this.monsterXMin , this.monsterYMin , speed);
                }
            }else if(betaDirection < 0 && gammaDirection > 0){
                if(this.shot.x >= _monsterXMax && this.shot.y <= _monsterYMin){
                    this.shot.body.velocity.set(0);
                    customGame.add.tween(this.shot).to({ x : _monsterXMax , y : _monsterYMin } , 20 , Phaser.Easing.Linear.None , true , 0 , 0);
                }else{
                    customGame.physics.arcade.moveToXY(this.shot , this.monsterXMax , this.monsterYMin , speed);
                }
            }else if(betaDirection > 0 && gammaDirection > 0){
                if(this.shot.x >= _monsterXMax && this.shot.y >= _monsterYMax){
                    this.shot.body.velocity.set(0);
                    customGame.add.tween(this.shot).to({ x : _monsterXMax , y : _monsterYMax } , 20 , Phaser.Easing.Linear.None , true , 0 , 0);
                }else{
                    customGame.physics.arcade.moveToXY(this.shot , this.monsterXMax , this.monsterYMax , speed);
                }
            }else if(betaDirection > 0 && gammaDirection < 0){ 
                if(this.shot.x <= _monsterXMin && this.shot.y >= _monsterYMax){
                    this.shot.body.velocity.set(0);
                    customGame.add.tween(this.shot).to({ x : _monsterXMin , y : _monsterYMax } , 20 , Phaser.Easing.Linear.None , true , 0 , 0);
                }else{
                    customGame.physics.arcade.moveToXY(this.shot , this.monsterXMin , this.monsterYMax , speed)
                }
            }else{
                this.shot.body.velocity.set(0);
            }
    },

    shoting : function(){
        if(!customGame.physics.arcade.overlap(this.targetGroup , this.shot)){
            this.targetTime && customGame.time.events.remove(this.targetTime);
            this.controlTargetTime = false;
            clearTimeout(this.laserTimeout);
        }
        //test

        customGame.physics.arcade.overlap(this.targetGroup,this.shot,this.shotingFunc,null,this);
    },

    shotingFunc : function(shot,target){

        var _this = this;

        if(this.controlTargetTime) return false;
        if(this.canDraw) return false;

        _this.mateShowTime && customGame.time.events.remove(_this.mateShowTime);
        _this.createGreenLaser(940);
        _this.createTimer(function(){
            _this.createFireNum(target.x - 150 , target.y + 100);
            target.kill();
            _this.createBoom(target.x,target.y);
            _this.monsterLife--;
            _this.blood.width = _this.monsterLife/10 * _this.bloodWidth;
            _this.mate && _this.mate.kill();

            $('body').addClass('invert');

            setTimeout(function(){
                $('body').removeClass('invert');
            },200)
            

            if(_this.monsterLife != 0){
                _this.createMonsterShot();
            }else{
                customGame.camera.shake(0.01,1000);
                _this.canMove = false;
                _this.shot.body.velocity.set(0);
                customGame.time.events.remove(_this.gameTimeEvent);
                _this.canDraw = true;
                _this.createMonsterDead();
            }

            setTimeout(function(){
                _this.killFireNum();
                _this.controlTargetTime = false;
                if(_this.targetGroup.countLiving() == 0 && _this.monsterLife !== 0){
                     _this.mateShowTime = customGame.time.events.repeat(10000,1,_this.createMate,_this);
                    _this.createTarget();
                }
            },1000)
        });
    },

    createFireNum : function(x,y){
        var num = 10 - this.monsterLife + 1,
            xPos = num == 10 ? 213 : 220;
        this.firedNum = customGame.add.sprite(x,y,'totalSprite','firedNum.png');
        this.firedNumWd = customGame.add.text(x + xPos,y + 25,num,{ font : 'bold 26px 微软雅黑', fill : '#ffa33e' })
    },

    killFireNum : function(){
        this.firedNum && this.firedNum.kill();
        this.firedNumWd && this.firedNumWd.kill();
    },

    createBoom : function(x,y){
        var boom = customGame.add.sprite(x,y,'boom'),
            boomAni = boom.animations.add('boom');
        boom.anchor.set(0.5);
        boomAni.play(6,false);
        boomAni.onComplete.add(function(){
            boom.kill(); 
        },this);
        this.boom = boom;
    },

    courseEnd: function(obj1,obj2){
        if(this.courseBoom) return false;

        var _this = this;   
        _this.couseendFlag = true;

        _this.createTimer(function(){
            _this.couseendFlag = true;
            _this.createGreenLaser(400);
            _this.courseBoom = true;

            setTimeout(function(){
                $('.jy_course .tip').addClass('good');
                _this.createBoom(obj1.x,obj1.y);
                obj1.kill();
                _this.courseTarget.kill();
                _this.shot.body.velocity.set(0);
                _this.hideTeamPage(2000);
                _this.deleteCourse = true;
                // _this.greenLaser && _this.greenLaser.kill();
                // _this.laserFlyout = false;
                // _this.hasGreenLaser = false;
                _this.inCourse = false;

            },400)
        })
    },

    hideTeamPage : function(time){
        var _this = this;
        setTimeout(function(){
            $('.jy_course').hide();
            _this.courseBg && _this.courseBg.kill();
            _this.shot.x = _this.centerX;
            _this.shot.y = _this.centerY;
            _this.canGameMove = true;
            _this.showGoFire();
        },time);
    },

    createGreenLaser : function(time){

        var _this = this;
        _this.laserTimeout = setTimeout(function(){
            _this.laser.loadTexture('totalSprite2','laser.png');
            _this.hasGreenLaser = true;
            setTimeout(function(){
                _this.laser.loadTexture('totalSprite2','redLaser.png');
                _this.hasGreenLaser = false;
            },30)
        },time)

    },

    caleGreenLaser : function(){ 
        this.greenLaser.x = this.greenLaserShot.x;
        this.greenLaser.y = this.greenLaserShot.y;

        this.greenLaser.angle = this.caleLaserAngle(this.greenLaser.x,this.greenLaser.y);

        var disX = Math.abs(this.greenLaserShot.x - this.shot.x),
            disY = Math.abs(this.greenLaserShot.y - this.shot.y);

        if(disX >= 0 && disX <= 10 && disY >= 0 && disY <= 10){
            this.hasGreenLaser = false;
            this.greenLaser.kill();
            this.laserFlyout = false;
        }

        if((this.shot.y - this.greenLaserShot.y) >= 0){
            this.hasGreenLaser = false;
            this.greenLaser.kill();
            this.laserFlyout = false;
        }
    },

    update : function(){
        this.courseBg && customGame.world.bringToTop(this.courseBg);

        if(this.firstEnter){
            this.courseTarget && customGame.world.bringToTop(this.courseTarget);
            this.laser && customGame.world.bringToTop(this.laser);
            this.shot && customGame.world.bringToTop(this.shot);
            // this.greenLaser && customGame.world.bringToTop(this.greenLaser);
            this.hand && customGame.world.bringToTop(this.hand);
        }else{
            this.canMove && this.hand && customGame.world.bringToTop(this.hand);
            this.canMove && this.wrap && customGame.world.bringToTop(this.wrap);
            this.laser && customGame.world.bringToTop(this.laser);
            this.hand && customGame.world.bringToTop(this.hand);
        }

        this.shot && customGame.world.bringToTop(this.shot);
        this.goFire && customGame.world.bringToTop(this.goFire);
        this.go && customGame.world.bringToTop(this.go);
        this.mate && customGame.world.bringToTop(this.mate);
        this.boom && customGame.world.bringToTop(this.boom);
        this.ko && customGame.world.bringToTop(this.ko);
        this.timeout && customGame.world.bringToTop(this.timeout);

        if(this.courseMove && this.canMove && !this.canDraw){
            //test  
            this.moveShot();
        }

        if(this.canGameMove){

            this.shoting();
        }

        this.shot && this.caleLaser();

        //test
            // var target = this.targetGroup.getFirstAlive();
            // if(target && this.shot){
            //     this.shot.x = target.x;
            //     this.shot.y = target.y;
            // }

        if(this.courseTarget && !customGame.physics.arcade.overlap(this.courseTarget , this.shot)){
            if(!this.deleteCourse){
                this.targetTime && customGame.time.events.remove(this.targetTime);
                this.controlTargetTime = false;
                this.canMove = true;
                this.couseendFlag = false;
                clearTimeout(this.laserTimeout);
            }
        }
        //test
        this.courseTarget && !this.couseendFlag && customGame.physics.arcade.overlap(this.courseTarget , this.shot , this.courseEnd , null ,this);
    }   
}

module.exports = play;
