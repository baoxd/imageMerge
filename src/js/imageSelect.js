(function(global, factory) {

	"use strict";

	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = global.document ?
			factory(global, true) :
			function(w) {
				if (!w.document) {
					throw new Error("error..");
				}
				return factory(w);
			};
	} else {
		factory(global);
	}

})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
	function ImageSelect(opts) {
		this.defaultOpts = {
			maxSize: 1048576,
			getItemHtml: function(base64, i) {
				return '<li class="imgEdit_item">' +
					'	<div class="y_loftlist">' +
					'		<img src="' + base64 + '">' +
					'		<span class="y_tit">户型图' + (i + 1) + '</span>' +
					'		<span class="y_edit01 imgEdit_state">未编辑</span>' +
					'	</div>' +
					'</li>';
			},
			triggerDom: $('#imgOpen_trigger'),
			fileDom: $('#imgOpen_file'),
			wrapDom: $('#imgOpen_trigger').closest('ul'),
			imgItemClassName: 'imgEdit_item',
			prevDom: $('#imgEdit_prev'),
			nextDom: $('#imgEdit_next'),
			currIndex: 0,
			everyWidth: 180,
			loadCallback: null
		};

		$.extend(this.defaultOpts, opts || {});

		this._init();
	}

	ImageSelect.prototype._init = function() {
		this._bindEvent();
	}

	ImageSelect.prototype._bindEvent = function() {
		var opts = this.defaultOpts,
			maxSize = opts.maxSize,
			triggerDom = opts.triggerDom,
			fileDom = opts.fileDom,
			wrapDom = opts.wrapDom,
			imgItemClassName = opts.imgItemClassName,
			prevDom = opts.prevDom,
			nextDom = opts.nextDom,
			getItemHtml = opts.getItemHtml,
			loadCallback = opts.loadCallback;

		$(triggerDom).on('click', function() {
			$(fileDom).trigger('click');
		});

		$(fileDom).on('change', function() {
			var files = $(this)[0].files,
				self = this;

			if (files && files.length > 0) {
				var num = $('.' + imgItemClassName).length,
					curIndex = 0;
				for (var i = 0; i < files.length; i++) {
					(function(i) {
						var reader = new FileReader();
						file = files[i],
							filename = file.name,
							filesize = file.size,
							html = '';
						reader.readAsDataURL(file);

						reader.onload = function() {
							if (curIndex >= 10) {
								return;
							}
							var base64 = reader.result;
							html = getItemHtml(base64, num);
							$(wrapDom).children().last().before(html);
							curIndex++;
							if (curIndex == files.length) {
								if (loadCallback) {
									loadCallback();
								}
							}
							num++;
							if (curIndex >= 10) {
								return;
							}
						}
					})(i);
				}
			}
		});

		var isMoving = false;

		$(prevDom).on('click', function() {
			var currIndex = opts.currIndex,
				everyWidth = opts.everyWidth;
			if (parseInt($(wrapDom).css('marginLeft')) >= 0 || isMoving) {
				return;
			} else {
				isMoving = true;
				$(wrapDom).animate({
					marginLeft: (parseInt($(wrapDom).css('marginLeft')) + everyWidth) + 'px'
				}, 200, function() {
					isMoving = false;
				});
			}
		});

		$(nextDom).on('click', function() {
			var currIndex = opts.currIndex,
				everyWidth = opts.everyWidth,
				items = $(wrapDom).find('.' + imgItemClassName),
				maxLeftNum = items.length - 5;

			if ($(triggerDom).is(':visible')) {
				maxLeftNum = maxLeftNum + 1;
			}
			console.log(maxLeftNum);
			if (!items.length || items.length < 5 || Math.abs(parseInt($(wrapDom).css('marginLeft')) / everyWidth) >= maxLeftNum || isMoving) {
				return;
			} else {
				isMoving = true;
				$(wrapDom).animate({
					marginLeft: (parseInt($(wrapDom).css('marginLeft')) - everyWidth) + 'px'
				}, 100, function() {
					isMoving = false;
				});
			}
		});
	}
	window.ImageSelect = ImageSelect;
});