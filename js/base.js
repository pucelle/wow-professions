//因为各个浏览器都随着升级而不断变化.所以尽量使用其他方式做浏览器的差异判断
window.browser = {
    ie:	/\bMSIE\b/.test(navigator.userAgent),
	ie6:/\bMSIE ?6\.0/.test(navigator.userAgent),
	ch: /\bChrome\b/.test(navigator.userAgent),
	ff:	/\bFirefox\b/.test(navigator.userAgent),
    op:	/\bOpera\b/.test(navigator.userAgent),
    sf:	/\bSafari\b/.test(navigator.userAgent),
	vs: parseFloat(navigator.appVersion)
};

String.prototype.originalsplit = String.prototype.split;
String.prototype.split = function(s){
	if(this.length === 0)
		return [];
	else
		return this.originalsplit(s);
};

var hasclass = function(e, c){
	return new RegExp("(?:^| )"+c+"(?= |$)").test(e.className);
};
var addclass = function(e, c){
	if(!hasclass(e, c)) e.className = e.className ? e.className+" "+c : c;
};
var removeclass = function(e, c){
	var newclass = e.className.replace(new RegExp("(?:^| )"+c+"(?= |$)"), "");
	if(newclass !== e.className) e.className = newclass;
};

var each = function(obj, fn){
//数组和表统一的递归调用
	if(typeof obj!=="object" || typeof fn!=="function") return;
	if(obj.constructor === Array){
		for(var i=0; i<obj.length; i++){
			fn(i, obj[i]);
		}
	}else{
		for(var i in obj){
			fn(i, obj[i]);
		}
	}
};

var counting = function(nm, fn){
//在被调用nm次之后调用fn
	var c = 0;
	return function(){
		if(++c===nm && typeof fn==="function") fn();
	}
}

var domloaded = function(){
//入口函数,用于替代window.onload,当文档模型载入时回调fn,可以放入多个事件
	var eventList = [];
	var startEvent = function(){
	//触发事件,被触发的函数的作用域归属于定义其的地方
		for(var i=0; i<eventList.length; i++)
			if(typeof eventList[i] === "function")
			eventList[i]();
	};
	
	/*以下部分用于注册事件*/
	if (document.addEventListener)
	/*非IE*/
		document.addEventListener("DOMContentLoaded", startEvent, null);
	else if(browser.ie){
	//IE
		document.onreadystatechange = function(){
			if(document.readyState==="loaded" || document.readyState==="complete"){
				this.onreadystatechange = null;
				startEvent();
			}
		}
	}else{
	//主流的5类浏览器不会进行到这里
		window.onload = startEvent;
	}
	
	/*返回添加event的函数供外部访问*/
	return function(fn){
		eventList.push(fn);
	}
}();


store = {
	set: function(name, value){
		localStorage.setItem(name, JSON.stringify(value))
	},
	get: function(name){
		try{
			return JSON.parse(localStorage.getItem(name))
		}
		catch (_err) {
			return null
		}
	},
	delete: function(name){
		localStorage.removeItem(name)
	}
}


var loadxml = function(xmlsrc, fn){
//xml载入函数,返回文档的根节点.在载入之后回调fn
	if(typeof xmlsrc === "string"){
		xmlsrc = [xmlsrc];
		async = false;
	}else
		async = true;
	
	var IECheckState = function(){	//奇怪的问题,IE下无法捕获this.readyState.只好使用这种计时方式,每16ms一次
		var c = 0;
		each(xmlsrc, function(i){
			if(xmlhttp[i].readyState !== 4)
				return;
			else c++;
		});
		if(c < l) return;
		window.clearInterval(clock);
		each(xmlsrc, function(i){
			xmldoc[i] = xmlhttp[i].documentElement;
		});
		if(typeof fn === "function") fn(xmldoc);
	};
	
	var NotIECheckState = function(){	//奇怪的问题,IE下无法捕获this.readyState.只好使用这种计时方式,每16ms一次
		if(this.readyState === 4){
			if(++c === l){
				each(xmlsrc, function(i){
						xmldoc[i] = xmlhttp[i].responseXML.documentElement; 
				});
				if(typeof fn === "function") fn(xmldoc);
			}
		}
		
	};
	
	if(xmlsrc.constructor === Array){
		var l = xmlsrc.length;
		var xmlhttp = [];
		var xmldoc = [];
	}else{
		var l = 0;
		each(xmlsrc, function(){l++;});
		var xmlhttp = {};
		var xmldoc = {};
	}
	
	try{
		each(xmlsrc, function(i){
			if(browser.ie){	//IE7
				xmlhttp[i] = new ActiveXObject("Msxml2.DOMDocument");
				xmlhttp[i].setProperty("SelectionLanguage", "XPath");
				xmlhttp[i].async = async;
				xmlhttp[i].load(xmlsrc[i]);
				if(!async) xmldoc = xmlhttp[i].documentElement;
			}else{
				xmlhttp[i] = new window.XMLHttpRequest();
				if(async) xmlhttp[i].onreadystatechange = NotIECheckState;
				xmlhttp[i].open("GET", xmlsrc[i], async);
				xmlhttp[i].send(null);
				if(!async) xmldoc = xmlhttp[i].responseXML.documentElement;
			}
		});
		
		if(!async) return xmldoc;
		
		if(async && browser.ie){
			var clock = window.setInterval(IECheckState, 16);
		}else if(async)
			var c = 0;
		
		return xmldoc;
		
	}catch(e){
		alert("您的浏览器无法载入 XML 文件");
		return null;
	}

};


