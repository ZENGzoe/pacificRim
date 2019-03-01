var util = require('../lib/util');
const load = {
    init : function(){
        customGame.stage.backgroundColor = '#0d3134';
        customGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.redFlogJson = require('../json/redFlog.json');
        this.fireworkJson = require('../json/firework.json');
        this.monsterRunJson = require('../json/monsterRun.json');
        this.planeJson = require('../json/plane.json');
        this.handJson = require('../json/hand.json');
        this.allSpriteJson = require('../json/totalSprite.json');
        this.boomJson = require('../json/boom.json');
        this.monsterShotJson = require('../json/monsterShot.json');
        this.monsterDeadJson = require('../json/monsterDead.json');
        this.totalSprite2Json = require('../json/totalImage2.json');

        this.canHide = false;
        
        var _this = this;
        this.timer = setTimeout(function(){
            _this.networkError()
        },15000)
    },

    networkError : function(){
        game.popup.retry(function(){
            window.location.reload();
        });
    },

    preload : function(){
        customGame.load.onFileComplete.add(this.loadProgress , this);
        customGame.load.onLoadComplete.addOnce(this.loadComplete , this);

        this.loadResources();
    },

    loadResources : function(){

        customGame.load.image('bg' , './img/bg.png');
        customGame.load.image('fire' , './img/fire.png');
        customGame.load.image('bgFront' , './img/bgFront.png');
        customGame.load.image('wrap' , './img/dataWrap.png');
        customGame.load.image('courseBg' , './img/courseBg.jpg');
        customGame.load.atlasJSONHash('redFlog', './img/redFlog.png','',this.redFlogJson);
        customGame.load.atlasJSONHash('firework' , './img/firework.png' , '' , this.fireworkJson);
        customGame.load.atlasJSONHash('monsterRun' , './img/monsterRun.png' , '' , this.monsterRunJson);
        customGame.load.atlasJSONHash('plane' , './img/plane.png' , '' , this.planeJson);
        customGame.load.atlasJSONHash('hand' , './img/hand.png' , '' , this.handJson);
        customGame.load.atlasJSONHash('totalSprite' , './img/totalSprite.png', '' , this.allSpriteJson);
        customGame.load.atlasJSONHash('boom' , './img/boom.png' , '' , this.boomJson);
        customGame.load.atlasJSONHash('monsterShot' , './img/monsterShot.png' , '' ,this.monsterShotJson);
        customGame.load.atlasJSONHash('monsterDead' , './img/monsterDead.png' , '' , this.monsterDeadJson);
        customGame.load.atlasJSONHash('totalSprite2' , './img/totalImage2.png' , '' , this.totalSprite2Json);

        this.showBg();
        customGame.load.start();
    },

    loadProgress : function(progress , cacheKey , success , totalLoaded , totalFiles){
        var loading = $('.jy_loading');
       
        loading.find('.num').text(progress + '%');
        loading.find('.active').css({ width : progress + '%'});
        
    },

    showBg : function(){
        var loading = $('.jy_loading'),
            word = '机器人送往战场...',
            _this = this;

            loading.addClass('active1');
            word = '机器人送往战场...';
            loading.find('.word').text(word);
        
            setTimeout(function(){
            loading.removeClass('active1').addClass('active2');
            word = '机器人到达战场...';
            loading.find('.word').text(word);
        },1000)

        setTimeout(function(){
            loading.removeClass('active2').addClass('active3');
            word = '机器人开始战斗...';
            loading.find('.word').text(word);
        },2000)

        setTimeout(function(){
            if(_this.canHide){
                _this.hideLoading();
            }else{
                _this.canHide = true;
            }   
        },3500)
    },

    hideLoading : function(){
        $('.jy_loading').hide();
        $('.jy_loading').hide();
        
    },

    loadComplete : function(){
        clearTimeout(this.timer);
        if(this.canHide){
            this.hideLoading();
        }else{
            this.canHide = true;
        }  
    },

    create : function(){
        customGame.state.start('Play');
    }
}

module.exports = load;