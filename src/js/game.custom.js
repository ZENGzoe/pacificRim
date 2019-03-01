/** @module gameCustom */

require('../css/reset.scss'); //若项目内嵌在其他页面中，则不建议引入reset.css，避免引起其他页面其他部分的样式问题
require('../css/common.scss');
require('../css/popup.scss');
require('../css/popup.custom.scss');
require('../css/game.custom.scss'); 

//start:常用模块
//game.custom并不依赖这些模块，但是项目开发中常常都会用到，因此就直接写在这里了
var common = require('./common'),
	popup = require('./popup');

//end:常用模块

var play = require('./play'),
	load = require('./load');
var util = require('../lib/util');

CONF.custom.isPlayMusic = false;

function dealMusic(callback){
    var _this = this,
        jy_mask = $('.jy_mask'),
        audio = document.getElementById('jy_audio');

    jy_mask.find('.no').on('click', function(e){
        jy_mask.hide();
        CONF.custom.isPlayMusic = false;
        callback();
    })

    jy_mask.find('.yes').on('click', function(e){
        jy_mask.hide();
        audio.play();
        CONF.custom.isPlayMusic = true;
        callback();
    })
 }
function autoPlayAudio1() {
	$('#jy_audio').attr('autoplay','autoplay')
    wx.config({
        debug: false,
        appId: '',
        timestamp: 1,
        nonceStr: '',
        signature: '',
        jsApiList: []
    });
    wx.ready(function() {
        document.getElementById('jy_audio').play();
    });
}
function getCookie(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
    if(arr != null) {
        return unescape(arr[2]);
    }
    return null;
}

module.exports = {

	/**
	 * @callback draw
	 *		@param {Object} [gameRet = {}] - 游戏结果
	 */

	/**
	 * 初始化
	 * @param {Object} opts - 参数
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	init : function(opts){
		var open = util.queryString('open');
		if(!open){
			$('.jy_mask').css({
				opacity : 1
			})
		}

		global.customGame = CONF.custom.game = new Phaser.Game(750,750 / window.innerWidth * window.innerHeight , Phaser.CANVAS , 'container');
		
		customGame.state.add('Play',play);
		customGame.state.add('Load',load);

		

		if(open){
			customGame.state.start('Start');
		}else{
			dealMusic(function(){
				customGame.state.start('Load');
			});
		}
		

		global.opts = opts;

	},

	/**
	 * 初始化“开始游戏”（第1次“开始游戏”前的处理函数）
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	initStart : function(opts){

	},

	/**
	 * 由“普通流程”触发的“开始游戏”的处理函数
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	start : function(opts){
	},

	/**
	 * 由点击“再玩一次”触发的“开始游戏”的处理函数
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	restart : function(opts){
		$('.jy_loading').hide();
		$('.jy_mask').hide();
		$('.jy_go').hide();
		customGame.state.start('Load');
		CONF.custom.restartMode = true;
	}
};