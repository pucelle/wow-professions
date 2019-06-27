var screenshotpath = "screenshots/", iconpath = "icons/";
//var screenshotpath = "http://static.wowhead.com/uploads/screenshots/thumb/", iconpath = "http://static.wowhead.com/images/wow/icons/medium/";

//screenshots 
	//missed-npc:802|347|17061|19024|19031|20707|21934|22671|23871|30218|32147|32154|32155|32158|32208|33066|38832|39323|64400|67439|69017|88393|90795
	//missed-object:3708|5960|5986|6319|7467|8210|11764|15102|16231|16765|18093|18182|19477|20477|20627|22357|24452|24753|25983|59059|70242|72430|116095|134043

var npcClass = {
	"1"	: "野兽",
	"2"	: "龙类",
	"3"	: "恶魔",
	"4"	: "元素生物",
	"5"	: "巨人",
	"6"	: "亡灵",
	"7"	: "人型生物",
	"9"	: "机械",
	"10": "未指定",
	"12": "小伙伴"
};

var wowtip = {
	maxwidth: 276,
	//限制纯文字状态下的宽度
	cache : {},
	//用作html元素缓存
	data : {},
	//用作存储xml根节点
	init : function(xmltable){
	//载入文件,做一些初始化的工作,map,coord不在这里初始化
		for(var i in xmltable){
			this.cache[i] = {};
			this.data[i] = xmltable[i];
		}
		/*
		var now = new Date().getTime();
		if(this.data["skill"] && this.data["item"]){	//使得skill继承制作物品的class属性
			for(var i=0; i<this.data["skill"].childNodes.length; i++){
				var singleSkill = this.data["skill"].childNodes[i];
				var createdID = xpath.findvalue(singleSkill, "create/@id");
				if(createdID){
					var createdItem = xpath.find(this.data["item"], "item[@id='"+createdID+"']");
					if(createdItem){
						singleSkill.setAttribute("class", createdItem.getAttribute("class"));
						singleSkill.setAttribute("subclass", createdItem.getAttribute("subclass"));
					}
				}
			}
		}
		alert(new Date().getTime()-now)
		*/
		this.cache["coord"]= {"npc":{}, "object":{}};	//坐标有两类
		this.cache["screenshot"] = {};
		this.cache["lose"] = document.createElement("div");
		this.cache["lose"].innerHTML = "没有相关数据!"
	},

	screenshotFix : {
		item : {
			2570 : 282014,
			2584 : 282151,
			4249 : 185441,
			4260 : 291053,
			4393 : 207709,
			7276 : 309181,
			7387 : 320569,
			7917 : undefined,
			7960 : 185395,
			10003 : 185374,
			10023 : 186440,
			14154 : 158453,
			15050 : 10484,
			19168 : 303410,
			21864 : 284338,
			23763 : 16769,
			24262 : 23695,
			28428 : 29006,
			28433 : 30383
		},
		npc : {
			60 : 296947,
			729 : 11437,
			834 : 52240,
			1840 : 66649,
			2480 : 56678,
			3792 : 210326,
			5768 : 52761,
			6499 : 42652,
			7015 : 168184,
			8281 : 217641,
			8298 : 57910,
			9217 : 231664,
			10339 : 259932,
			10639 : 104355,
			10641 : 167381,
			14268 : 12378,
			14473 : 223246,
			15299 : 181455,
			15370 : 208392,
			16807 : 25208,
			17556 : 197238,
			21500 : 80925,
			26964 : 334251
		},
		object : {
			176582 : 20359
		},
		spell : {
			7788 : 251410
		}
	},

	create : function(tp, id){
	//根据id信息以及xml数据创建html dom节点.也可以创建地图,返回一个div元素节点
	//在创建之前,须已经确定对应cache不存在
	//新创建的元素会保存到cache
		//创建map
		if(tp === "map"){
			var div = document.createElement("div");
			div.className = "map-tip";
			this.cache["map"][id] = div;
			div.innerHTML = '<img src="maps/'+id+'.jpg" />';
			return div;
		}
		
		var xn = xpath.find(this.data[tp], tp+"[@id='"+id+"']");
		if(!xn){
		//没有找到数据时,返回无数据的提示
			return (this.cache[tp][id] = this.cache["lose"]);
		}else{
			var div = document.createElement("div");
			div.className = tp+"-tip";
			switch(tp){
			case "item" : {
				div.innerHTML = xpath.findvalue(xn, "code/text()").replace(/\[/g, "<").replace(/\]/g, ">");
				break;
			}
			case "spell" : {
				div.innerHTML = xpath.findvalue(xn, "code/text()").replace(/\[/g, "<").replace(/\]/g, ">");
				break;
			}
			case "achievement" : {
				div.innerHTML = xpath.findvalue(xn, "code/text()").replace(/\[/g, "<").replace(/\]/g, ">");
				break;
			}
			case "npc" : {
				var arr = [];
				var photo = xpath.findvalue(xn, "screenshot/text()");

				photo = this.screenshotFix[tp] && this.screenshotFix[tp][id] ? this.screenshotFix[tp][id] : photo;

				if(photo)
					arr.push('<div class="screenshot"><img src="'+screenshotpath+photo+'.jpg" /></div>');
					//此onload事件不能连续叠加
				arr.push('<div class="name a'+xn.getAttribute("A")+" h"+xn.getAttribute("H")+'">'+xpath.findvalue(xn, "name/text()")+"</div>");
				var rank = xpath.findvalue(xn, "rank/text()");
				if(rank)
					arr.push('<div class="rank"><b>&lt;</b>'+rank+"<b>&gt;</b></div><div>");
				var level = xn.getAttribute("level");
				if(level)
					arr.push('<span class="level">等级 '+level+"</span> "+npcClass[xn.getAttribute("class") || "10"]+"</div>");
				var event = xpath.findvalue(xn, "event/text()");
				if(event)
					arr.push('<div class="event">事件: '+event+"<div>");
				div.innerHTML = arr.join("");
				break;
			}
			case "quest" : {
				var arr = [];
				arr.push('<table><tr><td class="name">'
				+xpath.findvalue(xn, "name/text()")+"</td>");
				var colors = xn.getAttribute("colors");
				if(colors && colors!=="0 0 0 0 0"){
					arr.push("<th>");
					colors = colors.split(" ");
					for(var k=0; k<5; k++){
						if(colors[k] !== "0"){
							arr.push('<span class="d'+k+'">'+colors[k]+" </span>");
						}
					}
					arr.push("</th>");
				}	
				arr.push("</tr></table>");
				var desc = xpath.findvalue(xn, "description/text()");
				if(desc)
					arr.push('<div class="desc">'+desc.replace(/\\n/g, "<br />")+"</div>");
				div.innerHTML = arr.join("");
				break;
			}
			case "object" : {
				var arr = [];
				var photo = xpath.findvalue(xn, "screenshot/text()");

				photo = this.screenshotFix[tp] && this.screenshotFix[tp][id] ? this.screenshotFix[tp][id] : photo;
				
				if(photo)
					arr.push('<div class="screenshot"><img src="'+screenshotpath+photo+'.jpg" /></div>');
				arr.push('<div class="name">'+xpath.findvalue(xn, "name/text()")+"</div>");
				var event = xpath.findvalue(xn, "event/text()");
				if(event)
					arr.push('<div class="event">事件: '+event+"<div>");
				div.innerHTML = arr.join("");
				break;
			}
			}
			var img = div.getElementsByTagName("img")[0];
			if(img)
				tooltip.waittoload.push(img);
			this.cache[tp][id] = div;
			return div;
		}
	},
	createCoordinates : function(tp, id, mid){
	//创建地图和坐标集,返回一个dom元素,如果查不到,返回-1对应的cache
		var div = document.createElement("div");
		div.className = "coords";
		if(!this.cache["coord"][tp][id])
			this.cache["coord"][tp][id] = {};
		this.cache["coord"][tp][id][mid] = div;
		var xl = xpath.findall(this.data[tp], tp+"[@id='"+id+"']/coords[@map='"+mid+"']/coord");
		for(var i=0, arr=[]; i<xl.length; i++ ){
			arr.push('<div class="coord" style="top:'+xl[i].getAttribute("y")+'px;left:'+xl[i].getAttribute("x")+'px"></div>');
		}
		div.innerHTML = arr.join("");
		return div;
	},
	createScreenShot : function(id){
	//创建截图
		//var tp = "item";
		//var ss = xpath.findvalue(this.data[tp], tp+"[@id='"+id+"']/screenshot/text()");
		//if(!ss)
		//	var div = this.cache["lose"];
		//else{
			var div = document.createElement("div");
			var img = document.createElement("img");
			img.src = screenshotpath+id+'.jpg';
			div.innerHTML = '<img src="screenshots/'+id+'.jpg" />';
		//}
		tooltip.waittoload.push(div);
		this.cache["screenshot"][id] = div;
		return div;
	},
	show : function(e, tp, id, px, py){
	//将创建的div元素送去tooltip显示,并限制其最大宽度,可以用其显示地图,但是不建议用
		if(this.cache[tp][id])
			tooltip.swap(this.cache[tp][id]);
		else{
			var div = this.create(tp, id);
			tooltip.swap(div);
			if(tp!=="npc" && tp!=="map" && div.offsetWidth>this.maxwidth){
				div.style.width = this.maxwidth+"px";
			}
		}
		tooltip.showbeside(e, 2, px, py);	//缓冲距离2
	},
	showscreenshot : function(e, a){
	//显示截图
		var id = a[Math.floor(Math.random()*a.length)];
		if(this.cache["screenshot"][id])
			tooltip.swap(this.cache["screenshot"][id]);
		else{
			tooltip.swap(this.createScreenShot(id));
		}
		tooltip.showbeside(e, 2);
	},
	showcoords : function(e, tp, id, mid){
	//显示地图以及坐标(如果有的话)
		if(this.cache["map"][mid]){
			var maptip = this.cache["map"][mid];
			while(maptip.childNodes.length > 1)
				maptip.removeChild(maptip.lastChild);
		}else{
			var maptip = this.create("map", mid);
		}
		if(tp && id){
		//意味着可以提供没有坐标的地图
			if(this.cache["coord"][tp][id] && this.cache["coord"][tp][id][mid])
				maptip.appendChild(this.cache["coord"][tp][id][mid]);
			else
				maptip.appendChild(this.createCoordinates(tp, id, mid));
		}
		tooltip.swap(maptip);
		tooltip.showbeside(e, 2);
	},
	hide : function(){
	//隐藏物品
		tooltip.hide();
	}
};
