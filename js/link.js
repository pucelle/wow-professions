var Downloaded = (function(){
//一个用于在数据加载过程中取代title的函数
	var OriginalTitle = document.title;
	var TitleSetCount = 0;
	var Downloading = function(){
		if(TitleSetCount >= 0) document.title = "正在下载数据" + "...".slice(0, TitleSetCount++ % 4);
	}
	var FinishDownload = function(){
		window.clearInterval(DownloadClock);
		TitleSetCount = -1;	//IE下,即使清除interval,还是会被调用至少一次.
		document.title = OriginalTitle;
	}
	var DownloadClock = window.setInterval(Downloading, 500);
	return FinishDownload;
})();

var MouseoutDelay = function(e1, e2){
//将两个元素绑定起来,使得当鼠标离开所有元素指定时间之后,才将e2隐藏起来.e2必须由e1包裹
	var e1over;
	
	var DelayDisappear = function(){
		if(!e1over)
			e2.style.display = "none";
	}
	
	e1.onmouseover = function(){
		e1over = true;
		e2.style.display = "block";
	}
	
	e1.onmouseout = function(){
		e1over = false;
		window.setTimeout(DelayDisappear, 500);
	}
};


//基本所有的方法都通过call调用
var linkProfession = function(current){
//用于生成头部的专业技能链接,href为链接地址,active加一个其他的边框
	var iconarray = [62734,2550,3908,2108,2018,7411,2259,4036,25229,45357];
	var hrefarray = ["fishing.html","cooking.html","tailoring.html","leatherworking.html","blacksmithing.html","enchanting.html","alchemy.html","engineering.html","jewelcrafting.html","inscription.html"];
	var html = [];
	for(var i=0; i<iconarray.length; i++){
		html.push('<div class="icon" style="background-image:url(\''+iconpath);
		var xn = xpath.find(wowtip.data["spell"], "spell[@id='"+iconarray[i]+"']");
		html.push(xn.getAttribute("icon")+'.jpg\')" ');
		html.push(" onmouseover=\"wowtip.show(this,'spell',"+iconarray[i]+',1,2)"');
		//tip弹出位置:右下
		html.push('" onmouseout="wowtip.hide()">');
		if(i === current)
			html.push('<div class="icon-medal"><a href="'+hrefarray[i]+'"></a></div></div>');
		else
			html.push('<div class="icon-border"><a href="'+hrefarray[i]+'"></a></div></div>');
	}
	document.getElementById("skills").innerHTML = html.join("");
};


var ErrorCount = 0;

