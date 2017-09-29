;
(function($) {
    function LightBox() {
        var self = this;

        //创建遮罩和弹出层
        this.popupMask = $('<div id="G-lightbox-mask">');
        this.popupWin = $('<div id="G-lightbox-popup">');

        this.bodyNode = $(document.body);

        //存储同组图片数据
        this.groupData = [];
        this.groupName = null;
        this.index = null; //当前点击的索引

        this.bodyNode.on('click', '.js-lightbox,*[data-role="lightbox"]', function(e) {
            e.stopPropagation();

            let currentGroupName = $(this).data('group');
            if (currentGroupName != self.groupName) {
                self.groupName = currentGroupName;

                //根据组名获取同一组数据
                self.getGroup(self.groupName);
            }

            self.index = $(this).parent().find('.js-lightbox').index($(this));
            //获取当前图片的索引

            //初始化弹框
            self.InitPopup($(this));
        });

        this.renderDOM();


        this.popupViewArea = this.popupWin.find('div.lightbox-pic-view');
        this.popupPic = this.popupWin.find('img.lightbox-image');
        this.popupCaptionArea = this.popupWin.find('div.lightbox-pic-caption');

        this.nextBtn = this.popupWin.find('span.lightbox-next-btn');
        this.prevBtn = this.popupWin.find('span.lightbox-prev-btn');

        this.captionText = this.popupWin.find('p.lightbox-pic-desc');
        this.currentIndex = this.popupWin.find('span.lightbox-of-index');
        this.closeBtn = this.popupWin.find('span.lightbox-close-btn');


        this.popupMask.on('click', function() {
            $(this).fadeOut();
            self.popupWin.fadeOut();
        });

        this.closeBtn.on('click', function() {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
        });

        this.nextBtn.hover(function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).addClass('lightbox-next-btn-show');
            }
        }, function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-next-btn-show');
            }
        }).click(function(event) {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                event.stopPropagation();
                self.GoTo('next');
            }
        });


        this.prevBtn.hover(function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).addClass('lightbox-prev-btn-show');
            }
        }, function() {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                $(this).removeClass('lightbox-prev-btn-show');
            }
        }).click(function(event) {
            if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
                event.stopPropagation();
                self.GoTo('prev');
            }
        });
    };

    LightBox.prototype = {
        GoTo: function(dir) {
            if (dir === 'next') {
                this.index++;
                if (this.index >= this.groupData.length - 1) {
                    this.nextBtn.addClass('disabled').removeClass('lightbox-next-btn-show');
                }
                if (this.index != 0) {
                    this.prevBtn.removeClass('disabled');
                }

                let src = this.groupData[this.index].src;

                this.loadPicSize(src);
                //this.showMaskAndPopup(src);

            } else if (dir === 'prev') {
                this.index--;
                if (this.index <= 0) {
                    this.prevBtn.addClass('disabled').removeClass('lightbox-prev-btn-show');
                }
                if (this.index != this.groupData.length - 1) {
                    this.nextBtn.removeClass('disabled');
                }

                let src = this.groupData[this.index].src;
                this.loadPicSize(src);
            }
        },

        changePopupSize: function(w, h) {
            let self = this;
            let width = $(window).width(),
                height = $(window).height();

            //如果图片大于屏幕适口大小,则进行释放 , "1"是重点
            let scale = Math.min(height / (h + 10), width / (w + 10), 1);

            //如果没有适口大，则为 1 !!

            w = w * scale;
            h = h * scale;

            this.popupViewArea.animate({
                width: w - 10,
                height: h - 10,
            });
            this.popupWin.animate({
                width: w,
                height: h,
                marginLeft: -w / 2,
                top: (height - h) / 2,
            }, function() {
                self.popupPic.css({
                    width: w - 10,
                    height: h - 10
                }).fadeIn();
                self.popupCaptionArea.fadeIn();
            });

            this.captionText.text(this.groupData[this.index].caption);
            this.currentIndex.text('当前索引: ' + (this.index + 1) + ' of ' + this.groupData.length);

        },

        preImageLoad: function(src, callback , error) {
            let img = new Image();

            img.src = src;

            if (!!window.ActiveXObject) {
                img.onreadystatechange = function() {
                    if (this.readyState == 'complate') {
                        callback();
                    }
                }
            } else {
                img.addEventListener('error', function(){
                    error();
                });
                img.onload = function() {
                    callback();
                };

            }

        },

        loadPicSize: function(src) {
            let self = this;
            this.popupPic.css({ width: 'auto', height: 'auto' }).hide();

            //预加载图片
            this.preImageLoad(src, function() {
                self.popupPic.attr('src', src);

                let picWidth = self.popupPic.width();
                let picHeight = self.popupPic.height();

                //改变图片宽高
                self.changePopupSize(picWidth, picHeight);
            },function(){
                self.popupPic.hide();
            });
        },

        showMaskAndPopup: function(sourceSrc, currentId) {
            let self = this;
            this.popupPic.hide();
            this.popupCaptionArea.hide();

            let width = $(window).width(),
                height = $(window).height();

            this.popupViewArea.css({
                width: width / 2,
                height: height / 2,
            });

            this.popupMask.fadeIn();
            this.popupWin.fadeIn();

            this.popupWin.css({
                width: width / 2 + 10,
                height: height / 2 + 10,
                marginLeft: -(width / 2 + 10) / 2,
                top: -(height / 2 + 10)
            }).animate({
                top: (height / 2 - 10) / 2,
            }, function() {
                //加载图片
                self.loadPicSize(sourceSrc);
            });

            let groupDataLength = this.groupData.length;
            if (groupDataLength > 1) {
                if (this.index === 0) {
                    this.prevBtn.addClass('disabled');
                    this.nextBtn.removeClass('disabled');
                } else if (this.index === groupDataLength - 1) {
                    this.nextBtn.addClass('disabled');
                    this.prevBtn.removeClass('disabled');
                } else {
                    this.nextBtn.removeClass('disabled');
                    this.prevBtn.removeClass('disabled');
                }
            }
        },

        InitPopup: function(currentObj) {
            let self = this,
                sourceSrc = currentObj.attr('src'),
                currentId = currentObj.data('id');

            this.showMaskAndPopup(sourceSrc, currentId);
        },

        getGroup: function(group) {
            let self = this;

            //获取相同组别对象
            let grouplist = $("*[data-group=" + group + "]");

            self.groupData.length = 0;
            grouplist.each(function(index, el) {
                self.groupData.push({
                    src: $(this).attr('src'),
                    id: $(this).data('id'),
                    caption: $(this).data('caption')
                });
            });
        },

        renderDOM: function() {

            let strDom = '<div class="lightbox-pic-view">' +
                '<span class="lightbox-btn lightbox-prev-btn"></span>' +
                '<img src="images/1-1.jpg" class="lightbox-image">' +
                '<span class="lightbox-btn lightbox-next-btn"></span>' +
                '</div>' +
                '<div class="lightbox-pic-caption">' +
                '<div class="lightbox-caption-area">' +
                '<p class="lightbox-pic-desc">图片标题</p>' +
                '<span class="lightbox-of-index">索引 0 of 0</span>' +
                '</div>' +
                '<span class="lightbox-close-btn"></span>' +
                '</div>';

            this.popupWin.html(strDom);
            this.bodyNode.append(this.popupMask, this.popupWin);
        }
    }

    window.LightBox = LightBox;

    new LightBox();
})(jQuery);