/**
 * Created by lim on 2016/7/18.
 */
'use strict';
var lm = {};
(function () {
  /**
   * 通过class获得elements
   * @param node
   * @param className
   * @returns {*}
   */
  lm.getElementsByClassName = function (node, className) {
    if (node.getElementsByClassName) {
      return node.getElementsByClassName(className);
    } else {
      var results = [];
      var elems = node.getElementsByTagName("*");
      for (let i = 0; i < elems.length; i++) {
        if (elems[i].className.indexOf(className) != -1) {
          results.push(elems[i]);
        }
      }
      return results;
    }
  };
  /**
   * 设置cookie
   * @param name
   * @param value
   * @param validTime 毫秒
   */
  lm.setCookie = function (name, value, validTime) {
    validTime = validTime === undefined ? 24 * 60 * 60 * 1000 : validTime;
    var date = new Date();
    date.setTime(date.getTime() + validTime);
    document.cookie = name + "=" + escape(value) + ";expires=" + date.toGMTString();
  };
  /**
   * 获得cookie
   * @param name
   */
  lm.getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
      return unescape(arr[2]);
    else
      return null;
  };
  /**
   * 删除cookie
   * @param name
   */
  lm.delCookie = function (name) {
    var date = new Date();
    date.setTime(date.getTime() - 1);
    var cval = lm.getCookie(name);
    if (cval != null)
      document.cookie = name + "=" + cval + ";expires=" + date.toGMTString();
  };
  /**
   * 设置本地存储，若浏览器不支持则使用cookie
   * @param key
   * @param value
   * @param validTime 毫秒
   */
  lm.setItem = function (key, value, validTime) {
    if (value && value !== "undefined") {
      if (window.localStorage) {
        window.localStorage.setItem("lm_" + key, value);
      }
      else {
        validTime = validTime === undefined ? 24 * 60 * 60 * 1000 : validTime;
        var date = new Date();
        date.setTime(date.getTime() + validTime);
        document.cookie = key + "=" + escape(value) + ";expires=" + date.toGMTString();
      }
    } else {
      lm.delItem(key);
    }
  };
  /**
   * 获得本地存储
   * @param key
   * @returns {*}
   */
  lm.getItem = function (key) {
    var result;
    if (window.localStorage) {
      result = window.localStorage.getItem("lm_" + key);
    } else {
      var arr = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
      if (arr != null) {
        result = unescape(arr[2]);
      }
    }
    if (result && result !== "undefined") {
      return result;
    }
    return undefined;
  };
  /**
   * 删除本地存储
   * @param key
   * @returns {*}
   */
  lm.delItem = function (key) {
    if (window.localStorage) {
      window.localStorage.removeItem("lm_" + key);
    } else {
      var date = new Date();
      date.setTime(date.getTime() - 1);
      var value = lm.getItem(key);
      if (value != null) {
        document.cookie = key + "=" + value + ";expires=" + date.toGMTString();
      }
    }
  };
  /**
   * html标签编码
   * @param str
   * @returns {string}
   */
  lm.htmlEncode = function (str) {
    if (!str || str.length == 0) return "";
    str = str.toString();
    str = str.replace(/&/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/ /g, "&nbsp;");
    str = str.replace(/\'/g, "&#39;");
    str = str.replace(/\"/g, "&quot;");
    str = str.replace(/\n/g, "<br>");
    return str;
  };
  /**
   * html标签解码
   * @param str
   * @returns {string}
   */
  lm.htmlDecode = function (str) {
    if (str.length == 0) return "";
    str = str.replace(/&gt;/g, "&");
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&nbsp;/g, " ");
    str = str.replace(/&#39;/g, "\'");
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/<br>/g, "\n");
    return str;
  };
  /**
   * 删除字符串两边空格
   * @param str
   * @returns {void|string|XML}
   */
  lm.trim = function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  };
  /**
   * 删除字符串左边空格
   * @param str
   * @returns {void|string|XML}
   */
  lm.ltrim = function (str) {
    return str.replace(/(^\s*)/g, "");
  };
  /**
   * 删除字符串右边空格
   * @param str
   * @returns {void|string|XML}
   */
  lm.rtrim = function (str) {
    return str.replace(/(\s*$)/g, "");
  };
  /**
   * 合并对象
   * @param {Object} obj
   * @param {Object} objDefault
   * @returns {Object}
   */
  lm.extend = function (obj, objDefault) {
    if (typeof objDefault != 'object' || typeof obj != 'object') {
      return {};
    }
    for (let key in objDefault) {
      if (!obj[key]) {
        obj[key] = objDefault[key];
      }
    }
    return obj;
  };
  /**
   * ajax
   * @param {Object}obj
   * @param callback
   * @returns {*}
   */
  lm.ajax = function (obj, callback) {
    var objDefault = {
      url: '',
      type: 'get',
      dataType: 'json',
      async: true,
      data: null
    };
    obj = lm.extend(obj, objDefault);
    if (!obj.url) {
      return false;
    }
    var xmlhttp;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    }
    else {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open(obj.type, obj.url, obj.async);
    if (obj.type == 'post') {
      xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    } else if (obj.type == 'get') {
    }
    if (obj.async) {
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          callback(eval('(' + xmlhttp.responseText + ')'));
        }
      }
    } else {
      callback(eval('(' + xmlhttp.responseText + ')'));
    }
    xmlhttp.send(obj.data);
  };
  lm.dialog = {
    /**
     * 提示,添加元素并设置id为lm-dialog-notice即可
     * @param content
     * @param flag
     */
    notice: function (content, flag) {
      if (document.getElementById('lm-dialog-notice')) {
        return;
      }
      content = typeof content === 'undefined' || content === '' ? '操作成功!' : content;
      var div = document.createElement('div');
      if (content === false) {
        content = '操作失败！';
        div.style.boxShadow = '0 0 10px red';
      }
      div.innerHTML = content;
      div.id = 'lm-dialog-notice';
      if (flag === true) {
        div.style.boxShadow = '0 0 10px green';
      } else if (flag === false) {
        div.style.boxShadow = '0 0 10px red';
      } else {
        div.style.boxShadow = '0 0 10px #666';
      }
      document.body.appendChild(div);
      setTimeout(function () {
        document.body.removeChild(div);
      }, 2000);
    }
  };
  lm.date = {
    /**
     * 日期格式化：YYYY/yyyy/YY/yy:年份 MM/M:月份 W/w:星期 dd/DD/d/D:日期 hh/HH/h/H:时间 mm/m:分钟 ss/SS/s/S:秒
     * @param {Date} date
     * @param formatStr
     * @returns {String}
     */
    formatDate: function (date, formatStr) {
      var Week = ['日', '一', '二', '三', '四', '五', '六'];
      formatStr = formatStr.replace(/yyyy|YYYY/, date.getFullYear());
      formatStr = formatStr.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));
      formatStr = formatStr.replace(/MM/, (date.getMonth() + 1) > 9 ? (date.getMonth() + 1).toString() : '0' + (date.getMonth() + 1));
      formatStr = formatStr.replace(/M/g, (date.getMonth() + 1));
      formatStr = formatStr.replace(/w|W/g, Week[date.getDay()]);
      formatStr = formatStr.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
      formatStr = formatStr.replace(/d|D/g, date.getDate());
      formatStr = formatStr.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
      formatStr = formatStr.replace(/h|H/g, date.getHours());
      formatStr = formatStr.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
      formatStr = formatStr.replace(/m/g, date.getMinutes());
      formatStr = formatStr.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
      formatStr = formatStr.replace(/s|S/g, date.getSeconds());
      formatStr = formatStr.replace(/ttt/, date.getMilliseconds() > 99 ? date.getMilliseconds().toString() : '00' + date.getMilliseconds());
      formatStr = formatStr.replace(/tt/, date.getMilliseconds() > 9 ? date.getMilliseconds().toString() : '0' + date.getMilliseconds());
      formatStr = formatStr.replace(/t/g, date.getMilliseconds());
      return formatStr;
    },
    /**
     * 距离当前时间 用于聊天显示等
     * @param timestamp 秒
     * @returns {String}
     */
    timeCalculate: function (timestamp) {
      var now = new Date().getTime() / 1000;
      var minutes = parseInt((now - timestamp) / 60);
      if (minutes <= 0) {
        return '刚刚';
      } else if (minutes < 60) {
        return minutes + '分钟前';
      } else if (minutes >= 60 && minutes < 1440) {
        return parseInt(minutes / 60) + '小时前';
      } else {
        return parseInt(minutes / 1440) + '天前';
      }
    }
  };
  lm.getQueryString = function (name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
  }
})();
window.lm = lm;
