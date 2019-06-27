
//用于组织页面,生成表格
var MaxSearchListLength = 100;
//搜索产生的最大数目

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

var skillMenu = {
//管理页面的选择,保存当前页面的所属id.在初始化时直接生产页面,所以放到最后初始化
	init : function(skillName, searchPage){
	//初始化,读取menu元素,上次访问的界面,并生成第一个列表.skillTable和favouriteList的初始化必须已经完成
		this.top = document.getElementById("menu-top").getElementsByTagName("a");
		this.bottom = document.getElementById("menu-bottom").getElementsByTagName("a");
		//可以在该步执行前将this.skill设置,从而使得不同的页面,不同的收藏夹
		if(!this.skill)
			this.skill = skillName;
		if(!store.get(skillName))
			store.set(skillName, "1");
		this.click(parseInt(store.get(skillName)));
	},
	click : function(page){
	//搜索页在每次点击时都重载cache
		if(page===this.active && page!==skillTable.menu.length-1)
			return;
		if(typeof this.active !== "undefined"){
			if(this.top[this.active])
				removeclass(this.top[this.active], "active");
			if(this.bottom[this.active])
				removeclass(this.bottom[this.active], "active");
		}
		this.active = page;
		if(this.top[this.active])
			addclass(this.top[this.active], "active");
		if(this.bottom[this.active])
			addclass(this.bottom[this.active], "active");
		skillTable.show(page);
		store.set(this.skill, page);
		window.scrollTo(0, 0);
	}
};
/*
var searchTable = {
	
}
*/
var favourite = {
//控制收藏夹功能
	init : function(skillName){
	//初始化,读取cookie中的收藏,存放在list表
		this.skill = skillName;
		this.list = {};
		//id列表
		//this.pageCache = {};
		//收藏对应的页面元素的列表.有收藏时,未必有原始物品,反之亦成立.被使用id取代
		this.trCache = {};
		//用来存放收藏夹的tr列表
		//this.searchCache = {};//被使用id取代
		var index = {};
		//生成一个整个页面的skill索引表,用来将list排序
		var xl = xpath.findvalues(wowtip.data["skill"], "spell/@id");
		for(var i=0; i<xl.length; i++){
			index[xl[i]] = i;
		}
		var FList = (store.get(skillName+"Favourite") || '').split(",");
		//将list表排序,初始化trCache为null,
		FList.sort(function(x, y){return index[x] - index[y];});
		for(var i=0; i<FList.length; i++){
			this.list[FList[i]] = true;
		}
	},
	save : function(){
	//保存store.该函数也可以放到body.onunload中触发
		var FList = [];
		for(var i in this.list){
			FList.push(i);
		}
		store.set(this.skill+"Favourite", FList.join(","));
	},
	add : function(id){
	//创建row,添加入cache以及收藏的table,为其注册事件
	//为list表添加id,保存cookie
	//未必id不存在时才调用该函数
		if(this.tbody){
			var trs = skillTable.createTRforTable(id, this.tbody);
			if(trs[0]){
				var icon = trs[0].cells[0].firstChild.firstChild;
				icon.firstChild.className = "icon-metal";
				icon.onclick = this.delThis;
				this.trCache[id] = trs;
				//将其保存,以便于在收藏中删除物品时,恢复原来的物品的边框
			}
		}
		this.list[id] = true;
		this.save();
	},
	del : function(id){
	//删除tr,同时删除list的id一栏
	//调用该函数时一般id都存在
		if(this.trCache[id]){
			for(var i=0; i<this.trCache[id].length; i++){
				this.tbody.deleteRow(this.trCache[id][i].rowIndex - 1);	//删除时序列包含了thead和tfoot,而index序列不包含
			}
			//delete this.trCache[id];
		}
		delete this.list[id];
		this.save();
	},
	create : function(){
	//根据list列表创建收藏,由listTable的show触发,返回收藏,供listTable的cache7保存
		var div = skillTable.commonCreate([]);
		//生成一个有标题头的空table
		this.tbody = div.firstChild.getElementsByTagName("tbody")[0];
		for(var i in this.list){
			var trs = skillTable.createTRforTable(i, this.tbody);
			if(trs[0]){
				var icon = trs[0].cells[0].firstChild.firstChild;
				icon.firstChild.className = "icon-metal";
				icon.onclick = this.delThis;
				this.trCache[i] = trs;
				//将其保存,以便于在收藏中删除物品时,恢复原来的物品的边框
			}else{
			//删除无效的id
				delete this.list[i];
				this.save();
			}
		}
		return div;
	},
	delThis : function(){
	//在收藏夹里移除当前的skill
	//该函数被注册到收藏页面的icon,以call方式调用
		var id = this.id.slice(1);
		//删除收藏表里的tr
		favourite.del(id);
		//如果有生成原始列表中的对应物品,删除其边框
		var cicon = document.getElementById("c"+id);
		if(cicon)
			cicon.firstChild.className = "icon-border";
		var sicon = document.getElementById("s"+id);
		if(sicon)
			sicon.firstChild.className = "icon-border";
		var ticon = document.getElementById("t"+id);
		if(ticon)
			ticon.firstChild.className = "icon-border";
		//if(favourite.pageCache[id]){
		//	favourite.pageCache[id].firstChild.className = "icon-border";
			//delete favourite.pageCache[id];
		//}
		//隐藏tip
		wowtip.hide();
	},
	addORDelThis : function(){
	//当id被包含时,移除,无时添加
	//该函数被注册到原始页面的icon,以call方式调用
		var id = this.id.slice(1);
		if(favourite.list[id]){
		//存在收藏
			favourite.del(id);
			var icon = document.getElementById("c" + id);
			if(icon) icon.firstChild.className = "icon-border";
			var icon = document.getElementById("t" + id);
			if(icon) icon.firstChild.className = "icon-border";
			var icon = document.getElementById("s" + id);
			if(icon) icon.firstChild.className = "icon-border";
		}else{
		//没有该收藏
			favourite.add(id);
			var icon = document.getElementById("c" + id);
			if(icon) icon.firstChild.className = "icon-metal";
			var icon = document.getElementById("t" + id);
			if(icon) icon.firstChild.className = "icon-metal";
			var icon = document.getElementById("s" + id);
			if(icon) icon.firstChild.className = "icon-metal";

			//favourite.pageCache[id] = this;
		}
	},
	registerToPage : function(tb){
	//为一个其他页面的table添加mark并注册事件,当点击时触发toggle事件.将收藏的物品同时添加入pageCache列表
		var tb = tb.getElementsByTagName("tbody")[0];
		var trs = tb.childNodes;
		for(var i=0; i<trs.length; i++){
			if(trs[i].cells.length < 3)
				continue;
			var icon = trs[i].cells[0].firstChild.firstChild;
			icon.onclick = this.addORDelThis;
			if(icon.id && this.list[icon.id.slice(1)]){
				icon.firstChild.className = "icon-metal";
				//this.pageCache[icon.id] = icon;
			}
		}
		//*/
	}
}

