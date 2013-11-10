document.observe("dom:loaded", function() {
    transEndEventNames = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd',
        'msTransition'     : 'MSTransitionEnd',
        'transition'       : 'transitionend'
    },
    transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

    Event.observe(window, orientationEvent, function() {
        var orientation, page, transformValue = {};

        switch(window.orientation){
            case 0:
                orientation = "portrait";
                break;

            case -90:
                orientation = "landscape";
                break;

            case 90:
                orientation = "landscape";
                break;
        }

        if ( $('nav-container') ) {

            setTimeout(function () {
                $$("#nav-container ul").each(function(ul) {
                    ul.setStyle({'width' : document.body.offsetWidth + "px"});
                });

                page = Math.floor(Math.abs(sliderPosition/viewportWidth));
                sliderPosition = (sliderPosition + viewportWidth*page) - document.body.offsetWidth*page;
                viewportWidth = document.body.offsetWidth;

                if ( Modernizr.csstransforms3d ) {
                    transformValue[transformPref] = "translate3d(" + sliderPosition + "px, 0, 0)";
                } else if ( Modernizr.csstransforms ) {
                    transformValue[transformPref] = "translate(" + sliderPosition + "px, 0)";
                }
                $("nav-container").setStyle(transformValue);
            }, 400);

        }

    });
    // Home Page Slider

    //alert(transformPref);
    var sliderPosition = 0,
        viewportWidth = document.body.offsetWidth,
        last,
        diff;

    $$("#nav-container ul").each(function(ul) { ul.style.width = document.body.offsetWidth + "px"; });

    $$("#nav-xs a").each(function(sliderLink) {
        if (sliderLink.next(0) !== undefined) {
            sliderLink.clonedSubmenuList = sliderLink.next(0);

            sliderLink.observe('click', function(e) {

                e.preventDefault();
                var transformValue = {}

                //homeLink.hasClassName('disabled') ? homeLink.removeClassName('disabled') : '';

                if (last) {
                    diff = e.timeStamp - last
                }
                last = e.timeStamp;
                if (diff && diff < 200) {
                    return
                }
                if (!this.clonedSubmenuList.firstDescendant().hasClassName('subcategory-header')) {
                    var subcategoryHeader = new Element('li', {'class': 'subcategory-header'});
                    subcategoryHeader.insert({
                        top: new Element('button', {'class': 'previous-category'}).update("Back").wrap('div', {'class':'button-wrap'}),
                        bottom: this.innerHTML
                    });
                    this.clonedSubmenuList.insert({
                        top: subcategoryHeader
                    });
                    subcategoryHeader.insert({ after : new Element('li').update('<a href="' + sliderLink.href + '"><span>All Products</span></a>') });

                    this.clonedSubmenuList.firstDescendant().firstDescendant().observe('click', function(e) {
                        if (last) {
                            diff = e.timeStamp - last
                        }
                        last = e.timeStamp;
                        if (diff && diff < 200) {
                            return
                        }
                        if ( Modernizr.csstransforms3d ) {
                            transformValue[transformPref] = "translate3d(" + (document.body.offsetWidth + sliderPosition) + "px, 0, 0)";
                        } else if ( Modernizr.csstransforms ) {
                            transformValue[transformPref] = "translate(" + (document.body.offsetWidth + sliderPosition) + "px, 0)";
                        }
                        $("nav-container").setStyle(transformValue);
                        sliderPosition = sliderPosition + document.body.offsetWidth;
                        setTimeout(function() { $$("#nav-container > ul:last-child")[0].remove(); $("nav-container").setStyle({'height' : 'auto'})  }, 250)
                    });
                    new NoClickDelay(this.clonedSubmenuList);
                };

                $("nav-container").insert(this.clonedSubmenuList.setStyle({'width' : document.body.offsetWidth + 'px'}));
                $('nav-container').setStyle({'height' : this.clonedSubmenuList.getHeight() + 'px'});

                if ( Modernizr.csstransforms3d ) {

                    transformValue[transformPref] = "translate3d(" + (sliderPosition - document.body.offsetWidth) + "px, 0, 0)";

                } else if ( Modernizr.csstransforms ) {

                    transformValue[transformPref] = "translate(" + (sliderPosition - document.body.offsetWidth) + "px, 0)";

                }

                $("nav-container").setStyle(transformValue);

                sliderPosition = sliderPosition - document.body.offsetWidth;
            });
        };
    });

    function getSupportedProp(proparray){
        var root = document.documentElement;
        for ( var i = 0; i < proparray.length; i++ ) {
            if ( typeof root.style[proparray[i]] === "string") {
                return proparray[i];
            }
        }
    }

    function NoClickDelay(el) {
        if ( getSupportedProp(['OTransform']) ) {
            return
        }
        this.element = typeof el == 'object' ? el : document.getElementById(el);
        if( window.Touch ) this.element.addEventListener('touchstart', this, false);
    }

    NoClickDelay.prototype = {
        handleEvent: function(e) {
            switch(e.type) {
                case 'touchstart': this.onTouchStart(e); break;
                case 'touchmove': this.onTouchMove(e); break;
                case 'touchend': this.onTouchEnd(e); break;
            }
        },

        onTouchStart: function(e) {
            this.moved = false;

            this.theTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            if(this.theTarget.nodeType == 3) this.theTarget = theTarget.parentNode;
            this.theTarget.className+= ' pressed';

            this.element.addEventListener('touchmove', this, false);
            this.element.addEventListener('touchend', this, false);
        },

        onTouchMove: function() {
            this.moved = true;
            this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
        },

        onTouchEnd: function(e) {
            e.preventDefault();

            this.element.removeEventListener('touchmove', this, false);
            this.element.removeEventListener('touchend', this, false);

            if( !this.moved && this.theTarget ) {
                this.theTarget.className = this.theTarget.className.replace(/ ?pressed/gi, '');
                var theEvent = document.createEvent('MouseEvents');
                theEvent.initEvent('click', true, true);
                this.theTarget.dispatchEvent(theEvent);
            }

            this.theTarget = undefined;
        }
    };

    if (document.getElementById('nav-xs')) {
        new NoClickDelay(document.getElementById('nav-xs'));
    };

    var transformPref = Modernizr.prefixed('transform');

});
