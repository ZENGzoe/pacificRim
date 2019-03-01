/** @module prefix */
	
	/**
	 * @namespace prefix
	 *		@property {String} ani - animation驼峰属性名
	 *		@property {String} ani2 - animation短横线属性名
	 *		@property {String} aniStart - animationStart事件名
	 *		@property {String} aniIteration - animationIteration事件名
	 *		@property {String} aniEnd - animationEnd事件名
	 *		@property {String} per - perspective驼峰属性名
	 *		@property {String} per2 - perspective短横线属性名
	 *		@property {String} tsf - transform驼峰属性名
	 *		@property {String} tsf2 - transform短横线属性名
	 *		@property {String} tsi - transition驼峰属性名
	 *		@property {String} tsi2 - transition短横线属性名
	 *		@property {String} tsiEnd - transitionEnd事件名
	 */
var prefix = {},
	style = document.documentElement.style,

	/**
	 * 首字母大写
	 * @param {String} str - 要首字母大写的字符串
	 * @returns {String} 首字母大写后的字符串
	 */
	capitalize = function(str){
		return str.replace(/^./,function(str){
			return str.toUpperCase();
		});
	};
[{
	ab : 'ani',
	prop : 'animation',
	relates : ['Start','Iteration','End']
},{
	ab : 'per',
	prop : 'perspective'
},{
	ab : 'tsf',
	prop : 'transform'
},{
	ab : 'tsi',
	prop : 'transition',
	relates : ['End']
}].forEach(function(chk){
	var ab = chk.ab,
		prop = chk.prop,
		relates = chk.relates,
		capitalizedProp = capitalize(prop);
	if(prop in style){
		prefix[ab] = prefix[ab + '2'] = prop;
		relates && relates.forEach(function(relate){
			prefix[ab + relate] = prop + relate.toLowerCase();
		});
	}else{
		prefix[ab] = 'webkit' + capitalizedProp;
		prefix[ab + '2'] = '-webkit-' + prop;
		relates && relates.forEach(function(relate){
			prefix[ab + relate] = 'webkit' + capitalizedProp + relate;
		});
	}
});

module.exports = prefix;