var loadtxt = function(xmlsrc, fn){
//xml载入函数,返回文档的根节点.在载入之后回调fn
	if(typeof xmlsrc === "string"){
		xmlsrc = [xmlsrc];
		async = false;
	}else
		async = true;
	
	var IECheckState = function(){	//奇怪的问题,IE下无法捕获this.readyState.只好使用这种计时方式,每16ms一次
		var c = 0;
		each(xmlsrc, function(i){
			if(xmlhttp[i].readyState !== 4)
				return;
			else c++;
		});
		if(c < l) return;
		window.clearInterval(clock);
		each(xmlsrc, function(i){
				txtdoc[i] = xmlhttp[i].responseText;
		});
		if(typeof fn === "function") fn(txtdoc);
	};
	
	var NotIECheckState = function(){	//奇怪的问题,IE下无法捕获this.readyState.只好使用这种计时方式,每16ms一次
		if(this.readyState === 4){
			if(++c === l){
				each(xmlsrc, function(i){
						txtdoc[i] = xmlhttp[i].responseText; 
				});
				if(typeof fn === "function") fn(txtdoc);
			}
		}
	};
	
	if(xmlsrc.constructor === Array){
		var l = xmlsrc.length;
		var xmlhttp = [];
		var txtdoc = [];
	}else{
		var l = 0;
		each(xmlsrc, function(){l++;});
		var xmlhttp = {};
		var txtdoc = {};
	}
	
	try{
		each(xmlsrc, function(i){
			if(browser.ie){	//IE7
				xmlhttp[i] = new ActiveXObject("Msxml2.XMLHTTP");
			}else{
				xmlhttp[i] = new window.XMLHttpRequest();
				if(async) xmlhttp[i].onreadystatechange = NotIECheckState;
			}
			xmlhttp[i].open("GET", xmlsrc[i], async);
			xmlhttp[i].send(null);
		});
		
		if(!async){
			return xmlhttp[0].responseText;
			
		}if(browser.ie)
			var clock = window.setInterval(IECheckState, 16);
		else
			var c = 0;
			
		return txtdoc;
	}catch(e){
		alert("载入文本失败");
		return null;
	}
};

var xpath = {
//查询xml节点
	find : function(contextNode, xpathString){
	//查找头一个元素
		if(!contextNode || !xpathString)
			return null;
		if(window.ActiveXObject){
			return contextNode.selectSingleNode(xpathString);
		}else{
			var xpe = new XPathEvaluator().evaluate(xpathString, contextNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			if(xpe)
				return xpe.iterateNext();
			else
				return null;
		}
	},
	findall : function(contextNode, xpathString){
	//查找所有元素,返回一个节点集或者数组
		if(!contextNode || !xpathString)
			return [];
		if(window.ActiveXObject)
			return contextNode.selectNodes(xpathString);
		else{
			var nodes = [];
			var xpe = new XPathEvaluator().evaluate(xpathString, contextNode, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			if(!xpe)
				return nodes;
			var node;
			while(node = xpe.iterateNext()){
				nodes.push(node);
			}
		}
		return nodes;
	},
	findvalue : function(contextNode, xpathString){
	//返回节点的nodeValue
		if(!contextNode || !xpathString)
			return "";
		var node = this.find(contextNode, xpathString);
		if(node && node.nodeValue)
			return node.nodeValue;
		else
			return "";
	},
	findvalues : function(contextNode, xpathString){
	//返回所有节点的nodeValue组成的数组
		if(!contextNode || !xpathString)
			return [];
		var nodes = this.findall(contextNode, xpathString);
		var stringArray = [];
		for(var i=0; i<nodes.length; i++){
			if(nodes[i] && nodes[i].nodeValue)
				stringArray.push(nodes[i].nodeValue);
		}
		return stringArray;
	}
};
