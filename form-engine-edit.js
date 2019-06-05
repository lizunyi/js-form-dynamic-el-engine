# JS-form-engine-edit
//1.初始化控件 
//2.初始化事件
//3.初始化赋值
var isFormEngine = true;
var init = {
	mapList:[],//地图类型集合
	refList:[],//引用类型集合
	addressList:[],//省市区级联集合
	intlogicalList:[],//数值运算
	sontableMap:{},//子表单
	sontableFieldLogical:{},//子表单字段运算
	sontableCalcControl:{},//子表单被赋值字段
	fileList:[],//文件
	forbiden:{
		required:[],
		hidden:[],
		readonly:[]
	},//工作流设置的表单属性;(必填、隐藏、只读)
	initControl:function(data){
		var formDataMap = {};
		if($("#formDataMap").val()){
			formDataMap = JSON.parse($("#formDataMap").val());
		}
		var domain = data.domain;
		var field = data.field;
		var dataItemRef = data.dataItemRef;
		var domainDom;
		if(domain && domain.length > 0){
			var domainArr = [];
			var sontableMap = {};
			for(var i in domain){
				var d = domain[i];
				if(d.sontable == 1){
					if(field && field.length > 0){
						var sonTableId;
						for(var i in field){
							if(field[i].logical_formula){
								init.intlogicalList.push(field[i].logical_formula);
							}
							if(field[i].domain_id == d.id){
								sontableMap[d.id] = sontableMap[d.id] || [];
								sontableMap[d.id]["field"] = sontableMap[d.id]["field"] || [];
								sontableMap[d.id]["field"].push(field[i]);
								if(!sonTableId){
									sonTableId = field[i]["son_form_id"];
								}
								delete field[i];
								i--;
							}
						}
						sontableMap[d.id]["data"] = formDataMap[sonTableId] || [{}];
					}
				}
				domainArr.push('<section id="'+d.id+'" class="clearfix">');
				domainArr.push('<div class="view-header noborder">');
				domainArr.push('<a class="active line">'+d.domain_name+'</a>');
				domainArr.push('</div>');
				domainArr.push('<ul>');
				domainArr.push('</ul>');
				domainArr.push('</section>');
			}
			init.sontableMap = sontableMap;
			$("#container-form").append(domainArr.join(""));
		}
		if(field && field.length > 0){
			for(var i in field){
				var d = field[i];
				var field_id = d["field_id"];
				var fieldname = d["fieldname"];
				var fieldvalue = formDataMap[fieldname] || "";
				var isvisible = d.isvisible;
				if(isvisible != 1 || init.forbiden["hidden"].indexOf(fieldname) > -1){
					continue;
				}
				domainDom = $("#"+d.domain_id).find("ul");
				var fieldArr = [];
				var fieldDom;
				var ctrltype = d.ctrltype;
				var requireStr = d.isrequire == 1 || init.forbiden["required"].indexOf(fieldname) > -1 ? '<font class="required">*</font>' : '';
				var className = "col-lg-{x} col-md-{x} col-sm-{x} col-xs-12".replace(/{x}/g,d.layout_width);
				var property = [];
				fieldArr.push('<li class="'+className+'">');
				fieldArr.push('<div>'+d.fieldlabel+requireStr+'</div>');

				if(d.logical_formula){
					init.intlogicalList.push(d.logical_formula);
				}
				if(["vedio","music","attachment"].indexOf(ctrltype) > -1){
					init.fileList.push({
						ctrltype: ctrltype,
						fieldname:fieldname,
						file_limit:d.file_limit,
						file_size:d.file_size
					});
					fieldArr.push('<div dctype="attachment" id="'+fieldname+'">');
					fieldArr.push('<div>');
					fieldArr.push('<dl class="logList"></dl>');
					fieldArr.push('<dl class="logError"></dl>');
					if(d.isrequire == 1){
						fieldArr.push('<input type="hidden" class="valid" name="hid_'+fieldname+'" required="true" label="'+d.fieldlabel+'" />');
					}
					fieldArr.push('</div>');
					fieldArr.push('</div>');
				}else{
					if("date" == ctrltype){
						fieldArr.push('<div class="submit-data mdate">');
					}else{
						fieldArr.push('<div class="submit-data">');
					}
					if("citycascade" != ctrltype){
						property.push('id="'+fieldname+'"');
						property.push('name="'+fieldname+'"');
						property.push('label="'+d.fieldlabel+'"');
					}
					if(d.isrequire == 1 || init.forbiden["required"].indexOf(fieldname) > -1){
						property.push('required="true"');
					}
					if(d.isdefault == 1 && d.defaultdata){
						property.push('value="'+d.defaultdata+'"');
					}
					if(d.istooltip == 1 && d.tooltip){
						property.push('placeholder="'+d.tooltip+'"');
					}
					if(init.forbiden["readonly"].indexOf(fieldname) > -1){
						property.push('disabled');
					}
					if(!isNaN(d.maxlength) && d.maxlength > 0){
						property.push('maxlength="'+d.maxlength+'"');
					}
					if(d.fieldformat){
						property.push('class="fordatetime" readonly="readonly" data-date-format="'+d.fieldformat+'"');
					}
					if(["text","email","url","identityCard","date","decimal","intlogical","int"].indexOf(ctrltype) > -1){
						if("email" == ctrltype){
							property.push('email="true"');
						}else if("url" == ctrltype){
							property.push('url="true"');
						}else if("identityCard" == ctrltype){
							property.push('identityCard="true"');
						}else if("int" == ctrltype){
							property.push('digits="true"');
						}else if("decimal" == ctrltype){
							property.push('number="true"');
						}
						//1.文本类赋值
						if(fieldvalue){
							property.push('value="'+fieldvalue+'"');
						}
						fieldArr.push(replaceProperty('<input type="text" {property} />',property));
						if("date" == ctrltype){
							fieldArr.push('<i class="ico"></i>');
						}
					}else if("textarea" == ctrltype){
						//2.textarea类赋值
						fieldArr.push(replaceProperty('<textarea type="text" {property}>'+fieldvalue+'</textarea>',property));
					}else if("select" == ctrltype){
						var initdata = d.initdata;
						fieldArr.push(replaceProperty('<select {property}>',property));
						fieldArr.push('<option value="">--请选择--</option>');
						if(initdata){
							var datas = initdata.split(',');
							for(var i in datas){
								//3.select类赋值
								fieldArr.push('<option '+(fieldvalue && datas[i] == fieldvalue ? ' selected ' : '')+' value="'+datas[i]+'">'+datas[i]+'</option>');
							}
						}
						fieldArr.push('</select>');
					}else if("radio" == ctrltype || "checkbox" == ctrltype){
						var initdata = d.initdata;
						if(initdata){
							fieldvalue = formDataMap[fieldname+'_value'] || "";
							var datas = initdata.split(',');
							for(var i in datas){
								//4.radio、checkbox类赋值
								fieldArr.push(replaceProperty('<label><input '+(fieldvalue && fieldvalue.indexOf(datas[i]) > -1 ? ' checked ' : '')+' type="'+ctrltype+'" value="'+datas[i]+'" {property}>'+datas[i]+'</label>',property));
							}
						}
					}else if("citycascade" == ctrltype){
						var ship_cascade = d.ship_cascade;
						if(ship_cascade){
							var provice = ship_cascade.provice;
							var city = ship_cascade.city;
							var country = ship_cascade.country;
							var address = ship_cascade.address;
							//5.省、市、区级联类赋值
							if(address){
								fieldArr.push(replaceProperty('<select id="'+provice+'" name="'+provice+'" label="'+d.fieldlabel+'-省" initValue="'+(formDataMap[provice] || "")+'" {property} style="width: 20%;"></select>',property));
								fieldArr.push(replaceProperty('<select id="'+city+'" name="'+city+'" label="'+d.fieldlabel+'-市" initValue="'+(formDataMap[city] || "")+'" {property} style="width: 20%;"></select>',property));
								fieldArr.push(replaceProperty('<select id="'+country+'" name="'+country+'" label="'+d.fieldlabel+'-区" initValue="'+(formDataMap[country] || "")+'" {property} style="width: 20%;"></select>',property));
								fieldArr.push(replaceProperty('<input type="text" id="'+address+'" name="'+address+'" label="'+d.fieldlabel+'-详细地址" value="'+(formDataMap[address] || "")+'" {property} style="width: 40%;" />',property));
							}else{
								fieldArr.push(replaceProperty('<select id="'+provice+'" name="'+provice+'" label="'+d.fieldlabel+'-省" initValue="'+(formDataMap[provice] || "")+'" {property} style="width: 33%;"></select>',property));
								fieldArr.push(replaceProperty('<select id="'+city+'" name="'+city+'" label="'+d.fieldlabel+'-市" initValue="'+(formDataMap[city] || "")+'" {property} style="width: 33%;"></select>',property));
								fieldArr.push(replaceProperty('<select id="'+country+'" name="'+country+'" label="'+d.fieldlabel+'-区" initValue="'+(formDataMap[country] || "")+'" {property} style="width: 34%;"></select>',property));
							}
							init.addressList.push({
								provice:provice,
								city:city,
								country:country
							});
						}
					}else if("map" == ctrltype){
						//6.Map类赋值
						if(fieldvalue){
							property.push('value="'+fieldvalue+'"');
						}
						fieldArr.push(replaceProperty('<input readonly="readonly" type="text" {property}/>',property));
					}else if("ref" == ctrltype){
						if(dataItemRef && dataItemRef.length > 0){
							var ship_cascade = d.ship_cascade;
							var ship_value = ship_cascade.value;
							for(var i in dataItemRef){
								var dref = dataItemRef[i];
								if(dref.field_id == field_id){
									//7.Ref类赋值
									if(fieldvalue){
										property.push('value="'+fieldvalue+'"');
									}
									fieldArr.push(replaceProperty('<input type="text" {property} dataItemId="'+dref.id+'" hiddenId="'+ship_value+'" />',property));
									break;
								}
							}
						}
						var extends_info = d.extends_info;
						if(extends_info){
							if(fieldvalue){
								property.push('value="'+fieldvalue+'"');
							}
							if(extends_info.selectType){
								property.push('selecttype="'+extends_info.selectType+'"');
							}
							if(extends_info.showType){
								property.push('selectshowtype="'+extends_info.showType+'"');
							}
							fieldArr.push(replaceProperty('<input type="text" {property} />',property));
						}
					}else if("orguser" == ctrltype || "orgusers" == ctrltype){
						var ship_cascade = d.ship_cascade;
						property.push('selectType="'+("orguser" == ctrltype ? 'userRadio' : 'userCheck')+','+ship_cascade.text+','+ship_cascade.value+'"');
						//orguser、orgusers类赋值
						if(fieldvalue){
							property.push('value="'+fieldvalue+'"');
						}
						fieldArr.push(replaceProperty('<input type="text" {property} />',property));
					}
					fieldArr.push('</div>');
				}
				fieldArr.push('</li>');
				fieldDom = $(fieldArr.join(""));
				domainDom.append(fieldDom);
				if(["ref","map","orguser","orgusers"].indexOf(ctrltype) > -1){
					var ship_cascade = d.ship_cascade;
					if(ship_cascade){
						var ship_value = ship_cascade.value;
						var ship_text = ship_cascade.text;
						//8.Map、Ref隐藏控件类赋值
						$("#"+ship_text).before('<input type="hidden" value="'+(formDataMap[ship_value]||'')+'" id="'+ship_value+'" name="'+ship_value+'" label="'+ship_value+'" />');
						if("map" == ctrltype){
							init.mapList.push(ship_text);
						}else if("ref" == ctrltype){
							init.refList.push(ship_text);
						}
					}
				}else if("attachment" == ctrltype){
					//9.文件类赋值
					commAttachment.call(fieldDom.find("[dctype='attachment']"),fieldvalue);
				}
			}
		}
	},
	initControlEvent:function(el){
		initDynamicRequire(el);//日期
		//文件
		for(var i in init.fileList){
			var o = init.fileList[i];
			var fileId = o.fieldname;
			var ctrltype = o.ctrltype;
			var fileTypes = "*.*";
			if(ctrltype == "vedio"){
				fileTypes = "*.mp4;*.flv";
			}else if(ctrltype == "music"){
				fileTypes = "*.mp3;*.wav";
			}
			$("#"+fileId).data("data",{
		 		file_types:fileTypes,
		 		file_upload_limit: o.file_limit || 0,
		 		file_size_limit: o.file_size*1024 || 0
			});
		}
		if(window.wzAttach){
			wzAttach.initAttachUpload(el);
		}
		//地图
		for(var i in init.mapList){
			var mapId = init.mapList[i];
			$("#"+mapId).click(function(){
				openPosition(this);
			});
		}
		//引用类型
		initDataItem();
		//人员单选、多选类型、引用业务内置类型
		initComponent();
		//引用业务内置类型查看
		initShowComponent();
		//省市区
		for(var i in init.addressList){
			var addressId = init.addressList[i];
			var provice = addressId.provice;
			var city = addressId.city;
			var country = addressId.country;
			addressInit(provice,city,country,$("#"+provice).attr("initValue"),$("#"+city).attr("initValue"),$("#"+country).attr("initValue"));
		}
		//数值运算
		for(var i in init.intlogicalList){
			var data = init.intlogicalList[i];
			var value = data.value;
			var lv = data.formulaValue;
			var items = lv.match(/[\.#]col_\d+_\d+/g);
			var els = [];
			$.each(items,function(i,o){
				var el;
				if(o[0] == "#"){
					el = $(o);
				}else{
					//子表单字段运算
					if(!init.sontableFieldLogical[o.substr(1)]){
						init.sontableFieldLogical[o.substr(1)] = {
							lamda: data,
							event: calcLamda
						};
					}
				}
				$(el).data("lamda",data);
				$(el).unbind().bind("keyup",function(){
					calcLamda(this);
				});
			});
			if(value[0] == "#"){
				$(value).attr("readonly",true);
			}else{
				if(!init.sontableCalcControl[value.substr(1)]){
					init.sontableCalcControl[value.substr(1)] = 1;
				}
			}
		}
		//子表单
		for(var domainId in init.sontableMap){
			var sontableFields = init.sontableMap[domainId]["field"];
			var sontableData = init.sontableMap[domainId]["data"];
			var domainDom = $("#"+domainId).find("ul");
			var son_form_id = sontableFields[0]["son_form_id"];
			
			var sonArr = [];
			sonArr.push('<li class="col-lg-12 col-md-12 col-sm-12 col-xs-12">');
			sonArr.push('<div>');
				sonArr.push('<div id="'+son_form_id+'" dctype="form-table"></div>');
			sonArr.push('</div>');
			sonArr.push('</li>');
			
			domainDom.append(sonArr.join(""));
			var formTable = $("#"+son_form_id);
			var fields = [];
			for(var i in sontableFields){
				var field = sontableFields[i];
				var obj = {
					field: field.fieldname,
					label: field.fieldlabel,
					type: field.ctrltype
				};
				if(field.isrequire == 1){
					obj.required = true;
				}
				if(field.fieldformat){
					obj.formatter = field.fieldformat;
				}
				if(field.istooltip == 1 && field.tooltip){
					obj.placeholder=field.tooltip;
				}
				if(!isNaN(field.maxlength) && field.maxlength > 0){
					obj.maxlength = field.maxlength;
				}
				if(field.ctrltype == "int" || field.ctrltype == "decimal"){
					obj.number = true;
				}
				//子表单运算字段处理
				var bdata = init.sontableFieldLogical[field.fieldname];
				if(bdata){
					obj.keyup = bdata.event;
					obj.binddata = {
						key:"lamda",
						data:bdata.lamda
					};
				}
				//子表单运算被赋值字段处理
				if(init.sontableCalcControl[field.fieldname]){
					obj.readonly = true;
				}
				fields.push(obj);
			}
			$(formTable).formtable({
				columns:fields
			});
			$(formTable).formtable("setData",sontableData);//初始化
		}
	}
};
function calcLamda(input){
	try{
		var rowDom;
		var data = $(input).data("lamda");
		var elCon = data.value;
		var lamdaValue = data.formulaValue;
		var cycle = lamdaValue;
		var items = lamdaValue.match(/∑\([\.]col_\d+_\d+\)|[\.#]col_\d+_\d+/g);
		var num = [];
		for(var i in items){
			var item = items[i];
			var v = 0;
			if(item[0] == "#"){
				v = $(item).val();
			}else if(item[0] == "."){
				rowDom = $(input).parents(".formtable-list:first");
				v = $(rowDom).find("[field='"+item.substr(1)+"']").val();
			}else if(item[0] == "∑"){
				rowDom = $(input).parents(".formtable-list:first");
				var cls = item.match(/col_\d+_\d+/g);
				$("[field='"+cls+"']").each(function(){
					if($(this).val() && !isNaN($(this).val())){
						v+= parseFloat($(this).val());
					}
				});
			}
			if(data.type == "intlogical"){
				cycle = cycle.replace(item,v||0);
			}else if(data.type == "stringlogical"){
				v = "'"+v+"'";
				cycle = cycle.replace(item,v||"''");
			}
		}
		if(elCon[0] == "#"){
			$(elCon).val(eval("("+cycle+")"));
			$(elCon).trigger("keyup");
		}else{
			$(rowDom).find("[field='"+elCon.substr(1)+"']").val(eval("("+cycle+")"));
			$(rowDom).find("[field='"+elCon.substr(1)+"']").trigger("keyup");
		}
	}catch(er){
		
	}
}
function getForbiden(){
	var data = initRequest(ctx + "/form/formdefined/json/initForbidenData.action",null,{
		formid : formid,
		workFlowflag : workFlowflag,
		mversion : mversion,
		fversion : fversion,
		taskdef : taskdef
	});
	for(var i in data){
		var obj = data[i];
		var fieldname = obj["fieldid"];
		if(obj["mandatory"]){//是否必填
			init.forbiden["required"].push(fieldname);
		}else if(obj["invisible"]){//是否隐藏
			init.forbiden["hidden"].push(fieldname);
		}else if(obj["disable"]){//是否只读
			init.forbiden["readonly"].push(fieldname);
		}
	}
}
function openPosition(el) {
	var pos = $(el).prev().val();
	var param = "";
	if(pos){
		pos = pos.split(',');
		param = '?lng='+pos[0]+'&lat='+pos[1];
	}
	openWin({
		iframe:true,
		title:"位置坐标",
		width:835,
		height:400,
		url:ctx + '/comm/map.jsp'+param
	},function(obj) {
		if(obj){
			$(el).prev().val(obj.lng+","+obj.lat);
			$(el).val(obj.address);
		}
	});
}
function replaceProperty(str,property){
	return str.replace(/{property}/,property.join(" "));
}
