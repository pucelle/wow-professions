//用于组织页面,生成表格
var fishClassification = {
	"0" : [6643,6299,6291,6303,6458,6358,6522,12238,6289,6317,6361,21071,6359,6308,6362,8365,21153,13422,13757,13755,4603,13754,13756,13758,13759,13760,7070,7079,7080,7078,13893,13888,13889,13890],
	"1" : [27422,27425,27429,27435,27437,27438,27439,27515,27516,33823,33824,22578,27442,35287,35285,35286],
	"2" : [41802,41803,41805,41806,41807,41808,41809,41810,41812,41813,41814,40199,43646,37705,43571,43572,43647,43652],
	"3" : [
		13907,13908,13909,13910,13911,13912,13913,
		6292,6294,6295,
		13901,13905,
		6309,6310,6311,6363,6364,
		13885,13886,13882,13883,13884,13887,
		13876,13877,13878,13879,13880,
		13914,13915,13916,13917,
		34484,34486,6360,19808,44703,27388,43698,46109
	],
	"4" : [
		43627,43628,43629,43630,43631,43632,43633,43634,43635,43636,43637,43638,43639,43640,43641,
		43643,43644,43675,43676,43677,43678,43679,43680,43681,43682,43683,43684,43685,43686,43687,
		43701,43702,43703,43704,43705,43706,43707,43708,43709,43710,43711,43712,43713,43714,43715,43716,43717,43718,43719,43720,43721,43722,43723
	],
	"5"	: {
		"鱼饵" : [6529,6530,6532,6533,33820],
		"鱼竿" : [6256,12225,6365,6366,6367,19022,25978,45858,19970,45991,45992,44050],
		"其他钓鱼配备" : [34109,38802,50816,34832,34836,19971,19969,19972,33820]
	},
	"6" : {
		"钓鱼大赛奖品" : [19969,19971,19972,19970,19979,50255,50287],
		"日常任务奖品" : [34836,19971,33816,33818,35349,35350,44983,33820,45998,45984,45991,45992,34837,45859]
	}
};

var MaxSearchListLength = 25;
//搜索产生的最大数目

var getRateBy = function(s1, s2){
//处理一个掉落率字符串,返回百分比格式
	var s = parseInt(s1)/parseInt(s2);
	if(s > 0.02)
		return Math.round(s*100);
	else if(s > 0.002)
		return Math.round(s*1000)/10;
	else
		return Math.max(Math.round(s*10000)/100, 0.1);
};

var changeCamp = function(camp){
//改变阵营
	if(camp === "alliance" && document.body.className === 'horde'){
		document.body.className='alliance';
		store.set('camp','alliance');
	}else if(camp === "horde" && document.body.className === 'alliance'){
		document.body.className='horde';
		store.set('camp','horde');
	}
}

var fishingMenu = {
//管理页面的选择,保存当前页面的所属id.在初始化时直接生产页面,所以放到最后初始化
	init : function(skillName){
	//初始化,读取menu元素,上次访问的界面,并生成第一个列表.fishingTable和favouriteList的初始化必须已经完成
		this.top = document.getElementById("menu-top").getElementsByTagName("a");
		this.bottom = document.getElementById("menu-bottom").getElementsByTagName("a");
		this.skill = skillName;
		if(!store.get(skillName))
			store.set(skillName, "0");
		this.click(parseInt(store.get(skillName)));
	},
	click : function(page){
		if(page === this.active && page!==7)
			return;
		if(typeof this.active !== "undefined"){
			this.top[this.active].className = "";
			this.bottom[this.active].className = "";
		}
		this.active = page;
		this.top[this.active].className = "active";
		this.bottom[this.active].className = "active";
		fishingTable.show(page);
		store.set(this.skill, page);
		window.scrollTo(0, 0);
	}
}

