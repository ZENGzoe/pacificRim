//内部组件
var util = require('../lib/util');
var cookie = require('../lib/cookie');
var NoSleep = require('./NoSleep');

//start:polyfill
var Promise = require('promise-polyfill');
if(!window.Promise){
	window.Promise = Promise;
}
require('whatwg-fetch');
//end:polyfill

require('./game');

//全局对象
var Ggame = {
	J_loading: $('#padt_loading') || null,
	cookiePrefix: window.CONF.cookiePrefix || '',
	gameResultInfo : null
};

/**
 * 初始化
 * @return {[type]} [description]
 */
Ggame.init = function() {

	//运行环境
	Ggame.checkEnv();

    //配置弹框和游戏参数
	Ggame.initPopup();
	Ggame.initGame();

	//主流程
	Ggame.loadingGame();
};

/**
 * 加载游戏
 * @return {[type]} [description]
 */
Ggame.loadingGame = function() {
	Ggame.startGameCheck();
};


/**
 * 弹框按钮初始化
 * @return {[type]} [description]
 */
Ggame.initPopup = function() {

	//弹框按钮事件处理函数初始化
	game.popup.preinit({
		handlers: {
			//再玩一次
			replay: function(all) {
				Ggame.replayGame(all);
			},

			//刷新页面
			reload: function(all){
				Ggame.reload(all);
			},
		},
		//添加cookie操作
		cookieObj: {
			get: cookie.get,
			add: cookie.add,
			del: cookie.del
		},

	}).init(window.CONF.popup);
};

/**
 * 游戏初始化
 * @return {[type]} [description]
 */
Ggame.initGame = function() {
	game.init({
		onTapStartBtn: function() {
		},

		onPrepareEnd: function() {
		},


		//点击操作
		onHit: function(info) {
		}
	});
};


/**
 * 游戏入口过滤
 * 游戏入口每个项目可能不太一样，因此得独立出来
 *
 * @return {[type]} [description]
 */
Ggame.startGameCheck = function() {

	//显示游戏加载中动画
	//缓解接口等待时间
	Ggame.showLoading(true)

	//开始游戏
	Ggame.startGame();
};

/**
 * 开始游戏
 * @return {[type]} [description]
 */
Ggame.startGame = function() {

	//关掉加载动画
	Ggame.showLoading(false);

	//开始游戏
	game.start();
};


/**
 * 显示loading
 * @param  {[boolean]} show    [隐藏或显示动画]
 * @return {[type]}         [description]
 */
Ggame.showLoading = function(show) {
	try {
		if (Ggame.J_loading) {
			show ? this.J_loading.show() : this.J_loading.hide();
		} else {}
	} catch(e) {
	}
};


/**
 * 检测运行环境
 * @return {[type]} [description]
 */
Ggame.checkEnv = function() {
	var ua = window.navigator.userAgent.toLowerCase();
	var wxApp = /MicroMessenger/i.test(ua);
    var iphone = ua.indexOf('iphone') != -1;
    var android = ua.indexOf('android') != -1;
    var inQQ = ua.indexOf('MQQBrowser') != -1;
    var uc = ua.indexOf('ucbrowser') != -1;
	var uaArr = ua.split(';');
	var ver = ua.match(/cpu iphone os (.*?) like mac os/);
	if(ver){
	    var iosVer = ver[1].replace(/_/g,".");
	    this.iosVer = iosVer;
	}

	//判断浏览器
	if(uc) this.browser = 'uc';

    //判断运行环境
	if(wxApp) this.env = 'wxApp';
	else this.env = 'browser';

    //判断操作系统
    if(iphone) this.OS = 'iphone';
    else this.OS = 'android';

    this.inQQ = inQQ;
    this.inIframe = window !== window.top;
};

/**
 * 再玩一次
 * @return {[type]} [description]
 */
Ggame.replayGame = function(all) {


	var parseVer = parseInt(this.iosVer),
    	isUnder9 = parseVer <= 9 ? true : false;

	if(this.browser != 'uc' || !isUnder9){
		var noSleep = new NoSleep();
        noSleep.enable();
	}
	var open = util.queryString('open');
	if(open && cookie.get('isPlayMusic') == '1'){
		CONF.custom.isPlayMusic = true;
		document.getElementById('jy_audio').play();
	}
	//关闭弹出
	Ggame.closePopup();

	//重新开始游戏
	Ggame.startGame();
};

/**
 * 刷新当前页面
 */
Ggame.reload = function(all) {
	setTimeout(function(){
		location.reload();
	},1000);
};

//弹窗部分

/**
 * 关闭弹框
 * @return {[type]} [description]
 */
Ggame.closePopup = function() {
	game.popup.hide(true);
};

/**
 * 未点中及没有点击操作
 * @return {[type]} [description]
 */
Ggame.showMiss = function(mall) {
	game.popup.miss({}, mall);
};
/**
 * 网络异常处理
 * @return {[type]} [description]
 */
Ggame.retry = function() {

	//重新连接
	game.popup.retry(function() {
	});
};



//初始化活动
$(function(){
	Ggame.init();
});