var link = {
	ix : function(tp, ix){
	//处理一条type, id数据,生成一个包含id,xn的数组
		if(typeof ix !== "object"){
			var xn = xpath.find(wowtip.data[tp], tp+"[@id='"+ix+"']");
			if(!xn){
				if(ErrorCount++ < 5)
					alert("数据缺失:"+tp+":"+ix);
				return null;
			}
			var id = ix;
			return [id, xn];
		}else{
			ix[1] = ix[1] || xpath.find(wowtip.data[tp], tp+"[@id='"+ix[0]+"']");
			if(!ix[1]) return null;
			ix[0] = ix[0] || ix[1].getAttribute("id");
			return ix;
		}
	},
	icon : function(tp, ix, count, iconID){
		//提供用于数据链接的图标,count为右下角的数字,当为+-1时不显示,xn为节点,当xn不为空时,不用再次查询
		//iconID用于为div.icon注册id,以响应一些触发事件
		if(!(ix = link.ix(tp, ix))) return this;
		var id = ix[0], xn = ix[1];
		this.push('<div'+(iconID ? ' id="'+iconID+'"' : '')+' class="icon" style="background-image:url(\''+iconpath);
		this.push(xn.getAttribute("icon")+'.jpg\')"');
		this.push(' onmouseover="wowtip.show(this,\''+tp+"',"+id+')"');
		this.push(' onmouseout="wowtip.hide()">');
		this.push('<div class="icon-border"><a href="javascript:"></a></div>');
		if(count && count!=="1" && count!=="-1"){
			this.push('<div class="stroke">');
			this.push('<span class="shadow" style="top:1px">'+count+'</span>');
			this.push('<span class="shadow" style="top:-1px">'+count+'</span>');
			this.push('<span class="shadow" style="left:1px">'+count+'</span>');
			this.push('<span class="shadow" style="left:-1px">'+count+'</span>');
			this.push('<span class="stack">'+count+'</span>');
			this.push('<span class="stance">'+count+'</span></div>');	/*用来占位,以帮助stroke确定位置的*/
		}
		this.push('</div>');
		return this;
	},
	name : function(tp, ix, ac, px, py){
	//提供用于一个名称,用以链接各类数据
	//ac为给名称添加的额外样式,地图与道具名称也可以指定样式,但如果不指定二者,则设为默认值
		if(!(ix = link.ix(tp, ix))) return this;
		var id = ix[0], xn = ix[1];
		this.push("<span onmouseover=\"wowtip.show(this,'"+tp+"',"+id+(typeof px!=="undefined" ? ","+px : "")+(py ? ","+py : "")+')"');
		this.push(' onmouseout="wowtip.hide()"');
		this.push(' class="'+tp+"-name"+(ac ? " "+ac : (tp==="map" ? " cur-direction" : tp==="object" ? " cur-interact" : "")));
		if(xn && tp === "item"){
		//对于物品,改变颜色
			this.push(" q"+(xn.getAttribute("quality") || "1")+'">');
		}else if(xn && tp === "npc"){
		//对于npc,改变颜色
			this.push(" a"+(xn.getAttribute("A")||"0")+" h"+(xn.getAttribute("H")||"0")+'">');
		}else if(xn && tp === "quest"){
		//对于任务,改变颜色
			this.push(" side"+xn.getAttribute("side")+'">');
		}else{
			this.push('">');
		}
		this.push(xpath.findvalue(xn, "name/text()"));
		//this.push("("+id+")");
		this.push('</span>');
		if(xn && tp === "npc"){
		//输出npc的精英级别
			var npctype = xn.getAttribute("type");
			if(npctype)
				this.push(' <span class="q0"><b>&lt;</b>'+npctype+"<b>&gt;</b></span>");
		}
		this.push('');
		return this;
	},
	IN : function(tp, ix, count, iconID){
		//生成icon name
		if(!(ix = link.ix(tp, ix))) return this;
		var id = ix[0], xn = ix[1];
		this.push('<div>');	//添加一个外层div,保证name和icon的相对高度
		link.icon.call(this, tp, [id,xn], count, iconID);
		this.push('<div class="icon-name">');
		this.push('<span class="'+tp+'-name');
		if(xn && tp === "item"){
		//对于物品,改变颜色
			this.push(' q'+(xn.getAttribute("quality") || "1")+'');
		}
		var screenshot = xpath.findvalues(xn, "screenshot/text()");

		screenshot = wowtip.screenshotFix[tp] && wowtip.screenshotFix[tp][id] ? [wowtip.screenshotFix[tp][id]] : screenshot;

		if(screenshot.length > 0){
			this.push(' bold" onmouseover="wowtip.showscreenshot(this,['+screenshot.join(",")+'])" onmouseout="wowtip.hide()">');
		}else{
			this.push('">');
		}
		this.push(xpath.findvalue(xn, "name/text()"));
		//this.push("("+id+")");
		this.push('</span>');
		this.push("</div></div>");
		return this;
	},
	screenshot : function(tp, ix){
	//根据截图的id显示截图
		if(!(ix = link.ix(tp, ix))) return this;
		var id = ix[0], xn = ix[1];
		this.push('<span class="screenshot-name" onmouseover="wowtip.showscreenshot(this,['+xpath.findvalues(xn, "screenshot/text()").join(",")+'])" onmouseout="wowtip.hide()">截图</span>');
		return this;
	},
	NS : function(tp, ix){
	//显示物品以及截图
		if(!(ix = link.ix(tp, ix))) return this;
		this.push(link.name.call(this, tp, ix));
		var ss = xpath.findvalues(ix[1], "screenshot/text()");
		if(ss.length > 0){
			this.push("&nbsp;--&nbsp;");
			this.push('<span class="screenshot-name" onmouseover="wowtip.showscreenshot(this,['+ss.join(",")+'])" onmouseout="wowtip.hide()">截图</span>');
		}
		return this;
	},
	map : function(tp, ix){
	//链接npc或者object所在的所有地图以及坐标
	//地图得指向鼠标样式固定为cur-direction
		if(!(ix = link.ix(tp, ix))) return this;
		var id = ix[0], xn = ix[1];
		//查询所在的所有地图和坐标
		var coords = xpath.findall(xn, "coords");
		for(var i=0; i<coords.length; i++){
			//var arr = [];
			var mid = coords[i].getAttribute("map");	//每个地图的id
			this.push('<span class="map-name cur-direction"');
			this.push(' onmouseover="wowtip.showcoords(this,\''+tp+"',"+id+",'"+mid+'\')"');//+(px ? ","+px : "")+(py ? ","+py : "")+
			this.push(' onmouseout="wowtip.hide()">');
			this.push(xpath.findvalue(xpath.find(wowtip.data["map"], "map[@id='"+mid+"']"), "name/text()"));
			this.push('</span>');
			if(i < coords.length-1){
				if(coords.length>4 && i===1){
					this.push("<b>...</b>");
					break;
				}else
					this.push("<b>,</b>&nbsp;");
			}
			//this.push(arr.join(""));
		}
		return this;
	},
	
	NM : function(tp, ix, as){
	//生成name -- map
		if(!(ix = link.ix(tp, ix))) return this;
		link.name.call(this, tp, ix, as, "0");
		this.push("&nbsp;--&nbsp;");
		link.map.call(this, tp, ix);
		//this.push(link.map.call([], tp, ix).join("<b>,</b>&nbsp;"));
		return this;
	},
	/*
	NMT : function(tp, ix, as){
	//map table,
		if(!(ix = link.ix(tp, ix))) return this;
		var maps = link.map.call([], tp, ix);
		if(maps.length > 1){
			alert(maps.length)
			this.push("<table>");
			this.push('<tr><td rowspan="'+maps.length+'">');
			link.name.call(this, tp, ix, as, "0");
			this.push("&nbsp;--&nbsp;");
			this.push("</td>");
			for(var i=0; i<maps.length && i<4; i++){
				if(i > 0)
					this.push("<tr>");
				this.push("<td>");
				this.push(maps[i]);
				this.push("</td></tr>");
			}
			this.push("</table>");
		}else{
			link.name.call(this, tp, ix, as, "0");
			this.push("&nbsp;--&nbsp;");
			this.push(maps[0]);
		}
		return this;
	},*/
	//以下生成的皆为块数据
	
	npcTable : function(ids, ac){
	//显示多个NPC的名称以及所在地图,这些npc将会按照所选阵营按照table结构排列
	//ac为给npc名称添加的额外样式
	//ids为一个id序列
		var arr = [[], [], [], []];
		if(store.get("camp") === "horde")
			var camp = "H";
		else
			var camp = "A";
		for(var i=0; i<ids.length; i++){
			var id = ids[i];
			var xn = xpath.find(wowtip.data["npc"], "npc[@id='"+id+"']");
			//if(!xn){
			//	alert(id);
			//	continue;
			//}
			var cm = xn.getAttribute(camp) || "0";
			arr[cm].push("<tr><th>");
			link.name.call(arr[cm], "npc", [id,xn], ac, "0");
			arr[cm].push('&nbsp;--&nbsp;</th><td>');
			link.map.call(arr[cm], "npc", [id,xn]);
			arr[cm].push("</td></tr>");
		}
		this.push("<table>");
		this.push(arr[2].join(""));
		this.push(arr[1].join(""));
		this.push(arr[3].join(""));
		this.push(arr[0].join(""));
		this.push("</table>");
		return this;
	},
	npcList : function(xns, cr, ac){
	//显示多个NPC,map紧随name,而不会生成列对齐的列表.ac控制额外样式
	//参数xns为一个npc的节点序列
		var arr = [[], [], [], []];
		if(store.get("camp") === "horde")
			var camp = "H";
		else
			var camp = "A";
		if(cr === "rate")	//掉落状态下不区分npc阵营
			var cm = 3;
		for(var i=0; i<xns.length; i++){
			var id = xns[i].getAttribute("id");
			var xn = xpath.find(wowtip.data["npc"], "npc[@id='"+id+"']");
			if(!xn) continue;
			if(cr !== "rate")
				var cm = xn.getAttribute(camp) || "0";
			arr[cm].push("<div>");
			link.name.call(arr[cm], "npc", [id,xn], ac, "0");
			if(cr){
				var att = xns[i].getAttribute(cr);
				if(att)
					arr[cm].push("&nbsp;<b>("+(cr==="rate" ? getRate(att) : att)+")</b>");
			}
			arr[cm].push('&nbsp;--&nbsp;');
			link.map.call(arr[cm], "npc", [id,xn]);
			arr[cm].push('</div>');
		}
		this.push(arr[2].join(""));
		this.push(arr[1].join(""));
		this.push(arr[3].join(""));
		this.push(arr[0].join(""));
		return this;
	},
	objList : function(xns, cr){
		for(var i=0; i<xns.length; i++){
			var id = xns[i].getAttribute("id");
			var xn = xpath.find(wowtip.data["object"], "object[@id='"+id+"']");
			if(!xn) continue;
			this.push("<div>");
			link.name.call(this, "object", [id,xn], "cur-interact si-interact", "0");
			if(cr === "rate")
				this.push("&nbsp;<b>("+getRate(xns[i].getAttribute("rate"))+")</b>");
			this.push("&nbsp;--&nbsp;");
			link.map.call(this, "object", [id,xn]);
			this.push('</div>');
		}
		return this;
	},
	quest : function(id){
	//获取一个任务的名称链接,并在其下显示起始npc/object,所在地.如果该任务有前序,将前序一并显示
		var xn = xpath.find(wowtip.data["quest"], "quest[@id='"+id+"']");
		if(!xn){
			this.push('<div class="si-quest">未知任务</div>');
			return;
		}
		var begin = xn.getAttribute("beginning");
		var daily = xn.getAttribute("level") === "Daily";
		this.push('<div>');
		link.name.call(this, "quest", id, (daily ? 'si-daily' : 'si-quest'));	//链接任务
		this.push("</div>");
		var st = xpath.findvalue(xn, "start/@type");
		var si = xpath.findvalue(xn, "start/@id");
		if(st && si){
			this.push('<div class="si-indent">');
			if(st !== "item")
				link.NM.call(this, st, si, (daily ? "cur-daily" : "cur-quest")+" si-qwords");
			else{
				link.name.call(this, st, si, (daily ? "cur-daily" : "cur-quest")+" si-qwords");
				//this.push('<div class="si-indent">');
				//link.item.call(this, si);
				//this.push('</div>');
			}
			this.push('</div>');
		}
		if(begin){
			this.push('<div class="si-indent">');
			link.quest.call(this, begin);
			this.push('</div>');
		}
		return this;
	},
	item : function(id){
	//追寻一个物品的来源:奖励/掉落/购买/包含于物品/包含于道具/"魔法制造",暂不支持
	//并同时追寻其来源的任务/物品,显示NPC/道具的所在地图
	//只显示物品来源,不同步显示该物品.可以用一个link.name,<div class="si-indent">+这个+</div>来包含物品
		if(typeof id==="string"||typeof id==="number")
			var xn = xpath.find(wowtip.data["item"], "item[@id='"+id+"']");
		else
			var xn = id;
		//if(!xn)
		//	return;
		//奖励于任务
		var quests = xpath.findvalues(xn, "reward-from/quest/@id");
		if(quests.length > 0){
			for(var i=0; i<quests.length; i++){
				link.quest.call(this, quests[i]);
			}
		}
		//出售于
		var vendors = xpath.findall(xn, "sold-by/npc");
		if(vendors.length > 0){
			link.npcList.call(this, vendors, "count", "cur-buy si-buy");
		}
		//掉落于
		var monsters = xpath.findall(xn, "dropped-by/npc");
		if(monsters.length > 0){
			link.npcList.call(this, monsters, "rate", "cur-attack si-loot");	//掉落的npc一律使用attack样式
		}
		//开启于道具
		var objects = xpath.findall(xn, "contained-in/object");
		if(objects.length > 0){
			link.objList.call(this, objects, "rate");
		}
		//包含于物品
		var containers = xpath.findall(xn, "contained-in/item");
		if(containers.length > 0){
			for(var i=0; i<containers.length; i++){
				var caseid = containers[i].getAttribute("id");
				link.name.call(this, "item", caseid, "cur-interact si-interact");
				this.push("&nbsp;<b>("+getRate(containers[i].getAttribute("rate"))+")</b>");
				this.push('<div class="si-indent">');
				link.item.call(this, caseid);
				this.push('</div>');
			}
		}
		//由XXX制造//created-by-spell
		/*var reagents = xpath.findall(xn, "created-by/item");
		if(reagents.length > 0){
		alert(id)
			for(var i=0; i<reagents.length; i++){
				var itemid = reagents[i].getAttribute("id");
				link.name.call(this, "item", itemid , "si-whell");
				this.push('<div class="si-indent">');
				link.item.call(this, itemid );
				this.push('</div>');
			}
		}
		*/
		return this;
	},
	spell : function(id){
	//追寻一个技能的来源,参数为spell id或spell节点,不查询传授的物品
	//只显示来源,不同步显示该技能
		//if(typeof id==="string"||typeof id==="number")
			var xn = xpath.find(wowtip.data["skill"], "spell[@id='"+id+"']");
		//else
		//	var xn = id;
		//传授于,如果传授的NPC不超过2个,在这里显示
		var trainers = xpath.findvalues(xn, "taught-by-npc/npc/@id");
		if(trainers.length > 2)
			this.push('<div><span class="cur-train si-train q" onclick="trainertable.replaceThis(this.parentNode,\'' + trainers.join(" ") + '\')">训练师</span></div>');
		else if(trainers.length > 0){
			for(var i=0; i<trainers.length; i++){
				this.push('<div>');
				link.NM.call(this, "npc", trainers[i], "cur-train si-train")
				this.push('</div>');
			}
		}
		
		//传授于技能
		var spells = xpath.findvalues(xn, "taught-by-spell/spell/@id");
		if(spells.length > 0){
			for(var k=0; k<spells.length; k++){
				this.push('<div>');
				link.name.call(this, "spell", spells[k], "cur-train si-train");
				this.push('</div>');
			}
		}
		//传授于道具
		/*
		var objs = xpath.findvalues(xn, "taught-by-object/object/@id");
		if(objs.length > 0){
			for(var k=0; k<objs.length; k++){
				this.push('<div>');
				link.NM.call(this, "object", objs[k], "cur-train si-train");
				this.push('</div>');
			}
		}*/
		//奖励于任务
		var quests = xpath.findvalues(xn, "reward-from/quest/@id");
		if(quests.length > 0){
			for(var k=0; k<quests.length; k++)
				link.quest.call(this, quests[k]);
		}
		return this;
	},
	comment : function(tp, id){
	//查询对于相关的数据的评价,根据类型和id
	//[item@id=12345@screenshot]
	//[]
		var comments = xpath.findvalues(wowtip.data["comment"], "comment[count("+tp+"[@id='"+id+"'])>'0']/words/text()");
		for(var i=0; i<comments.length; i++){
			this.push('<div class="si-talk">');
			this.push(linkComment(comments[i]));
			this.push('</div>');
		}
		return this;
	}
};

