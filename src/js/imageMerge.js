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
	function ImageMerge(opts) {
		this.defOpts = {
			imgItemWrap: '.imgItemWrap',
			imgItem: 'li',
			img: '.gl_dragsource',
			imgDel: '.imgItem_del',
			dropWrap: '.gl_container',
			gzoomSlider:'.gzoomSlider',
			container: '#container'
		};

		$.extend(this.defOpts, opts || {});
		this._init();
	}
	ImageMerge.prototype._init = function() {
		var self = this,
			opts = this.defOpts,
			imgItemWrap = opts.imgItemWrap,
			imgItem = opts.imgItem,
			img = opts.img,
			imgDel = opts.imgDel,
			container = opts.container,
			dropWrap = opts.dropWrap,
			gzoomSlider = opts.gzoomSlider,
			mergedCallback = opts.mergedCallback;


		$(gzoomSlider).slider({
			value: 100,
			min: 0,
			max: 200,
			step: 1,
			slide: function(event, ui) {
				if ($(this).closest(dropWrap).find('img')) {
					$(this).closest(dropWrap).find('.gl_jind').width(ui.value / 2 + '%')
					$(this).closest(dropWrap).find('img').width(ui.value + '%');
				}
			}
		});

		$(dropWrap).droppable({
			drop: function(event, ui) {
				if (event.stopPropagation)
					event.stopPropagation();
				else
					event.cancelBubble = true;
				source = ui.draggable.children();
				sourcename = parseInt(source.attr('name'));

				targetw = parseInt($(this).css('width'));
				targeth = parseInt($(this).css('height'));
				var dd = $("<img class='cimg ui-draggable templateImg' name='" + sourcename + "' src='" + source.attr('src') + "' style='width:100%;top:-17px;'/>");
				if ($(this).children('img').attr('name') && sourcename && source.attr('src')) {
					$(this).children('img').attr('name', sourcename);
					$(this).children('img').attr('src', source.attr('src'));
				} else {
					if (!sourcename || !source.attr('src')) {} else {
						$(this).append(dd);
					}
				}
				$(dd).draggable();

				setTimeout(function() {
					if (ui.draggable.parent('li')) {
						$(ui.draggable.parent('li')).remove();
					}
				});
			}
		});
	}

	// 图片合并
	ImageMerge.prototype.doMerge = function(canvasWidth, mergedCallback) {
			var self = this,
				opts = this.defOpts,
				container = opts.container;

			var tmp_canvas = document.createElement('canvas'),
				tmp_ctx = tmp_canvas.getContext('2d');

			var width = $(container).width() || 948,
				height = $(container).height() || 710,
				canvasWidth = canvasWidth || width,
				canvasZoomRatio = canvasWidth / width,
				// 定位每个图在画布中的位置
				positions = [],
				// 外围容器相对浏览器左上角位置
				relationRect = $(container)[0].getBoundingClientRect();

			tmp_canvas.width = width * canvasZoomRatio;
			tmp_canvas.height = height * canvasZoomRatio;

			// 清除画布
			tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

			var num = 0;
			$('.gl_container').each(function(i, v) {
				if (!$(v).find('.templateImg') || !$(v).find('.templateImg').length) {
					return;
				}
				num++;
				var currRect = $(v)[0].getBoundingClientRect();

				var img = $(v).find('.templateImg');
				var tmp_img = new Image();
				tmp_img.src = img.attr('src');

				tmp_img.onload = function() {
					var real_imgWidth = tmp_img.width,
						real_imgHeight = tmp_img.height,
						imgWidth = img.width(),
						imgHeight = img.height(),
						imgTop = img.position().top,
						imgLeft = img.position().left,
						conWidth = $(v).width(),
						conHeight = $(v).height(),
						conTop = currRect.top - relationRect.top,
						conLeft = currRect.left - relationRect.left,
						// 缩放比例，和slider不同
						zoomRatio = real_imgWidth / imgWidth,
						position = {};

					position.img = img[0];

					position.imgTop = 0;
					position.imgLeft = 0;
					if (imgTop > 0) {
						position.canvasTop = conTop + imgTop;
					} else {
						position.canvasTop = conTop;
						position.imgTop = -imgTop * zoomRatio;
					}
					if (imgLeft > 0) {
						position.canvasLeft = conLeft + imgLeft;
					} else {
						position.canvasLeft = conLeft;
						position.imgLeft = -imgLeft * zoomRatio;
					}

					// 计算图片在画布上的宽、高及所占画布的宽、高
					if ((imgWidth + imgLeft) >= conWidth) {
						if (imgLeft <= 0) {
							position.imgWidth = conWidth;
						} else {
							position.imgWidth = conWidth - imgLeft;
						}
					} else {
						if (imgLeft <= 0) {
							position.imgWidth = imgWidth + imgLeft;
						} else {
							position.imgWidth = imgWidth;
						}
					}

					if ((imgHeight + imgTop) >= conHeight) {
						if (imgTop <= 0) {
							position.imgHeight = conHeight;
						} else {
							position.imgHeight = conHeight - imgTop;
						}
					} else {
						if (imgTop <= 0) {
							position.imgHeight = imgHeight + imgTop;
						} else {
							position.imgHeight = imgHeight;
						}
					}
					position.canvasWidth = position.imgWidth * canvasZoomRatio;
					position.canvasHeight = position.imgHeight * canvasZoomRatio;
					position.canvasTop = position.canvasTop * canvasZoomRatio;
					position.canvasLeft = position.canvasLeft * canvasZoomRatio;

					position.imgWidth = position.imgWidth * zoomRatio;
					position.imgHeight = position.imgHeight * zoomRatio;
					positions.push(position);
					num--;
					if (num <= 0) {
						doMerge();
					}
				}
			});

			// 图片合并
			function doMerge() {
				// console.log(positions);
				// return ;
				if (positions && positions.length > 0) {
					for (var i = 0; i < positions.length; i++) {
						var poi = positions[i];
						// continue;
						tmp_ctx.drawImage(poi.img, poi.imgLeft, poi.imgTop, poi.imgWidth, poi.imgHeight,
							poi.canvasLeft, poi.canvasTop, poi.canvasWidth, poi.canvasHeight);
					}

					// 修改图片背景
					var imageData = tmp_ctx.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height),
						data = imageData.data;

					for (var j = 0; j < data.length; j += 4) {
						var r = data[j],
							g = data[j + 1],
							b = data[j + 2];
						if (r == 0 && g == 0 && b == 0) {
							data[j] = 255,
								data[j + 1] = 255,
								data[j + 2] = 255;
							data[j + 3] = 255;
						}
					}

					tmp_ctx.putImageData(imageData, 0, 0);

					var tmp_base64 = tmp_canvas.toDataURL("image/png");
					tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
					if (mergedCallback) {
						mergedCallback.call(null, tmp_base64);
					}
				}
			}
		}
		// 清除drop内容
	ImageMerge.prototype.clearDrop = function() {
		var self = this,
			opts = this.defOpts,
			container = opts.container;

		$(container).find('.gl_container').html('');
	}
	window.ImageMerge = ImageMerge;
});