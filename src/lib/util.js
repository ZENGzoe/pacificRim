/**
 * 工具类
 */


var util = module.exports = {

	/**
	 * 延迟函数
	 * @param  {Function} fn    [description]
	 * @param  {[type]}   delay [description]
	 * @return {[type]}         [description]
	 */
	delay: function(fn, delay) {
		return setTimeout(function() {
			fn();
		}, (typeof delay === 'number' && delay) || 80);
	},

	/**
	 * 地址添加参数
	 * @param {[type]} name  [description]
	 * @param {[type]} value [description]
	 */
	addParamToUrl: function(url, name, value) {
        var currentUrl = url.split('#')[0];//window.location.href.split('#')[0];
        if (/\?/g.test(currentUrl)) {
            if (/name=[-\w]{4,25}/g.test(currentUrl)) {
                currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
            } else {
                currentUrl += "&" + name + "=" + value;
            }
        } else {
            currentUrl += "?" + name + "=" + value;
        }
        if (window.location.href.split('#')[1]) {
            return currentUrl + '#' + window.location.href.split('#')[1];
        } else {
            return currentUrl;
        }
    },

    /**
	 * 获取地址参数
	 * @param  {[type]} url [description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	queryString: function(key) {
		var result = new RegExp('[\\?&]' + key + '=([^&#]*)', 'i').exec(window.location.href);
		return result && decodeURIComponent(result[1]) || '';
	},
}