var ENV = (function(){
		var ua = navigator.userAgent;
		return {
			wx : /MicroMessenger/i.test(ua), //是否在微信中
			qq : /MQQBrowser/i.test(ua) //是否在QQ中
		}
	})(), //当前环境
	CONF = {
	custom : { //自定义配置参数
		starArr : [
            {
                minTime : 41,
                maxTime : 100,
                star : 0 ,
                txt : '授予“和平守护者”称号'
            },
            {
                minTime : 36,
                maxTime : 40,
                star : 1 ,
                txt : '授予“怪兽屠戮者”称号'
            },
            {
                minTime : 26,
                maxTime : 35,
                star : 2 ,
                txt : '授予“地狱拯救者”称号'
            },
            {
                minTime : 0,
                maxTime : 25,
                star : 3 ,
                txt : '授予“战役之王”称号'
            }   
        ]
	},
	popup : { //弹框的配置参数
		success_login : {
			orders : [
				'title',
				'icon',
				'subtitle',
				'btns'
			],
			title : '成功击败',
			icon : '{star}',
			subtitle : '<span>{name}</span>',
			btns : ['replay'],
			replayBtnTxt : '再次出击',
		},
		fail_login : {
			orders : [
				'title',
				'icon',
				'desc',
				'subtitle',
				'btns'
			],
			title : '攻击失败',
			icon : '{star}',
			desc: '为了最后的胜利，永远别放弃！',
			subtitle : '<span>{name}</span>',
			btns : ['replay'],
			replayBtnTxt : '再次出击',
		},
		//重试
		retry : {
			orders : [
				'title',
				'subtitle',
				'btns'
			],
			title : '网络异常',
			subtitle:'与基站失去联系<br>请检查网络连接或稍后尝试哦',
			btns : ['retry'],
			retryBtnTxt : '刷新重试',
		},
	},

	//接口超时
	timeout: 5000,
};