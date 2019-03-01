/** @module popup */

var prefix = require('./prefix');

var DEFAULT_COOKIE_EXPIRE = 24 * 3600 * 1000, //默认的cookie过期时间（毫秒）
	ua = navigator.userAgent,
	isWx = /MicroMessenger/i.test(ua), //是否在微信环境
	isQq = /MQQBrowser/i.test(ua), //是否在QQ环境
	handlers, //按钮处理函数的集合
	showns = [], //已经显示的弹框
	onShowHandler = null, //当显示弹框时的回调
	onHideHandler = null, //当隐藏弹框时的回调
	onTapHideBtnHandler = null, //当点击隐藏按钮时的回调
	cookieExpire, //cookie的过期时间（毫秒）
	$con, //弹框容器
	common, //通用配置
	TPLS = {
		popup : [
			'<div class="padt_flex_c padt_p">',
				'<p class="padt_p_overlay"></p>',
				'<div class="padt_p_content" padt-role="content"></div>',
				'<a class="padt_p_hide_btn" padt-handler="hide"></a>',
			'</div>'
		].join(''),

		//start:弹框模块
		icon : '<p class="padt_p_icon"></p>',
		desc : '<p class="padt_p_desc" padt-role="desc"></p>',
		title : '<p class="padt_p_title" padt-role="title"></p>',
		subtitle : '<p class="padt_p_subtitle" padt-role="subtitle"></p>',
		btns : '<p class="padt_p_btns"></p>',
		tipsWrap : [
			'<div class="padt_p_tips_wrap">',
				'<p class="padt_p_tips" padt-role="tips"></p>',
			'</div>'
		].join(''),
		//end:弹框模块

		//start:按钮
		btn : [
			'<a class="padt_p_btn">',
				'<span class="padt_p_btn_txt" padt-role="txt"></span>',
			'</a>'
		].join(''),
		//end:按钮
	}, //弹框模板

	/**
	 * 将源对象的属性依次添加到目标对象上
	 * @param {Object} target - 目标对象
	 * @param {...Object} src - 源对象
	 */
	extend = function(target){
		var len = arguments.length,
			src,

			/**
			 * 递归将源对象的属性设置到目标对象上
			 * @param {Object} target - 目标对象
			 * @param {Object} src - 源对象
			 */
			recurison = function(target,src){
				for(var i in src){
					if($.isPlainObject(src[i])){
						if(!$.isPlainObject(target[i])){
							target[i] = {};
						}
						recurison(target[i],src[i]);
					}else{
						target[i] = src[i];
					}
				}
			};
		for(var i=1; i<len; i++){
			recurison(target,arguments[i]);
		}
		return target;
	},

	/**
	 * 首字母大写
	 * @param {String} word - 要首字母大写的单词
	 * @returns {String} 首字母打大写后的单词
	 */
	capitalize = function(word){
		return word.replace(/^./,function(str){
			return str.toUpperCase();
		});
	},

	/**
	 * 从自身开始寻找符合选择器的元素
	 * @param {Zepto} $dom - 在这个元素及其后代元素中寻找
	 * @param {Zepto} selector - 选择器
	 * @returns {Zepto} 找到的元素
	 */
	findFromSelf = function($dom,selector){
		var ret = $dom.find(selector);
		if($dom.is(selector)){
			return ret = $dom.add(ret);
		}
		return ret;
	},

	/**
	 * 解绑所有弹窗相关事件
	 * @param {Object} opts - 参数
	 *		@param {Zepto} opts.$dom - 弹窗的dom
	 */
	destroy = function(opts){
		opts.$dom.off();
	},

	/**
	 * 弹框
	 * @namespace
	 */
	popup = {

		/**
		 * 设置模板
		 * @param {String} name - 模板名称
		 * @param {String} htmlStr - 模板的html字符串（可以通过“将dom的padt-handler属性设置某个‘功能名称’”为该dom绑定点击后的功能）
		 */
		setTpl : function(name,htmlStr){
			TPLS[name] = htmlStr;
			return popup;
		},

		/**
		 * 解析替换字符串中的“{XXX}”（支持js语句）
		 * @param {String} str - 要解析的字符串
		 * @param {Object} info - 替换成的信息
		 * @returns {String} 解析后的字符串
		 */
		parseStr : function(str,info){
			return str ? str.replace(/{([^}]+)}/g,function(match,name){
				var ret;
				try{
					name = name.replace(/^[a-zA-Z_$\d]+$/,'info.$&');
					ret = eval(name);
				}catch(e){}
				if(typeof ret == 'number'){
					ret = ret + '';
				}
				return ret || '';
			}) : '';
		},

		/**
		 * 解析替换字符串中的“{XXX}”（支持js语句）
		 * @param {String | null | undefined} str - 要解析的值
		 * @param {Object} info - 替换成的信息
		 * @returns {String | null | undefined} 解析后的值
		 */
		parse : function(str,info){
			if(str == null){
				return str;
			}else{
				return popup.parseStr(str,info);
			}
		},

		/**
		 * 解析替换字符串中换行符
		 * @param {String} [str] - 要替换的字符串
		 * @returns {String} 替换后的字符串
		 */
		parseLine : function(str){
			return str.replace(/\n/g,'<br/>');
		},

		/**
		 * 预初始化
		 * @param {Object} [opts] 参数
		 *		@key {Object} [handlers] 功能的处理函数的集合
		 *			@key {Function} [功能名称] 功能的处理函数
		 *				@tips 这里“功能名称”的有以下值：
		 *					replay 再玩一次
		 *					reload 刷新页面
		 *
		 *				处理函数的提供的信息
		 * 					@this {Dom} 按钮的dom
		 *					@param {Object} [all] 所有相关的信息
		 * 						@key {String} [type] 按钮所在的弹框类型
		 * 						@key {Object} [info] 调用popup方法时传入的弹框信息
		 * 						@key {Object} [common] 弹框的通用配置
		 * 						@key {Object} [conf] 弹框的个性化配置
		 * 						@key {Event} [e] touchend事件对象
		 *
		 *		@key {Object} [cookieObj] cookie的处理函数
		 *			@key {Function} [get] 获取cookie
		 *				@param {String} [key] key
		 *			@key {Function} [add] 设置cookie
		 *				@param {String} [key] key
		 *				@param {Any} [val] val
		 *				@param {Number} [expire] 过期时间到当前时间的毫秒数
		 *				@param {String} [path] 路径
		 *				@param {String} [domain] 域
		 *			@key {Function} [del] 删除cookie
		 *				@param {String} [key] key
		 *				@param {String} [path] 路径
		 *				@param {String} [domain] 域
		 */
		preinit : function(opts){
			popup.handlers = handlers = opts.handlers;

			//start:修改replay方法
			//TODO 用于判断是否是点击“再玩一次”触发game.start方法的全局变量，以后要换一种更好的（不使用全局变量的）方式实现
			var replay = popup.handlers.replay;
			popup.handlers.replay = function(){
				window.isPopupReplay = true;
				replay.apply(popup.handlers,arguments);
				window.isPopupReplay = false;
			};
			//end:修改replay方法

			//start:封装cookie操作
			var cookie = opts.cookieObj;
			popup.handlers.cookie = {

				/**
				 * 获取cookie
				 * @param {String} [key] key
				 */
				get : cookie.get,

				/**
				 * 设置cookie
				 * @param {String} [key] key
				 * @param {Any} [val] val
				 * @param {Number | Date} [expire = cookieExpire] 若为Number类型，则表示过期时间到当前时间的毫秒数；若为Date类型，则过期时间为该Date类型所表示的时间
				 * @param {String} [path = '/'] 路径
				 * @param {String} [domain = location.hostname] 域
				 */
				set : function(name,val,expire,path,domain){
					switch(typeof expire){
						case 'undefined':
							expire = cookieExpire;
							break;
						case 'number':
							expire = expire;
							break;
						default:
							expire = expire - new Date();
					}
					path = path || '/';
					domain = domain || location.hostname;
					cookie.add(name,val,Math.ceil(expire / (24 * 3600 * 1000)),path,domain);
				},

				/**
				 * 删除cookie
				 * @param {String} [path = '/'] 路径
				 * @param {String} [domain = location.hostname] 域
				 */
				del : function(name,path,domain){
					path = path || '/';
					domain = domain || location.hostname;
					cookie.del(name,path,domain);
				}
			};
			//end:封装cookie操作

			return popup;
		},

		/**
		 * 初始化
		 * @param {Object} allConf - 配置
		 */
		init : function(allConf){
			var DEFAULT_CONF = {

					//start:弹框的通用配置
					common : {
						/*
							弹框的通用配置参数：
								prefix : '',											活动前缀标识
								end : {													活动结束时间
									year : 2016,
									month : 1,
									day : 1,
									hour : 0,
									minute : 0,
									second : 0
								},
								preloads : [											需要预加载的弹框的图片路径（若为相对路径，则从html地址算起）
									'img/padt_p_img0.png',
									'img/padt_p_img1.png',
									'img/padt_p_img2.png'
								]
						*/

						prefix : ''
					},
					//end:弹框的通用配置

					//start:弹框的个性化配置
					/*
						弹框的个性化配置参数：
							coupon : {													弹框类型
								orders : [												弹框模块的排列顺序
									'icon',
									'title',
									'subtitle',
									'btns',
									'tips',
								],
								icon : '', 										图标类型
								title : '', 						标题（可使用“{XXX}”动态设置，可使用\n强制换行）
								subtitle : '',							副标题（可使用“{XXX}”动态设置，可使用\n强制换行）
								btns : [],								弹框所包含的按钮类型
								tips : '',							提示（可使用“{XXX}”动态设置，可使用\n强制换行）
								class : '',												要添加额外的class
								replayBtnTxt : '',										再玩一次按钮文案
								reloadBtnTxt : '',										刷新页面按钮文案
								retryBtnTxt : ''										重试按钮文案
							}

						以上属性中若icon为''；btns为null或[]则相应的dom不显示
						以上属性中title、subtitle、tips若为null，则相应的dom不显示

						弹框的类型有以下值：
							default 	所有弹框的默认配置
							miss		游戏失败

						图标类型有以下值：
							miss		游戏失败

						按钮类型有以下值：
							replay								再玩一次
							reload								刷新页面
							retry								重新
					 */
					default : {
						orders : [
							'icon',
							'title',
							'subtitle',
							'btns',
							'tips',
						],
						replayBtnTxt : '',
						reloadBtnTxt : '',
						retryBtnTxt : ''
					},
					miss : {
						icon : 'miss',
						title : '游戏失败',
						btns : ['replay']
					},
					retry : {
						icon : 'retry',
						title : '网络开小差了，重试一下！',
						btns : ['retry']
					}
					//end:弹框的个性化配置
				}, //默认配置
				type = {}; //配置中所有的type（包括common和default）
			common = extend({},DEFAULT_CONF.common,allConf.common);
			cookieExpire = (function(){
				var end = common.end,
					tmpExpire,
					expire = DEFAULT_COOKIE_EXPIRE;
				if(end){
					tmpExpire = new Date(end.year,end.month - 1,end.day,end.hour,end.minute,end.second) - new Date();
					if(tmpExpire > 0){
						expire = tmpExpire;
					}
				}
				return expire;
			})();
			$con = $(document.body);
			for(var i in DEFAULT_CONF){
				type[i] = null;
			}
			for(var i in allConf){
				type[i] = null;
			}
			for(var i in type){
				(function(type){
					if(type != 'common' && type != 'default'){

						//start:在popup上添加弹框方法
						/**
						 * 显示弹框
						 * @param {Object} [info] 弹框信息
						 *				@key {String} [cate] 类别
						 *				@key {String} [tips] 使用提示
						 *				@key {String} [cls] 类型
						 *				@key {String} [img] 图片
						 *				@key {String} [name] 名称
						 * @param {Boolean} [noAnim = false] 是否“不显示弹框动画，并使用cookie中的数据”
						 */
						popup[type] = function(info,noAnim){
							var conf = extend({},DEFAULT_CONF.default,DEFAULT_CONF[type],allConf.default,allConf[type]);

							//start:对重试弹框做特殊处理
							if(type == 'retry'){
								var retryHandler = info; //重试弹框的info参数为“点击‘重试’按钮后的处理函数”
								info = noAnim; //重试弹框的noAnim参数为“弹框的信息”（作用同普通弹框中的info）
								noAnim = arguments[2]; //重试弹框的第3个参数为“是否‘不显示弹框动画，并使用cookie中的数据’”
							}
							//end:对重试弹框做特殊处理

							if(noAnim){
								var popupInfo = handlers.cookie.get(common.prefix + capitalize(type) + 'PopupInfo');
								if(popupInfo){
									try{
										info = JSON.parse(popupInfo);
									}catch(e){}
								}
							}else if(info){
								
							}
							info = info || {};
							info.gameRet = popup.getGameRet();
							if(conf.dyn){
								conf = extend(
									conf,
									conf.dyn[
										(conf.dyn.keys || []).reduce(function(prev,cur){
											var key = info && typeof info[cur] != 'undefined' ? info[cur] : '';
											return (prev ? prev + ',' : '') + key;
										},'') || 'default'
									] || conf.dyn.default
								);
							}
							var $popup = $(TPLS.popup),
								popupDom = $popup[0],
								$content = findFromSelf($popup,'[padt-role="content"]');

							//start:设置弹框界面
							$popup.addClass('padt_p_type_' + type);
							conf.orders.forEach(function(name){
								switch(name){
									case 'icon':
										var parsedIcon = popup.parse(conf.icon,info);
										if(parsedIcon != null){
											$(TPLS.icon).addClass('padt_p_icon_' + parsedIcon).appendTo($content);
										}
										break;
									case 'title':
										var parsedTitle = popup.parse(conf.title,info);
										if(parsedTitle != null){
											findFromSelf($(TPLS.title).appendTo($content),'[padt-role="title"]').html(popup.parseLine(parsedTitle));
										}
										break;
									case 'desc':
										var parsedDesc = popup.parse(conf.desc,info);
											if(parsedDesc != null){
											findFromSelf($(TPLS.desc).appendTo($content),'[padt-role="desc"]').html(popup.parseLine(parsedDesc));
										}
										break;
									case 'subtitle':
										var parsedSubtitle = popup.parse(conf.subtitle,info);
										if(parsedSubtitle != null){
											findFromSelf($(TPLS.subtitle).appendTo($content),'[padt-role="subtitle"]').html(popup.parseLine(parsedSubtitle));
										}
										break;
									case 'btns':
										if(typeof conf.btns == 'function'){
											conf.btns = conf.btns();
										}
										if(conf.btns && conf.btns.length){

											//start:去除被设置为null的按钮
											conf.btns = conf.btns.filter(function(btnType){
												return btnType != null;
											});
											//end:去除被设置为null的按钮

											if(conf.btns && conf.btns.length){
												var $btns = $(TPLS.btns).appendTo($content);
												conf.btns.forEach(function(btnType){
													var $btn = $(TPLS.btn),
														parsedBtnTxt = popup.parse(conf[btnType + 'BtnTxt'],info);
													if(parsedBtnTxt){
														findFromSelf($btn,'[padt-role="txt"]').html(popup.parseLine(parsedBtnTxt));
													}
													$btn.addClass('padt_p_btn_' + btnType)
														.attr('padt-handler',btnType)
														.appendTo($btns);
												});
											}
										}
										break;
									case 'tips':
										var parsedTips = popup.parse(conf.tips,info);
										if(parsedTips != null){
											findFromSelf(
												$(TPLS.tipsWrap).appendTo($content),
												'[padt-role="tips"]'
											).html(popup.parseLine(parsedTips));
										}
										break;
	
								}
							});
							var parsedClass = popup.parse(conf.class,info)
							if(parsedClass){
								$popup.addClass(parsedClass);
							}
							if(noAnim){
								$popup.addClass('padt_p_no_anim');
							}
							//end:设置弹框界面

							//start:绑定点击事件
							$popup.on('touchend','[padt-handler]',function(e){
								var $that = $(this),
									handlerType = $that.attr('padt-handler');
								if(handlerType){
									var all = {
											type : type,
											info : info,
											common : common,
											conf : conf,
											e : e
										};
									[].some(function(chker){
										var match = handlerType.match(chker.re);
										if(match){
											chker.handler(match);
											return true;
										}
									});
									handlers[handlerType] && handlers[handlerType].call(this,all);
								}
							});

							//start:绑定点击关闭弹框事件
							$popup.on('touchend','[padt-handler="hide"]',function(e){
								showns.some(function(shown,idx){
									if(popupDom == shown.$dom[0]){
										showns.splice(idx,1);
										destroy(shown);
										$popup.remove();
										handlers.cookie.del(common.prefix + capitalize(type) + 'PopupInfo');
										onTapHideBtnHandler && onTapHideBtnHandler(type,$popup,e);
										onHideHandler && onHideHandler(type,$popup,true);
										return true;
									}
								});
							});
							//end:绑定点击关闭弹框事件

							//start:绑定点击重试事件
							$popup.on('touchend','[padt-handler="retry"]',function(e){
								retryHandler && retryHandler.call(this,{
									type : type,
									info : info,
									common : common,
									conf : conf,
									e : e
								});

								//start:点击“重试”按钮后隐藏界面
								showns.some(function(shown,idx){
									console.log('shows')
									if(popupDom == shown.$dom[0]){
										showns.splice(idx,1);
										destroy(shown);
										$popup.remove();
										handlers.cookie.del(common.prefix + capitalize(type) + 'PopupInfo');
										onHideHandler && onHideHandler(type,$popup,false);
										return true;
									}
								});
								//end:点击“重试”按钮后隐藏界面
							});
							//end:绑定点击重试事件
							//end:绑定点击事件

							//start:显示掉落动画后清除animation属性（避免“部分ios系统中跳转页面返回后会再次播放animation动画”的问题）
							$popup.on(prefix.aniEnd,function(e){
								if(e.animationName == 'padtPContentShow'){
									$popup.addClass('padt_p_no_anim');
								}
							});
							//end:显示掉落动画后清除animation属性（避免“部分ios系统中跳转页面返回后会再次播放animation动画”的问题）

							//start:阻止默认事件（例如：滚动等）
							$popup.on('touchstart',function(e){
								if(!$(e.target).closest('[padt-npd]').length){ //padt-npd的dom不会阻止默认事件
									e.preventDefault();
								}
							});
							//end:阻止默认事件（例如：滚动等）

							//start:记录弹框的显示顺序
							showns.some(function(shown,idx){
								if(popupDom == shown.$dom[0]){
									showns.splice(idx,1);
									return true;
								}
							});
							showns.push({
								type : type,
								$dom : $popup,
							});
							//end:记录弹框的显示顺序

							//start:在cookie中记录info
							if(!noAnim){
								var toRecord = extend({},info); //要记录的info
								delete toRecord.info; //不在info中记录游戏结果数据
								if(toRecord && !$.isEmptyObject(toRecord)){
									handlers.cookie.set(common.prefix + capitalize(type) + 'PopupInfo',JSON.stringify(toRecord),0);
								}
							}
							//end:在cookie中记录info

							$popup.appendTo($con);
							onShowHandler && onShowHandler(type,info,noAnim,$popup);
							return popup;
						};

						/**
						 * 隐藏弹框
						 */
						popup['hide' + capitalize(type)] = function(){
							showns.some(function(shown,idx){
								if(type == shown.type){
									showns.splice(idx,1);
									destroy(shown);
									shown.$dom.remove();
									handlers.cookie.del(common.prefix + capitalize(shown.type) + 'PopupInfo');
									onHideHandler && onHideHandler(shown.type,shown.$dom,false);
									return true;
								}
							});
							return popup;
						};
						//end:在popup上添加弹框方法
					}
				})(i);
			}


			//start:预加载弹框资源
			(function(){

				/**
				 * 预加载弹框资源
				 */
				popup.preload = function(){
					var preloads = common.preloads;
					if(preloads && preloads.length){
						var htmlArr = [];
						preloads.forEach(function(url){
							htmlArr.push('<p class="padt_p_preload" style="background-image:url(' + url + ');"></p>');
						});
						$con.append(htmlArr.join(''));
					}
					return popup;
				};
			})();
			//end:预加载弹框资源

			//start:游戏结果相关
			(function(){

				/**
				 * 获取游戏结果
				 * @return {Object} 游戏结果
				 */
				popup.getGameRet = function(){
					var gameRet = handlers.cookie.get(common.prefix + 'GameRet');
					if(gameRet){
						try{
							return JSON.parse(gameRet);
						}catch(e){}
					}
					return {};
				};

				/**
				 * 记录游戏结果
				 */
				popup.setGameRet = function(gameRet){
					handlers.cookie.set(common.prefix + 'GameRet',JSON.stringify(gameRet));
					return popup;
				};

				/**
				 * 记录游戏结果属性
				 * @param {String | Object} key - 要记录的属性名或“要记录的属性名和属性值”组成的对象
				 * @param {Any} val - 要记录的属性值（仅当key为“要记录的属性名”时有效）
				 */
				popup.setGameRetProp = function(key,val){
					var gameRet = popup.getGameRet();
					if(typeof key == 'string'){
						gameRet[key] = val;
					}else{
						for(var i in key){
							gameRet[i] = key[i];
						}
					}
					return popup.setGameRet(gameRet);
				};
			})();
			//start:游戏结果相关



			//start:调用handlers
			for(var i in handlers){
				(function(handlerType){
					switch(handlerType){
						default:

							/**
							 * 调用
							 * @param {String} [type = ''] - 调用的类型
							 */
							popup['call' + capitalize(handlerType)] = function(type){
								handlers[handlerType]({
									type : type || ''
								});
								return popup;
							};
					}
				})(i);
			}
			//end:调用handlers
			return popup;
		},

		/**
		 * 隐藏弹框
		 * @param {Boolean} [hideAll = false] 是否隐藏所有弹框
		 *		@tips 若为false则依次隐藏当前弹框
		 */
		hide : function(hideAll){
			showns.some(function(shown){
				destroy(shown);
				shown.$dom.remove();
				handlers.cookie.del(common.prefix + capitalize(shown.type) + 'PopupInfo');
				onHideHandler && onHideHandler(shown.type,shown.$dom,false);
				return !hideAll;
			});
			showns = [];
			return popup;
		},

		/**
		 * 当显示弹框时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Object} [info] 调用弹框时传入的“弹框信息”参数
		 *		@param {Boolean} [noAnim = false] 调用弹框时传入的“不显示弹框动画”参数
		 *		@param {Zepto} [$popup] 弹框的dom
		 */
		onShow : function(handler){
			onShowHandler = handler;
			return popup;
		},

		/**
		 * 当隐藏弹框时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Zepto} [$popup] 弹框的dom
		 *		@param {Boolean} [fromHideBtn] 是否是由点击隐藏按钮触发的
		 */
		onHide : function(handler){
			onHideHandler = handler;
			return popup;
		},

		/**
		 * 当点击隐藏按钮时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Zepto} [$popup] 弹框的dom
		 *		@param {Event} [e] 事件对象
		 */
		onTapHideBtn : function(handler){
			onTapHideBtnHandler = handler;
			return popup;
		},

		/**
		 * 设置$con
		 * @param {Zepto} [_$con] 设置后的$con
		 */
		set$con : function(_$con){
			$con = _$con;
			return popup;
		},
	};

module.exports = popup;
