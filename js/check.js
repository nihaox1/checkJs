/*!
 *	验证输入插件
 */
(function( $ ){
	var tool,
		Check,
		config;
	/*!
	 *	check的原型
	 *	@$self 		{JQDOM} 	待测input区域块的JQDOM
	 *	@args 		{array} 	check方法传入的参数
	 */
	Check = function( $self , args ){
		var _tool,
			_self 	= this,
			_config;
		_tool = {
			config : function(){
				_config = {
					container 	: $self,
					__args 		: args,
					render 		: args[ 0 ].render || function(){},
					rules 		: tool.data.get_rules( args ),
					inputs 		: 0
				};
				_config.inputs = tool.set_input_to_list( $self , _self );
			}
		};
		_tool.config();
		this.config = _config;
	};
	
	Check.fn = Check.prototype;
	
	/*!
	 *	@is_detail_error 	{boolean} 	是否要求详细错误信息 
	 *	@rtn 				{array}  	数组集合
	 */
	Check.fn.error = function( is_detail_error ){
		var _self 	= this,
			_err 	= [],
			_inputs = this.config.inputs,
			_tmp;
		for( var i = 0 , len = _inputs.length; i < len; i++ ){
			_tmp = tool.ev.test_error.call( _inputs[ i ] , _self );
			if( _tmp === false ){
				if( is_detail_error ){ 
					_err.push( _inputs[ i ] );
				} else {
					return true;
				};
			};
		};
		return _err.length ? _err : false;
	};

	tool = {
		data 	: {
			get_rules : function( args ){
				if( args[ 1 ] ){
					return $.extend( config.rules , args[ 1 ].rules );
				} else {
					return config.rules;
				};
			},
			config : function( opts ){
				if( opts.rules ){
					config.rules = $.extend( config.rules , opts.rules );
				};
			}
		},
		ev 	: {
			check_error : function( $input , opts ){
				var _config = this.config,
					_opts = opts[ 1 ] ? opts[ 1 ].split( "," ) : undefined,
					_pass = _config.rules[ opts[ 0 ] ].call( $input , $input.val() , _opts );
				_config.render( $input , _pass , $input.attr( "_content" ) );
				return _pass;
			},
			/*!
			 *	检测input错误
			 *	@check 	{Check} 	当前Check的实例
			 */
			test_error : function( check ){
				var _$this 	= $( this ),
					_rule	= _$this.attr( "_rule" ).replace( /\s*/gi , " " ).replace( /[\s*]/gi , "" ).split( " " ),
					_opts;
				for( var i = 0 , len = _rule.length; i < len; i++ ){
					_opts = _rule[ i ].replace( /(.*)\[(.*)\]/gi , "$1-$2" ).split( "-" );
					if( check.config.rules[ _opts[ 0 ] ] ){
						if( tool.ev.check_error.call( check , _$this , _opts ) === false ){
							return false; 
						};
					};
				};
			},
			/*!
			 *	每一次 触发验证 插件的 启动点
			 *	@$self 	{JQDOM} 	对应块的DOM元素
			 *	@args	{object} 	验证错误项的传入参数
			 */
			check : function( $self , args ){
				return new Check( $self , args );
			},
		},
		/*!
		 *	序列化并过滤掉待检测的input项  并绑定事件
		 *	@$self 	{JQDOM} 	待检测input的 块
		 *	@check 	{Check} 	当前Check的实例
		 */
		set_input_to_list : function( $self , check ){
			var _input = [];
			$self.find( "input , textarea , select , radio" ).each( function(){
				var _$this 	= $( this );
				if( _$this.attr( "_rule" ) ){
					_input.push( _$this );					
					_$this.blur( function(){
						tool.ev.test_error.call( this , check );
					} );
				};
			} );
			return _input;
		},
		config : function(){
			config 	= {
				rules	: {}
			};
		}
	};
	tool.config();

	$.fn.extend( {
		check 	: function( args , options ){
			if( args === "config" && typeof options === "object" ) {
				tool.data.config( options );
				return config;
			} else {
				return tool.ev.check( this , arguments );
			};
		}
	} );

	$.check = $.check || function( rule_name , value ){
		if( value && config.rules[ rule_name ] ){
			return !config.rules[ rule_name ]( value );
		};
	};

})( jQuery );

(function(){
	$.fn.check( "config" , {
		rules	: {
			email 		: function( str ){
				return /.*@[a-z,A-Z,\d]+..*$/gi.test( str );
			},
			length 		: function( str , options ){
				var _len = str.length;
				return _len < options[ 0 ] ? false :
							_len > options[ 1 ] ? false : true;
			},
			number 		: function( str , options ){
				return !$.isNumeric( str ) ? false : 
							!options ? true : 
								str < parseInt( options[ 0 ] ) ? false :
									str > parseInt( options[ 1 ] ) ? false : true; 
			},
			phone 		: function( str ){
				return /^1(3|5|8)\d{9}$/gi.test( str ) ? true : false;
			}
		}
	} );
})( jQuery );