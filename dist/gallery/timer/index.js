KISSY.add('brix/gallery/timer/index', function(S, Brick) {
	var S = KISSY, $ = S.all;
	function TimerManager() {
		TimerManager.superclass.constructor.apply(this, arguments);
	}
	TimerManager.ATTRS = {
		mode : {
			value : 'down'
		},
		timeEnd : {
			value : 0
		},
		timeLeft : {
			value : 0
		},
		updateTime : {
			value : 0
		},
		//时间不带单位
		style : {
			value : 'units'
		},
		//数字部分加粗
		bold : {
			value : false
		},
		//数字部分颜色为红色
		highlight : {
			value : false
		},
		//是否需要使用服务器时间对计时器进行校正
		needAjusted : {
			value : true
		},
		ajustTime : {
			value : 60000
		}
		
	};
	var MILLISECONDS_PER_DAY = 24 * 3600 * 1000;
	
	var timers = [];
	//存储页面上的TimerSpan实例
	var units = {
		'years' : '年',
		'months' : '月',
		'days' : '天',
		'hours' : '小时',
		'mins' : '分钟',
		'secs' : '秒'
	};

	/**
	 * 计算当前月到shift个月之间的天数
	 * */
	var borrowMonths = function(ref, shift) {
		var prevTime = ref.getTime();
		ref.setUTCMonth(ref.getUTCMonth() + shift);
		return Math.round((ref.getTime() - prevTime) / MILLISECONDS_PER_DAY);
	}
	/**
	 * 计时器
	 */
	function Timer(option) {
		var defaultOption = {
			container : null,
			type : 'down', //两种类型的计时器:'down' 和 'up'
			htmlTemplate : ''
		};
		this.config = S.merge(defaultOption, option || {});
	}

	Timer.prototype = {
		_init : function() {
			this._container = $(this.config.container);
			if(!this._validate()) {
				return;
			}
			var obj = this._populate();
			var interval = this._getInterval(obj);
			this.render(obj);
			this._startCount(interval);
		},
		_startCount : function() {
		},
		/**
		 * 对参数进行验证
		 */
		_validate : function() {
		},
		/**
		 * 根据当前时间计算要显示的时间，返回一个包含天、小时、分钟、秒的对象
		 */
		_populate : function() {
		},
		_getInterval : function() {
		},
		render : function() {
		},
		/**
		 * 对时间进行校正
		 * @param {serverTime}  服务器时间
		 */
		calibrate : function(serverTime) {
		},
		_getCheckedTime : function() {
			var offsetTime = this._offsetTime || 0;
			return new Date(new Date().getTime() + offsetTime);
		}
	}

	/**
	 * 类型up：几分钟前降价
	 */
	function TimerUp(option) {
		var defaultOption = {
			htmlTemplate : '前降价'
		};
		this.config = S.merge(defaultOption, option || {});
		TimerUp.superclass.constructor.call(this, this.config);
		this._init();
	}


	S.extend(TimerUp, Timer, {
		_startCount : function(interval) {
			var self = this, start = (new Date).getTime(), interval = interval;

			function timerInstance() {
				var obj = self._populate(), 
					cur = self._getCheckedTime();
				interval = self._getInterval(obj);
				self.render(obj);
				self._timerHandler = setTimeout(timerInstance, interval);
			}
			self._timerHandler = setTimeout(timerInstance, interval);
		},
		_validate : function() {
			var cfg = this.config;
			//显示定时器的容器必须存在
			if(!this._container.length)
				return;
			if(!cfg.updateTime)
				return;

			var t = this._getCheckedTime();
			//更新时间必须比当前的时间早
			if(t.getTime() < cfg.updateTime) {
				return;
			}
			return true;
		},
		_populate : function() {
			var updateTime = this.config.updateTime, 
				curTime = this._getCheckedTime();
			var hours, hours, mins, secs, days, months, years, floor = Math.floor, 
				leftTime = parseInt((curTime.getTime() - updateTime) / 1000), 
				uTime = new Date(updateTime);

			if (leftTime <= 0) {
				years = 0;
				months = 0;
				days = 0;
				mins = 0;
				secs = 0;
			} else {
				years = curTime.getFullYear() - uTime.getFullYear();
				months = curTime.getMonth() - uTime.getMonth();
				hours = floor(leftTime / 3600);
				days = floor(hours / 24);
				hours = hours % 24;
				mins = floor(leftTime / 60 % 60);
				secs = leftTime % 60;
			}			
			return {
				'years' : years,
				'months' : months,
				'days' : days,
				'hours' : hours,
				'mins' : mins,
				'secs' : secs
			};
		},
		_getInterval : function(obj) {
			var type = this.config.type, 
				start = new Date;
			var	intervas = {
				'years' : 360 * 24 * 3600 * 1000,
				'months' : borrowMonths(new Date(start.getFullYear(), start.getMonth(), 15), 1) * 24 * 3600 * 1000,
				'days' : 24 * 3600 * 1000,
				'hours' : 3600 * 1000,
				'mins' : 60 * 1000,
				'secs' : 1000
			};
			this.unit = this.pruneUnits(obj);
			return intervas[this.unit];
		},
		/**
		 * 计算已过时间的最大单位
		 * @param  {Object} 由_populate函数生成的包含时间的对象
		 */
		pruneUnits : function(obj) {

			if(obj.years >= 1) {
				return 'years';
			}
			if(obj.years < 1 && obj.months >= 1) {
				return 'months';
			}
			if(obj.days >= 1) {
				return 'days';
			}
			if(obj.hours >= 1) {
				return 'hours';
			}
			if(obj.mins >= 1) {
				return 'mins';
			}
			if(obj.secs >= 1) {
				return 'secs'
			}
			return 'secs';
		},
		render : function(obj) {
			var html = obj[this.unit] + units[this.unit] + this.config.htmlTemplate;
			this._container.html(html);
		},
		calibrate : function(serverTime) {
			this._offsetTime = serverTime - (new Date).getTime();
			if(this._timerHandler){
				clearTimeout(self._timerHandler);
				this._init();
			}			
		}
	});
	function TimerDown(option) {
		var defaultOption = {
			timeEnd : 0,
			timeCurrent : 0,
			timeLeft : 0,
			leadingZero : true,
			style : 'units',
			days : /%\{d\}/,
			hours : /%\{h\}/,
			mins : /%\{m\}/,
			secs : /%\{s\}/,
			interval : 1000
		};
		this.config = S.merge(defaultOption, option || {});
		TimerDown.superclass.constructor.call(this, this.config);
		var htmlTpls = {
			'units' : '<span class="timer-ux ' + (this.config.bold  ? 'timer-bold ' : '' ) + 
			(this.config.highlight ? 'timer-highlight ' : '' ) + '"><span class="timer-title">剩余：</span>' + 
			'<span class="timer-days timer-num">%{d}</span>天<span class="timer-hours  timer-num">%{h}</span>时' + 
			'<span class="timer-mins  timer-num">%{m}</span>分<span class="timer-secs  timer-num">%{s}</span>秒</span>',

			'simple' : '<span class="timer-ux ' + (this.config.bold  ? 'timer-bold ' : '' ) + 
			(this.config.highlight ? 'timer-highlight ' : '' ) + '"><span class="timer-title">剩余：</span>' + 
			'<span class="timer-hours  timer-num">%{h}</span><span class="timer-num">:</span>' + 
			'<span class="timer-mins  timer-num">%{m}</span><span class="timer-num">:</span>' + 
			'<span class="timer-secs  timer-num">%{s}</span></span>'

		};
		this.config.htmlTemplate = htmlTpls[this.config.style];
		this._init();
	}


	S.extend(TimerDown, Timer, {
		_startCount : function(interval) {
			var self = this, start = (new Date).getTime(), interval = self.config.interval;

			function timerInstance() {
				self._leftTime--;
				var obj = self._populate();
				if(self._leftTime < 0) {
					//完成后执行回调
					self.config.callback && self.config.callback.call(self);
					TimerManager.remove(self);
					return;
				}				
				self.render(obj);
				self._timerHandler = setTimeout(timerInstance, interval);
			}

			setTimeout(timerInstance, interval);
		},
		_validate : function() {
			var cfg = this.config;
			//显示定时器的容器必须存在
			if(!this._container.length)
				return;
			if(!cfg.timeEnd && !cfg.timeLeft)
				return;

			var t = new Date();
			//开始时间没有就取当前客户端时间
			if(!cfg.timeCurrent) {
				cfg.timeCurrent = t.getTime();
			}
			//剩余时间，优先取timeLeft
			this._leftTime = cfg.timeLeft || (cfg.timeEnd - cfg.timeCurrent);
			if(this._leftTime < 0)
				return;
			this._leftTime = parseInt(this._leftTime / 1000);
			return true;
		},

		_populate : function() {
			var hours, hours, mins, secs, days, 
				floor = Math.floor, 
				leftTime = this._leftTime;

			hours = floor(leftTime / 3600);
			days = floor(hours / 24);
			hours = hours % 24;
			mins = floor(leftTime / 60 % 60);
			secs = leftTime % 60;

			//补零
			if(hours < 10)
				hours = '0' + hours;
			if(mins < 10)
				mins = '0' + mins;
			if(secs < 10)
				secs = '0' + secs;

			var start = new Date();
			return {
				'days' : days,
				'hours' : hours,
				'mins' : mins,
				'secs' : secs
			};
		},
		/**
		 * 获取更新频率
		 */
		_getInterval : function(obj) {
			return this.config.interval;
		},
		render : function(obj) {
			var cfg = this.config, $ = KISSY.all, html;
			if(!this.isShowed) {
				html = cfg.htmlTemplate.replace(cfg.days, obj.days).replace(cfg.hours, obj.hours).replace(cfg.mins, obj.mins).replace(cfg.secs, obj.secs);
				this._container.html(html);
				this.isShowed = true;
			} else {
				$('.timer-days', this._container).html(obj.days);
				$('.timer-hours', this._container).html(obj.hours);
				$('.timer-mins', this._container).html(obj.mins);
				$('.timer-secs', this._container).html(obj.secs);
			}
		},
		/**
		 * 外部唤醒校准
		 * 并返回秒表状态供判断
		 * off = st1 + lt1
		 * lt2 = off - st2
		 */
		calibrate : function(serverTime) {
			if(this._leftTime <= 0) {
				return false;
			}
			var serverTime = Math.floor(serverTime / 1000)
			if(!this._timeOffset) {
				this._timeOffset = serverTime + this._leftTime;
			} else {
				this._leftTime = this._timeOffset - serverTime;
			}
			return true;
		}
	});


	var adjust = {

		_checkerRunner : null,
		_status : 0, //状态
		/**
		 * 初始化adjust
		 */
		init : function(ajustTime) {
			if(this._status) return;
			var AJUST_TIME = ajustTime || 3600000;
			//定时获取服务器时间来矫正计时器
			var self = this, url = window.location.protocol + '//' + window.location.host + '?t=' + (+new Date());
			this._checkerRunner = setInterval(function() {
				var xhr, serverDate, serverTime, timeBefore = new Date().getTime(), timeAfter;
				function getServerDate(data, textStatus, xhr) {
					//取得响应头时间
					serverDate = new Date(xhr.getResponseHeader('Date'));
					serverTime = serverDate.getTime();
					timeAfter = new Date().getTime();
					self._calibrater(serverTime + timeAfter - timeBefore);
				};
				S.io({
					type : 'head',
					url : url,
					success : getServerDate
				});

			}, AJUST_TIME);
			self._status = 1;
		},
		/**
		 * 校准器
		 */
		_calibrater : function(serverTime) {

			if(this._serverDate == serverTime) {
				return;
			}
			S.each(timers, function(timer, num) {
				if(timer) {					
					timer.calibrate(serverTime);
				}

			})
			this._serverDate = serverTime;

			/**
			 * 所有秒表已结束：停止checker
			 */
			if(!timers.length) {
				this._clearChecker();
			}
		},

		/**
		 * 停止checker
		 */
		_clearChecker : function() {
			try {
				clearInterval(this._checkerRunner);
			} catch (e) {

			}
			this._status = 0;
		}
	};
	TimerManager.create = function(cfg) {
		var timer;
		cfg.needAjusted && adjust.init(cfg.ajustTime);
		switch (cfg.type) {
			case 'down': {
				timer = new TimerDown(cfg);
				break;
			}
			case 'up': {
				timer = new TimerUp(cfg);
				break;
			}
		}
		timers.push(timer);
		return timer;
	};
	TimerManager.remove = function(timer) {
		for (var i = 0,len = timers.length; i < len; i++){
			if ( timers[i] == timer ) {
				return timers.splice(i, 1);
			}
		}
	};
	S.extend(TimerManager, Brick, {
		initialize : function() {
			TimerManager.create({
				container : this.get('el'),
				type : this.get('mode'),
				timeLeft : this.get('timeLeft'),
				timeEnd : this.get('timeEnd'),
				updateTime : this.get('updateTime'),
				style : this.get('style'),
				highlight : this.get('highlight'),
				bold : this.get('bold'),
				needAjusted : this.get('needAjusted'),
				ajustTime: this.pagelet.get('ajustTime') || this.get('ajustTime')
			});
		}
	});

	return TimerManager
}, {
	requires : ["brix/core/brick"]
});