var skillTable = {
	init : function(name, plan, menuList){
	//初始化,读取一些页面元素,为列表的生成做准备
		this.name = name;
		this.plan = plan;
		this.con = document.getElementById("content");
		//存放列表的元素
		this.searchTextElement = document.getElementById("text");
		this.menu = menuList;
		//for(var i=0; i<menuList.lenght; i++){
		//	if(menuList[i][0] === "search"){
		//		this.searchPage = i;
		//		break;
		//	}
		//}
	},
	cache : {},
	//列表缓存
	classcache : {},
	show : function(page){
	//根据情况创建,取缓存,显示列表.不显示列表的判断由menu完成,不在这里判断
	//隐藏和移出文档的放在在ff和chrome下都一样快,在ie下都一样慢
	//值得一提的是,移出文档后无法用document.get查询到
		wowtip.hide();
		//while(this.con.firstChild)
		//	this.con.removeChild(this.con.firstChild);
		if(this.cache[this.currentPage])	//上个页面隐藏
			this.cache[this.currentPage].style.display = "none";
		if(this.cache[page]){	//显示当前页
			this.cache[page].style.display = "block";
			//this.con.appendChild(this.cache[page]);
		}else{
			this.con.appendChild(this.create(page));
		}
		this.currentPage = page;
	},
	create : function(page){
	//通用的创建函数,同时保存列表,然后返回新创建的列表
		//if(htmldata[page]){
		//	var div = document.createElement("div");
		//	div.innerHTML = htmldata[page];
		//}else{

		var menu = this.menu[page];
		if(menu[0] === "trainer"){
			var div = this.createTrainer();
		}else if(menu[0] === "favourite"){
			var div = favourite.create();
		}else if(menu[0] === "search"){
		//只有当上次访问到这里,才会进行到这一步
			var div = document.createElement("div");
		}else if(menu[0] === "level"){
			var div = this.createBySkillLevel(menu[1], menu[2]);
		}
		/*else if(menu[0] === "class"){
			var div = this.createByClass(menu[1], "c");
		}*/

		//}
		div.className = "table";
		this.cache[page] = div;
		return div;
	},
	linkCreated : function(skill, iconID){
	//同样用于生成字符串.仅供call调用,iconID为注册到第一列的图标的id.
		if(xpath.find(skill, "create"))
			link.IN.call(this, "item", xpath.findvalue(skill,"create/@id"), xpath.findvalue(skill,"create/@count"), iconID);
		else
			link.IN.call(this, "spell", skill.getAttribute("id"), "", iconID);
			//this.push("("+xpath.findvalue(skill,"create/@class")+")");
		return this;
	},
	linkReagents : function(skill){
		var reagents = xpath.findall(skill, "reagents/item");
		this.push("<div>");
		for(var k=0; k<reagents.length; k++){
			link.icon.call(this, "item", xpath.findvalue(reagents[k],"@id"), xpath.findvalue(reagents[k],"@count"));
		}
		this.push("</div>");
		return this;
	},
	linkColors : function(skill){
		var colors = skill.getAttribute("colors");
		if(colors){
			colors = colors.split(" ");
			for(var k=0; k<4; k++){
				if(colors[k] !== "0"){
					this.push('<span class="d'+(k+1)+'">'+colors[k]+"</span> ");
				}
			}
		}
		return this;
	},
	
	search : function(words){
	//创建搜索列表
		if(words)	//为特定的搜索词创建索引
			var buildindex = !!words;
		if(buildindex && this.classcache[words])
			var div = this.classcache[words];
		else{
			words = words || this.searchTextElement.value;
			if(!words)
				return;
			words = words.replace(/^ +| +$/g, "").replace(/ +/g, " ");
			words = words.split(" ");
			if(words.length > 0){
				var skillList = xpath.findall(wowtip.data["skill"], "spell[contains(name/text(),'"+words[0]+"')"+(words[1] ? "and contains(name/text(),'"+words[1]+"')" : "")+"]");
				var div = this.commonCreate(skillList, "s");
			}else{
				var div = this.commonCreate([], "s");
			}
			
			div.style.display = "none";
			favourite.registerToPage(div.firstChild);
			if(buildindex)
				this.classcache[words] = div;
		}
		
		if(this.cache[this.menu.length-1])
			this.con.removeChild(this.cache[this.menu.length-1]);
		this.cache[this.menu.length-1] = div;
		this.con.appendChild(div);
		
		skillMenu.click(this.menu.length-1);
	},
	
	searchByClass : function(iclass){
	//创建搜索列表
		if(this.classcache[iclass])
			var div = this.classcache[iclass];
		else{
			var div = this.createByClass(iclass, "s");
			div.style.display = "none";
			favourite.registerToPage(div.firstChild);
			this.classcache[iclass] = div;
		}
		if(this.cache[this.menu.length-1])	//如果搜索页的内容存在
			this.con.removeChild(this.cache[this.menu.length-1]);
		this.cache[this.menu.length-1] = div;
		this.con.appendChild(div);
		skillMenu.click(this.menu.length-1);
	},
	
	createByClass : function(iclass, ei){
	//根据skill的class查询
		iclass = iclass.split(" ");
		var skillList = [];
		for(var i=0; i<iclass.length; i++){
			var list = xpath.findall(wowtip.data["skill"], "spell/create[@class='"+iclass[i]+"']/parent::node()");
			for(var j=0; j<list.length; j++){
				skillList.push(list[j]);
			}
		}
		var div = this.commonCreate(skillList, ei);

		favourite.registerToPage(div.firstChild);
		return div;
	},
	
	createTrainer : function(){
	//生成trainer页面
		//以下为对传授npc的合并
		var skillList = [];
		var npcIndex  = [];
		var skills = xpath.findall(wowtip.data["skill"], "spell[count(taught-by-npc)>'0']");
		for(var i=0; i<skills.length; i++){
			var skill = skills[i];
			var npcString = xpath.findvalues(skill, "taught-by-npc/npc/@id").join(" ");	//获取所有npc的字符串
			if(typeof npcIndex[npcString] === "undefined"){
				npcIndex[npcString] = skillList.length;
				skillList.push([skill]);
			}else{
				skillList[npcIndex[npcString]].push(skill);
			}
		}
		//生成列表
		var html = [];
		html.push('<table class="list"><thead><tr><th style="width:22.2%"><div>'+this.name+'</div></th><th style="width:22.2%"><div>材料</div></th><th style="width:13.3%"><div>技能点增长</div></th><th><div>训练师</div></th></tr></thead>');
		html.push('<tbody>');
		for(var i=0; i<skillList.length; i++){
			for(var j=0; j<skillList[i].length; j++){
				var skill = skillList[i][j];
				var skillid = skill.getAttribute("id");
				html.push("<tr><td>");
				this.linkCreated.call(html, skill, "t" + skillid);
				html.push("</td><td>");
				this.linkReagents.call(html, skill);
				html.push('</td><td class="colors">');
				this.linkColors.call(html, skill);
				html.push("</td>");
				//在第一个技能处生成传授NPC,comment也取自第一个技能
				if(j === 0){
					html.push('<td class="source" rowspan="'+skillList[i].length+'">');
					link.npcTable.call(html, xpath.findvalues(skill, "taught-by-npc/npc/@id"), "cur-train");
					link.comment.call(html, "skill", skillid);
					html.push("</td>");
				}
				html.push("</tr>");
			}
		}
		html.push('</tbody></table>');
		var div = document.createElement("div");
		div.className = "table";
		div.innerHTML = html.join("");
		favourite.registerToPage(div.firstChild);
		/*var div = document.createElement("textarea");
		div.style.width = "90%";
		div.style.height = "90%"
		div.value = html.join("\r\n");//*/
		
		return div;
	},
	commonCreate : function(skillList, extraID){
	//一般的创建函数,参数为一个由技能列表组成的二重数组
	//第二个参数为是否为icon创建id,用于收藏夹的寻址
		var html = [];
		
		//以下代码用于合并相邻且相同的出售NPC
		var lastnpc = "";
		var newList = [];	//技能合并后的二重表
		for(var i=0; i<skillList.length; i++){
			var skill = skillList[i];
			//查询图纸
			var plans = xpath.findvalues(skill, "taught-by-item/item/@id");
			if(plans.length===1 && !xpath.find(skill, "taught-by-npc|reward-from|taught-by-spell")){
				var plan = xpath.find(wowtip.data["item"], "item[@id='"+plans[0]+"']");
				var npcString = xpath.findvalues(plan, "sold-by/npc/@id").join(" ");
				if(npcString && !xpath.find(plan, "reward-from|dropped-by|contained-in")){
				//仅有出售
					if(lastnpc && npcString===lastnpc)
						newList[newList.length-1].push(skill);
					else{
						newList.push([skill]);
						lastnpc = npcString;
					}
				}else{
					newList.push([skill]);
					lastnpc = "";
				}
			}else{
				newList.push([skill]);
				lastnpc = "";
			}
		}

		skillList = newList;
		
		html.push('<table class="list"><thead><tr><th style="width:22.2%"><div>'+this.name+'</th><th style="width:22.2%"><div>材料</div></th><th style="width:13.3%"><div>技能点增长</div></th><th style="width:4.6%"><div>'+this.plan+'</div></th><th><div>来源</div></th></tr></thead>');
		html.push('<tbody>');
		for(var i=0; i<skillList.length; i++){
			for(var j=0; j<skillList[i].length; j++){
				var skill = skillList[i][j];
				//查询图纸
				var plans = xpath.findvalues(skill, "taught-by-item/item/@id");
				var camp  = skill.getAttribute("camp");
				html.push('<tr' + (camp ? ' class="onlycamp'+camp+'"' : '') + '><td'+(plans.length>1 ? ' rowspan="'+plans.length+'"' : '')+'>');
				this.linkCreated.call(html, skill, (extraID ? extraID+skill.getAttribute("id") : undefined));
				html.push('</td><td'+(plans.length>1 ? ' rowspan="'+plans.length+'"' :'')+'>');
				this.linkReagents.call(html, skill);
				html.push('</td><td class="colors"'+(plans.length>1 ? ' rowspan="'+plans.length+'"' :'')+'>');
				this.linkColors.call(html, skill);
				html.push("</td>");
				//如果有多个配方,不查询其技能的其他来源
				
				if(plans.length > 1){
					for(var k=0; k<plans.length; k++){	//其他的配方
						if(k > 0) html.push("<tr>");
						html.push("<td>");
						link.icon.call(html, "item", plans[k]);
						html.push('</td><td class="source">');
						link.item.call(html, plans[k]);
						link.comment.call(html, "spell", skill.getAttribute("id"));
						link.comment.call(html, "item", plans[k]);
						html.push('</td></tr>');
					}
				}else{	//至多有一个配方
					html.push("<td>");
					if(plans[0])
						link.icon.call(html, "item", plans[0]);
					html.push('</td>');
					//创建来源
					if(j === 0){
						html.push('<td class="source" rowspan="'+skillList[i].length+'">');
						link.spell.call(html, skill.getAttribute("id"));
						if(plans[0])
							link.item.call(html, plans[0]);
						link.comment.call(html, "spell", skill.getAttribute("id"));
						if(plans[0])
							link.comment.call(html, "item", plans[0]);
						html.push("</td>");
					}
					html.push("</tr>");
				}
			}
		}
		html.push('</tbody></table>');
		var div = document.createElement("div");
		div.className = "table";
		div.innerHTML = html.join("");
		
		/*var div = document.createElement("textarea");
		div.style.width = "90%";
		div.style.height = "90%"
		div.value = html.join("\r\n");//*/

		return div;
	},
	createBySkillLevel : function(min, max){
	//requires-skill-level一定范围内的页面,以下代码用于合并售卖NPC
		//var skillList = [];
		//var npcIndex  = [];
		var skills = xpath.findall(wowtip.data["skill"],"spell[@requires-skill-level>'"+min+"' and @requires-skill-level<='"+max+"']");
		//以下代码用于合并出售NPC
		/*
		for(var i=0; i<skills.length; i++){
			var skill = skills[i];	//单个的技能,按照学习顺序排列
			if(xpath.find(skill, "taught-by-npc|reward-from")){	//如果spell可以通过其他途径获得
				skillList.push([skill]);
				continue;
			}
			var tbi = xpath.findvalues(skill, "taught-by-item/item/@id");	//查找传授的食谱
			if(tbi.length !== 1){	//如果没有食谱或者多个食谱
				skillList.push([skill]);
				continue;
			}
			var plan = xpath.find(wowtip.data["item"], "item[@id='"+tbi[0]+"']");	//查找对应图纸
			if(!plan || xpath.find(plan, "reward-from|dropped-by|contained-in")){//|sold-by/npc[@count]")){	//如果食谱可以通过其他途径获得或者食谱限量
				skillList.push([skill]);
				continue;
			}
			var npcString = xpath.findvalues(plan, "sold-by/npc/@id").join(" ");	//一般情况下npcString不会为空
			if(!npcString){	//如果没有npc出售
				skillList.push([skill]);
				continue;
			}
			if(typeof npcIndex[npcString] === "undefined"){
				npcIndex[npcString] = skillList.length;
				skillList.push([skill]);
			}else{
				skillList[npcIndex[npcString]].push(skill);
			}
		}
		return this.commonCreate(skillList, "c");	//创建列表,携带id
		*/
		var div = this.commonCreate(skills, "c");
		favourite.registerToPage(div.firstChild);	//将收藏对应的标记和事件注册到table
		return div;
	},
	createTRforTable : function(id, tb){
	//为一个table动态创建row,添加到table的末尾.其格式同commonCreate的tr是相同的
	//为第一个tr的icon注册id:f+spellID.返回一个tr列表
	//不为其添加comment,也不做售卖NPC合并
		var arr = [];
		var skill = xpath.find(wowtip.data["skill"], "spell[@id='"+id+"']");
		if(!skill)
			return arr;
		var plans = xpath.findvalues(skill, "taught-by-item/item/@id");
		var tr = tb.insertRow(tb.rows.length);
		arr.push(tr);
		var td = tr.insertCell(0);
		td.rowSpan = (plans.length>1 ? plans.length : 1);
		td.innerHTML = this.linkCreated.call([], skill, "f"+id).join("");
		var td = tr.insertCell(1);
		td.rowSpan = (plans.length>1 ? plans.length : 1);
		td.innerHTML = this.linkReagents.call([], skill).join("");
		var td = tr.insertCell(2);
		td.rowSpan = (plans.length>1 ? plans.length : 1);
		td.className = "colors";
		td.innerHTML = this.linkColors.call([], skill).join("");
		//如果有多个配方,不查询其技能的其他来源
		if(plans.length > 1){
			var td = tr.insertCell(3);
			td.innerHTML = link.icon.call([], "item", plans[0]).join("");
			var td = tr.insertCell(4);
			td.className = "source";
			td.innerHTML = link.item.call([], plans[0]).join("")//+link.comment.call([], "item", plans[0]).join("");
			for(var k=1; k<plans.length; k++){	//其他的配方
				var ptr = tb.insertRow(tb.rows.length);
				arr.push(ptr);
				var td = ptr.insertCell(0);
				td.innerHTML = link.icon.call([], "item", plans[k]).join("");
				var td = ptr.insertCell(1);
				td.className = "source";
				td.innerHTML = link.item.call([], plans[k]).join("")//+link.comment.call([], "item", plans[k]).join("");
			}
		}else{	//至多有一个配方
			var td = tr.insertCell(3);
			if(plans[0])
				td.innerHTML = link.icon.call([], "item", plans[0]).join("");
				var td = tr.insertCell(4);
			td.className = "source";
			td.innerHTML = 	link.spell.call([], skill.getAttribute("id")).join("")
							+(plans[0] ? link.item.call([], plans[0]).join("") : "")
							+link.comment.call([], "spell", skill.getAttribute("id")).join("")
							+(plans[0] ? link.comment.call([], "item", plans[0]).join("") : "");
		}
		return arr;
	}
};

var trainertable = {
//一个npc id-npc table表,用来在点击训练师时取代其
	index : {},	//索引和值,内容有2项:trainer table, 以及当前其取代的元素
	replaceThis : function(e, idstring){
	//创建一个trainer table,并用其取代参数.该函数被处罚事件调用
		var idx = trainertable.index[idstring];
		var tre;
		if(!idx){
			div = document.createElement("div");
			div.innerHTML = link.npcTable.call([], idstring.split(" "), "cur-train").join("");
			idx = trainertable.index[idstring] = [div];
		}else{
			div = idx[0];
			tre = idx[1];
		}
		
		if(tre){
			div.parentNode.replaceChild(tre, div);
		}
		e.parentNode.replaceChild(div, e);
		idx[1] = e;
	}
};
	