var linkComment = function(){
//将[type=id]替换为name或者NM格式
	var re = /\[(\w+)=(\d+)(@\w+)?\]/g;
	var lf = /\\n/g;
	//var lt = /\[/g;
	//var gt = /\]/g;
	return function(s){
		return s.replace(lf, "<br />").replace(re, function(){
			if(arguments[1]==="npc" || arguments[1]==="object"){
				if(arguments[3] === "@map"){
					return link.NM.call([], arguments[1], arguments[2]).join("");
				}else{
					return link.name.call([], arguments[1], arguments[2]).join("");
				}
			}else if(arguments[1] === "item"){
				if(arguments[3] === "@screenshot"){
					return link.NS.call([], arguments[1], arguments[2]).join("");
				}else if(arguments[3] === "@source"){
					var a = [];
					link.name.call(a, arguments[1], arguments[2]);
					a.push('<div class="si-indent">');
					link.item.call(a, arguments[2]);
					a.push('</div>');
					return a.join("");
				}else{
					return link.name.call([], arguments[1], arguments[2]).join("");
				}
			}else if(arguments[1] === "quest"){
				if(arguments[3] === "@source"){
					return link.quest.call([], arguments[2]).join("");
				}else{
					return link.name.call([], arguments[1], arguments[2]).join("");
				}
			}else if(arguments[1] === "screenshot"){
				return link.screenshot.call([], arguments[1], arguments[2]).join("");
			}else{
				return link.name.call([], arguments[1], arguments[2]).join("");
			}
		});
	}
}();

var getRate = function(s){
//处理一个掉落率字符串,返回百分比格式
	if(!s)
		return "0%";
	s = s.split("/");
	s = parseInt(s[0])/parseInt(s[1]);
	if(s > 0.02)
		return Math.round(s*100)+"%";
	else if(s > 0.002)
		return Math.round(s*1000)/10+"%";
	else
		return Math.round(s*10000)/100+"%";
}