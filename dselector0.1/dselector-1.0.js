(function($){
	$.fn.DSelector = function(){
		var method = arguments[0];
		var config = $.extend($.fn.DSelector.defaults,arguments[1]);
		if(method == undefined){method=$.fn.DSelector.defaults.method;}
		config.uuid= '#'+$(this).attr('id');
		//console.log(this);
		$.fn.DSelector.InitSelectorHTML();
		$.fn.DSelector.Init();
		$.fn.DSelector.SetValue();
		
	},
	$.fn.DSelector.InitSelectorHTML = function(){
		var _default = this.defaults;
		var _div = $(_default.div);
		var $body = _div.clone().addClass('mselector');
		var lselector = _div.clone().addClass('lselector');
		var lcontent = _div.clone().addClass('lselector_content');
		var rselector = _div.clone().removeClass('lselector').addClass('rselector');
		var rcontent = _div.clone().addClass('rselector_content');
		var midselector = _div.clone().addClass('midselector');
		var toolbar  = _div.clone().addClass('midselector_toolbar');
		    toolbar.append('<ul><li id="Left2Right"><span> --> </span></li></ul>'
                          +'<ul><li id="Right2Left"><span> <-- </span></li></ul>'
                          +'<ul><li id="RightAllSelected"><span> <==  </span></li></ul>'
                          +'<ul><li id="LeftAllSelected"><span> ==>  </span></li></ul>'
                          +'<ul><li id="ReSelect"><span> ReSelect  </span></li></ul>');
		    midselector.append(toolbar);
		    lselector.append(lcontent);
		    rselector.append(rcontent);
		    $body.append(lselector);
		    $body.append(midselector);
		    $body.append(rselector);
		var $container = $(_default.uuid);
		    $container.append($body);
	},
	$.fn.DSelector.defaults={
		uuid:'#mselector',
		method:'init',
		url:'',
		postData:undefined,
		localData:[],
		selectData:[],
		li:'<li/>',
		ul:'<ul/>',
		div:'<div></div>',
		span:'<span/>',
		inputHidden:'<input type=\'hidden\'/>',
		textField:'name',
		valueField:'id',
		lcontent:'.lselector_content',
		rcontent:'.rselector_content',
		ms:'midselector',
		msbar:'midselector_toolbar',
		larray:[],
		rarray:[],
		onClick:undefined,
		msgWarn:false
	},
	$.fn.DSelector.Init=function(config){
		config = $.fn.DSelector.defaults;
		config.lmap =config.lmap= new Array();
		if(config.url !=undefined && config.url!=''){
			this.InitAsyncRows();
		}else{
			this.InitLocalRows(config.localData);
		}
		$.fn.DSelector.DelegateMidBarEvents();
		$.fn.DSelector.DelegateClickEvents();
	},
	$.fn.DSelector.DelegateMidBarEvents = function(){
		var _default = this.defaults;
		$(_default.uuid).find('.'+_default.msbar).find('ul').on('click',this.MidBarHandle);
	},
	$.fn.DSelector.MidBarHandle = function(){
		var _type = $(this).find('li:eq(0)').attr('id');
		//console.log("user click events type :"+_type);
		eval('$.fn.DSelector.'+_type+"();");
	},
    $.fn.DSelector.InitAsyncRows = function(){
		var remoteData = this.GetRemoteData();
		this.defaults.localData = remoteData;
		console.log('this.defaults.localData'+this.defaults.localData.length);
		this.InitLocalRows();
	},
	$.fn.DSelector.InitLocalRows = function(rows){
		var _default = this.defaults;
		$.fn.DSelector.FilterRightItemData(_default.localData,_default.selectData);
		// Clear Html 
		$(_default.uuid).find(_default.lcontent+" , "+_default.rcontent).html("");
		//console.log('leftarray'+_default.larray.length);
		$.fn.DSelector.appendLeftRow(_default.larray);
		$.fn.DSelector.appendRightRow(_default.rarray);
	},
	$.fn.DSelector.FilterRightItemData = function(rows,valueRows){
		if(valueRows.length==0){
			this.defaults.larray = rows;
			return ;
		}
		var _leftArray  = new Array();
		var _rightArray = new Array();
		var _default = this.defaults;
		for(var key in rows){
			var row = rows[key];
			var flag =false;
			for(var selectKey in valueRows){
				var select  = valueRows[selectKey];
				if((select+"") === eval("row."+_default.valueField)){
					_rightArray.push(row);
					flag=true;
				}
			}
			if(!flag){
				_leftArray.push(row);
			}
			
		}
		
		_default.larray = _leftArray;
		_default.rarray = _rightArray;
	},
	$.fn.DSelector.appendLeftRow = function(rowData){
		var _default = this.defaults;
		for(var key in rowData){
			this.appendRow(_default.lcontent,rowData[key]);
			//$.fn.DSelector.appendRow(_default.lcontent,rowData[key]);
		}
	},
	$.fn.DSelector.appendRightRow = function(rowData){
		var _default = this.defaults;
		for(var key in rowData){
			$.fn.DSelector.appendRow(_default.rcontent,rowData[key]);
		}
	},
	$.fn.DSelector.appendRow=function(target,rowData){
		var _default = this.defaults;
		var _node  = $(_default.ul);
		    _node.append(_default.li);
			console.log('text'+eval("rowData."+(_default.textField)));
		var _text = $(_default.span).html(eval("rowData."+(_default.textField)));
		var _value = $(_default.inputHidden).val(eval("rowData."+(_default.valueField)));
		_node.find("li").append(_text).append(_value);
		
		$(_default.uuid).find(target).append(_node);
	},
	$.fn.DSelector.GetRemoteData = function(){
		//console.log('URL:'+this.defaults.url);
		var url = this.defaults.url;
		var data  = '';
		$.ajax({
			type : 'post',
			url : url,
			async : false,
			dataType : 'text',
			success : function(r) {
				data = eval('('+r+')');
				//console.log(data.length);
			}
		});
		return data;
	},
	$.fn.DSelector.DelegateClickEvents=function(config){
		var defaults = this.defaults;
		var target = $(defaults.uuid).find(defaults.lcontent+' , '+defaults.rcontent).find("ul");
		target.on('click',$.fn.DSelector.ItemClickHandle);
		$(defaults.uuid).find(defaults.lcontent+','+defaults.rcontent).find("ul").on('dblclick',$.fn.DSelector.ItemDBlClickHandle);
	},
	$.fn.DSelector.Left2Right = function(){
		var _default  = $.fn.DSelector.defaults;
		var _selector = $(_default.uuid);
		var selectedRows = _selector.find(_default.lcontent).find(".itemclick");
		if(selectedRows.length==0){
			this.Alert('Please select at least one row!');
			return ;
		}
	    selectedRows.each(function(i,n){
			 _selector.find(_default.rcontent).append($(n).clone().removeClass('itemclick').on('click',$.fn.DSelector.ItemClickHandle));
            $(this).remove();
		});
	},
    $.fn.DSelector.Right2Left = function(){
		var _default  = $.fn.DSelector.defaults;
		var _selector = $(_default.uuid);
		var selectedRows = _selector.find(_default.rcontent).find(".itemclick");
		if(selectedRows.length==0){
			this.Alert('Please select at least one row!');
			return ;
		}
		selectedRows.each(function(i,n){
			 _selector.find(_default.lcontent).append($(n).clone().removeClass('itemclick').on('click',$.fn.DSelector.ItemClickHandle));
			 $(this).remove();
		});
	},
    $.fn.DSelector.LeftAllSelected = function(){
		//选择所有左侧数据
		//直接复制左侧内容数据到右侧,不进行遍历
		var _default  = $.fn.DSelector.defaults;
		var _selector = $(_default.uuid);
		var _content = _selector.find(_default.lcontent);
		_selector.find(_default.rcontent).append(_content.html());
		_content.html("");
	},
    $.fn.DSelector.RightAllSelected = function(){
		$.fn.DSelector.InitLocalRows();
	},
    $.fn.DSelector.ReSelect = function(){
		$.fn.DSelector.InitLocalRows();
	},
	$.fn.DSelector.ItemClickHandle = function(){
		var _default  = this.defaults;
		var _clazz = $(this).attr('class');
		if(_clazz=='itemclick'){
			$(this).removeClass('itemclick');
		}else{
			$(this).addClass('itemclick');
		}
	}
	$.fn.DSelector.ItemDBlClickHandle = function(){
		var _parentCs = $(this).parent().attr('class');
		var _default = $.fn.DSelector.defaults;
		if(_parentCs === _default.lcontent.substring(1,_default.lcontent.length)){
			var _selectedKey = $(this).find('input[type="hidden"]').val();
			$.fn.DSelector.MoveItem(_default.rcontent,$(this).clone());
			//$(this).remove();
		}else{
			$.fn.DSelector.MoveItem(_default.lcontent,$(this).clone());
		}
		$(this).remove();
	},
	$.fn.DSelector.GetValue = function(){
		//console.log($(this));
		var _default = this.defaults;
		var _array = new Array();
		$(_default.uuid).find(_default.rcontent).find("input").each(function(i,n){
			_array.push($(this).val());
		});
		return _array;
	},
	$.fn.DSelector.SetValue = function(){
		var _default = this.defaults;
		var _array = new Array();
		$(_default.uuid).find(_default.rcontent).find("input").each(function(i,n){
			//console.log('get selected value !!'+$(this).val());
			_array.push($(this).val());
		});
		return _array;
	},
    $.fn.DSelector.MoveItem = function(target,element){
    	var _default = this.defaults;
		$(_default.uuid).find(target).append(element);
	},
    $.fn.DSelector.Alert = function(msg){
		if(this.defaults.msgWarn){
			alert(msg);
		}else{
			//throw msg;
		}
	},
	
	$.fn.DSelector.RemoveRow = function(){
		
	}
})(jQuery)