var fishingTable = {
	init : function(xmlPath){
	//初始化,读取一些页面元素,为列表的生成做准备
		this.con = document.getElementById("content");
		//存放列表的元素
		this.searchTextElement = document.getElementById("text");
		this.data = wowtip.data["fishing"];
	},
	cache : {},
	//列表缓存
	mapcache : {},
	//地图缓存
	show : function(page){
	//根据情况创建,取缓存,显示列表.不显示列表的判断由menu完成,不在这里判断
	//隐藏和移出文档的放在在ff和chrome下都一样快,在ie下都一样慢
	//值得一提的是,移出文档后无法用document.get查询到
		wowtip.hide();
		if(this.cache[this.currentPage])
			this.cache[this.currentPage].style.display = "none";
		if(this.cache[page]){	//显示当前页
			this.cache[page].style.display = "block";
		}else{
			this.con.appendChild(this.create(page));
		}
		this.currentPage = page;
	},
	create : function(page){
	//通用的创建函数,同时保存列表,然后返回新创建的列表
		if(page < 4){
			var div = this.createFish(fishClassification[page], 3);
		}else if(page === 4){
			var div = this.createCoins(fishClassification[page]);
		}else if(page===5 || page===6){
			var div = document.createElement("div");
			for(var i in fishClassification[page]){
				div.appendChild(this.createItems(i, fishClassification[page][i]));
			}
		}else if(page === 7){
		//当未进行任何搜索时进行到这里
			var div = document.createElement("div");
		}
		div.className = "table";
		this.cache[page] = div;
		return div;
	},
	searchByWord : function(){
	//查询搜索词,创建搜索页面
	//鱼类显示的最大条目被限制到25
		var word = fishingTable.searchTextElement.value;
		if(!word)
			return;
		var maps = xpath.findvalues(wowtip.data["map"], "map[contains(name/text(),'"+word+"')]/@id");
		for(var i=0; i<maps.length; i++){
			if(!xpath.find(fishingTable.data, "map[@id='"+maps[i]+"']")){
				maps.splice(i--, 1);
			}
		}
		
		var fish = xpath.findvalues(wowtip.data["item"], "item[contains(name/text(),'"+word+"')]/@id");
		fish = fish.slice(0, MaxSearchListLength);	//最大显示20条数据
		
		fishingTable.changeSearch(maps, fish);
	},
	
	changeSearch : function(mapList, fishList){
	//创建新的搜索
		var div = document.createElement("div");
		div.className = "table";
		div.style.display = "none";
		
		for(var i=0; i<mapList.length; i++){
			var id = mapList[i];
			if(!this.mapcache[id])
				this.mapcache[id] = this.createMap(id);
			div.appendChild(this.mapcache[id]);
		}
		
		if(fishList.length > 0)
			div.appendChild(this.createFish(fishList));
		
		
		if(this.cache[7])
			this.con.removeChild(this.cache[7]);
		this.cache[7] = div;
		this.con.appendChild(div);
		
		fishingMenu.click(7);
	},
	
	changeToMap : function(id){
	//修改搜索列表为地图列表
		this.changeSearch([id],[]);
	},
	changeToFish : function(id){
	//修改搜索列表为鱼列表
		this.changeSearch([],[id]);
	},
	createItems : function(intro, arr){
		var html = [];
		html.push('<table class="list">');
		html.push('<thead><tr><th style="width:50%"><div>'+intro+'</div></th>');
		html.push('<th style="width:50%"><div>来源</div></th>');
		html.push('</thead><tbody>');
		for(var i=0; i<arr.length; i++){
			var id = arr[i];
			html.push('<tr><td>');
			link.IN.call(html, "item", id);
			html.push('</td><td class="source">');
			link.item.call(html, id);
			link.comment.call(html, "item", id);
			html.push('</td></tr>');
		}
		html.push("</tbody>");
		html.push("</table>");
		var div = document.createElement("div");
		div.innerHTML = html.join("");
		return div;
	},
	
	createCoins : function(arr){
	//鱼-地图列表
	//max代表着做显示的最大的地图数目
		var html = [];
		html.push('<table class="list">');
		html.push('<thead><tr><th style="width:28.3%"><div>物品</div></th>');
		html.push('<th style="width:17.7%"><div>地图</div></th><th style="width:5%"><div>%</div></th>');
		html.push('<th style="width:50%"><div>历史</div></th>');
		html.push('</thead><tbody>');
		for(var i=0; i<arr.length; i++){
			var id = arr[i];
			var item = xpath.find(this.data, "map/item[@id='"+id+"']");
			html.push('<tr><td>');
			link.IN.call(html, "item", id);
			html.push('</td>');
			var mid = item.parentNode.getAttribute("id");
			html.push('<td class="map"><span onclick="fishingTable.changeToMap('+mid+');fishingMenu.click(7);">');
			link.name.call(html, "map", mid, "cur-fish");
			html.push('</span>')
			var area = item.getAttribute("area");
			if(area)
				html.push(" ("+area+")");
			html.push('</td><td class="rate">');
			html.push(getRateBy(item.getAttribute("count"), item.parentNode.getAttribute("total")));
			html.push('</td><td class="source">');
			link.comment.call(html, "item", id);
			html.push('</td>');
			html.push('</tr>');
		}
		html.push("</tbody>");
		html.push("</table>");
		var div = document.createElement("div");
		div.innerHTML = html.join("");
		return div;
	},
	
	createFish : function(arr, max){
	//鱼-地图列表
	//max代表着做显示的最大的地图数目
		var col = 3;
		var html = [];
		html.push('<table class="list">');
		html.push('<thead><tr><th style="width:28.3%"><div>物品</div></th>');
		for(var i=0; i<col; i++){
			html.push('<th style="width:18.9%"><div>地图</div></th><th style="width:5%"><div>%</div></th>');
		}
		html.push('</thead><tbody>');
		for(var h=0; h<arr.length; h++){
			var id = arr[h];
			var items = xpath.findall(this.data, "map/item[@id='"+id+"']");
			for(var i=0, temp=[]; i<items.length; i++){
				temp[i] = [items[i], getRateBy(items[i].getAttribute("count"), items[i].parentNode.getAttribute("total"))];
			}
			temp.sort(function(a, b){if(a[1]<b[1]) return 1; else return -1;});
			if(max) items = temp.slice(0, max);
			else items = temp;
			html.push('<tr><td rowspan="'+Math.max(Math.ceil(items.length/col), 1)+'">');
			if(max && temp.length>col) html.push('<span onclick="fishingTable.changeToFish('+id+');fishingMenu.click(7);">');
			link.IN.call(html, "item", id);
			if(max && temp.length>col) html.push('</span>');
			html.push('</td>');
			for(var i=0; i===0||i<items.length; ){
				if(i > 0) html.push('<tr>');
				for(var j=0; j<col; j++, i++){
					if(i < items.length){
						var mid = items[i][0].parentNode.getAttribute("id");
						html.push('<td class="map"><span onclick="fishingTable.changeToMap('+mid+');fishingMenu.click(7);">');
						link.name.call(html, "map", mid, "cur-fish");
						html.push('</span>')
						var area = items[i][0].getAttribute("area");
						if(area)
							html.push(" ("+area+")");
						html.push('</td><td class="rate">');
						html.push(items[i][1]);
						html.push('</td>');
					}else
						html.push("<td></td><td></td>");
				}
				html.push('</tr>');
			}
		}
		html.push("</tbody>");
		html.push("</table>");
		var div = document.createElement("div");
		div.innerHTML = html.join("");
		return div;
	},
	
	createMap : function(id){
	//地图-鱼列表
		var col = 3;
		var html = [];
		html.push('<table class="list"><thead><tr>');
		for(var i=0; i<col; i++){
			html.push('<th style="width:28.33%"><div>'+link.name.call([], "map", id, "cur-fish").join("")+'</div></th><th style="width:5%"><div>%</div></th>');
		}
		html.push('</tr></thead>');
		html.push('<tbody>');
		var map = xpath.find(this.data, "map[@id='"+id+"']");
		if(map){
			var total = map.getAttribute("total");
			var items = xpath.findall(map, "item");
			for(var i=0; i<items.length; ){
				html.push("<tr>");
				for(var j=0; j<col; j++, i++){
					if(i < items.length){
						var id = items[i].getAttribute("id");
						var xn = xpath.find(wowtip.data["item"], "item[@id='"+id+"']");
						if(!xn || (xn.getAttribute("class")==="12" && xn.getAttribute("subclass")==="0")){
							j--; continue;
						}
						html.push("<td>");
						html.push('<span onclick="fishingTable.changeToFish('+id+');fishingMenu.click(7);">');
						link.IN.call(html, "item", [id, xn]);
						html.push('</span>');
						html.push('</td><td class="rate">');
						html.push(getRateBy(items[i].getAttribute("count"), total));
						html.push("</td>");
					}else{
						html.push("<td></td><td></td>");
					}
				}
				html.push("</tr>");
			}
		}
		html.push("</tbody>");
		html.push("</table>");
		var div = document.createElement("div");
		div.innerHTML = html.join("");
		return div;
	}
}