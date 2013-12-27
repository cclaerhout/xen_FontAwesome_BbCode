/* jQuery plugin : jAutochecklist
 @Version: 1.22  //Modified by Cédric CLAERHOUT
 @Desctrition: Create a list of checkbox with autocomplete
 @Website: https://code.google.com/p/jautochecklist/
 @Licence: MIT
  
 Copyright (c) 2007 John Resig, http://jquery.com/
 
 Copyright (C) 2013 Thanh Trung NGUYEN
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($, document, window, undefined){
    'use strict';

    var pluginName = 'jAutochecklist';
    //detect dragging
    var dragging = false;
    var drag_memory;
    var dragging_state;

    //detect mobile. http://detectmobilebrowsers.com/
    var isMobile = (function(a){
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
    })(navigator.userAgent || navigator.vendor || window.opera);

    //if format isn't implemented
    if (!String.prototype.format){
        String.prototype.format = function(){
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number){
                return args[number] !== undefined ? args[number] : match;
            });
        };
    }

    //drag handling
    $(window).on('mouseup.' + pluginName, function(){
        dragging = false;
    });

    var fn = {
        init: function(options){
            //default setting
            var config = $.extend(true, {
                absolutePosition: false, //use absolute position instead of inline
                allowDeselectSingleList: true, //allow deselection on a single list
                animation: true,    //show popup and list with fade animation
                arrow: true,    //show or hide the arrow
                checkbox: false, //show or hide checkbox
                defaultFallbackValue: '',   //default value for fallback
                dynamicPosition: false, //support dynamic position for list at the bottom of page
                fallback: false, //fallback support for values
                firstItemSelectAll: false, //enable checkall on first item
                inline: false,   //display the list inline style
                labelStyle: false,   //label style
                listWidth: null, //width of the list
                listMaxHeight: null, //max height of the list
                multiple: true, //checkbox or radio
                openOnHover: false, //open the list on hover, and close as well
                rtl: false, //right-to-left text support
                showValue: false, //show value instead of text
                uniqueValue: false, //item with the same text cannot be selected more than one
                width: 200, //width of the wrapper
                htmlResults: false,
                sortValues: false,
                showResultsAsText: false,
                //popup
                popup: true, //show or hide popup
                popupLogoAsValue: false, //show logo instead of item value/text
                popupGroupValue: false, //item with the same value will be grouped together
                popupMaxItem: 10, //maximum number of item on popup
                popupSizeDelta: 100, //this will add to the popup width
                popupLogoClassRegexFind: false,
		popupLogoClassRegexReplace: '',
                //text
                textAllSelected: 'All', //text when all selected
                textEmpty: 'Please select...', //the default text
                textMoreItem: 'and {0} more...', //text on popup when there are more items, {0} will be replaced with a number
                textNoResult: 'No result found...', //text no result
                textSearch: 'Type something...', //the default text
                //group
                collapseGroup: false, //ability to collapse
                selectorGroup: 'group', //the class selector of a group
                selectorChild: 'child', //the class selector of a child
                groupType: 0, //global setting of the type of a group
                //0 => default. The parent item will be selected if all of the children items are selected
                //1 => The parent item will be selected if at least one child item is selected
                //2 => The parent item acts independantly from the children items (exclusive)

                onClose: null, //func(vals, valBefore, changed)  
                //values    = list of selected values
                //valBefore = list of selected values at opening of the list
                //changed   = boolean whether the list is changed or not
                onInit: null,   //event just after initialization
                onItemClick: null, //func(value, li, valBefore, valAfter)
                //value		= the selected value
                //li 		= the selected list item object
                //valBefore = list of values before selection
                //valAfter 	= list of values after selection
                onUpdateComplete: null, //func (values, source)
                //values=list of selected values
                //source= object with the original list and the created list elements
                onOpen: null, //func(values) 
                //values=list of selected values
                onRemoveAll: null,  //func(button, values)
                //button    = the removeAll button object
                //values    = list of values before removing all

                //fetch data from remote source
                remote: {
                    cache: true, //whether to cache found data (should be disable when loadMoreOnScroll is enable)
                    delay: 0, //the delay (in ms) before setting query to the remote source to reduce charge
                    loadMoreOnScroll: false, //when scroll down, next data will be loaded (will conflict with cache)
                    minLength: 0, //the minimum length of the text
                    source: null, //source of data to fetch if fnQuery isn't defined
                    fnPredict: null, //func(text, input, callback)         custom function that handle suggestion
                    //text  = the typing search text
                    //input = the underlying input object
                    //callback  = callback function used to build suggestion
                    fnQuery: null      //func(obj, text, offset, callback)   custom function that handle query
                    //obj       = the current jQuery list object
                    //text      = the typing search text
                    //offset    = the offset position of the result
                    //callback  = callback function used to build the list
                },
                menuStyle: {
                    enable: false,  //enable menu style
                    search: true,   //display or hide the search zone
                    fixedPosition: false,   //if menu styleis active, then it's a fixed menu
                    fixedPositionContainer: 'window',    //the element to compare the position (selector)
                    fixedPositionOffsetTop: 20,     //the top position
                    scrollSpyContainer: 'window',   //the element which is scrolled (selector)
                    scrollSpyAnimationDuration: 500,
                    scrollSpyOffsetTop: 20,
                    onScrollSpyActivate: null   //func(element) event when scroll spy triggered
                    //element = triggered list item element
                }
            },
            options);

            return this.each(function(){
                var $this = $(this);
                var data = $this.data(pluginName);
                var id = this.id;
                var className = this.className;

                //if isn't a list or a select
                var isSelect = $this.is('select');
                if (!$this.is('ul') && !isSelect)
                    return;

                //make sure the element is not initialized twice
                if (data)
                    return;

                //clone the config setting
                var settings = $.extend(true, {
                }, config);

                //data passed by attribute json will override the settings
                var json = $this.data('json');
                if (json){
                    //json = $.parseJSON(json); //it's already an object
                    settings = $.extend(true, settings, json);
                }

                if (isSelect)
                    settings.multiple = this.multiple;

                if (!settings.multiple){
                    settings.popup = false;
                    settings.firstItemSelectAll = false;
                }

                //if has menu-style consider it's an inline list
                if ($this.hasClass('menu-style')){
                    settings.inline = true;
                    settings.menuStyle.enable = true;
                    settings.arrow = false;
                }

                if (settings.inline || isMobile)
                    settings.popup = false;

                //label style
                if ($this.hasClass('label-style')){
                    settings.labelStyle = true;
                    settings.arrow = false;
                    settings.allowDeselectSingleList = false;
                }

                //create a div wrapper
                var wrapper = $('<div>').attr({
                    'class': pluginName + '_wrapper',
                    'tabindex': 0
                }).width(settings.labelStyle ? 'auto' : settings.width).append(
                ('<div class="{0}_popup"></div>'
                + '<div class="{0}_dropdown_wrapper">'
                + '<div class="{0}_arrow"><div></div></div>'
                + '<div class="{0}_dropdown"><div class="{0}_result"></div><input class="{0}_prediction" /><input class="{0}_input" placeholder="{1}" /><div class="{0}_remove_all"></div><div class="{0}_close">Done</div></div></div>'
                + '<ul class="{0}_list"></ul>').format(pluginName, settings.textSearch)
                );

                if (className)
                    wrapper.addClass(className);
                if (settings.inline)
                    wrapper.addClass(pluginName + '_inline');
                if (this.disabled || $this.data('disabled'))
                    wrapper.addClass(pluginName + '_disabled');
                if (settings.rtl)
                    wrapper.addClass(pluginName + '_rtl');
                if (id)
                    wrapper.attr('id', pluginName + '_wrapper_' + id);
                if (settings.menuStyle.enable)
                    $this.addClass('menu-style');
                if (settings.labelStyle)
                    $this.addClass('label-style');

                //add a signature of this plugin
                if (!$this.hasClass(pluginName))
                    $this.addClass(pluginName);


                //the popup should have 100px more than the wrapper width by default
                var popup = wrapper.find('div.' + pluginName + '_popup').width(settings.width + settings.popupSizeDelta).css({
                    marginLeft: -settings.popupSizeDelta / 2
                });
                var dropdown = wrapper.find('div.' + pluginName + '_dropdown');
                var result = wrapper.find('div.' + pluginName + '_result');
                var input = wrapper.find('input.' + pluginName + '_input');
                var prediction = wrapper.find('input.' + pluginName + '_prediction');
                var arrow = wrapper.find('div.' + pluginName + '_arrow');
                var ul = wrapper.find('ul.' + pluginName + '_list');
                var removeAll = wrapper.find('div.' + pluginName + '_remove_all');
                var close = isMobile ? wrapper.find('div.' + pluginName + '_close') : null;

                //manual size of the list
                if (settings.listWidth)
                    ul.width(settings.listWidth * 1 - 2);   //minus 2px border
                if (settings.listMaxHeight)
                    ul.css({maxHeight: settings.listMaxHeight + 'px'});
                if (!settings.menuStyle.search && settings.menuStyle.enable)
                    wrapper.find('div.' + pluginName + '_dropdown_wrapper').remove();
                if (!settings.arrow){
                    arrow.remove();
                    arrow = null;
                    if (settings.rtl)
                        removeAll.css({left: 5});
                    else
                        removeAll.css({right: 5});
                }
                if (!settings.popup){
                    popup.remove();
                    popup = null;
                }
                if (settings.inline){
                    result.remove();
                    result = null;
                }

                //list item
                var name;
                if (isSelect){
                    json = fn._buildFromSelect($this, settings);
                    name = this.name.replace(/^\s+|\s+$/g, '') || $this.data('name');
                    //remove [] if exist at the end, if [] is very necessary, then use [0], [1]... instead
                    if (settings.multiple && name && name.indexOf('[]', name.length - 2) !== -1)
                        name = name.slice(0, -2);
                    //remove name to prevent bug
                    this.removeAttribute('name');
                    //remember the name
                    $this.data('name', name);
                }
                else {
                    json = fn._buildFromUl($this, settings);
                    name = $this.data('name');
                }

                var li = fn._buildItemFromJSON(json, settings, name);
                var tmp = fn._insertList(ul, li, settings, false, false);

                //register elements
                var elements = {
                    popup: popup,
                    wrapper: wrapper,
                    dropdown: dropdown,
                    result: result,
                    input: input,
                    arrow: arrow,
                    prediction: prediction,
                    selectAll: tmp.selectAll,
                    removeAll: removeAll,
                    close: close,
                    list: ul,
                    listItem: {
                        li: tmp.li,
                        checkbox: tmp.checkbox
                    }
                };

                data = {
                    elements: elements,
                    settings: settings
                };

                $this.data(pluginName, data);

                //insert the checklist into the DOM, right after the main list
                $this.after(wrapper);
                //hide the original element
                $this.hide();

                fn._registerEvent($this);
                fn._postProcessing($this);

                if (settings.onInit)
                    settings.onInit();
            });
        },
	incrementClick: function(self, clickedInput, removeAll){
		var data = self.data(pluginName),
			settings = data.settings,
			elements = data.elements,
			li = elements.listItem.li,
			inputs = li.find('input'),
			clickedInputs = inputs.filter(function(i) {
				return ($(this).attr('click') != undefined);
			}),
			clicksId = [0],
			maxClick;

		/***
		 * Remove all click attributes
		 **/
		if(removeAll == true){
			inputs.each(function(i){
				$(this).removeAttr('click');
			});
			return false;
		}

		var clickedInputAttr = parseInt(clickedInput.attr('click'));

		/***
		 * If clicked element has been already clicked, reset its clickId and decrement all elements with a bigger clickId 
		 **/
		if(!isNaN(clickedInputAttr)){
			inputs.each(function(i) {
				var clickAttr = parseInt($(this).attr('click'));
				if(!isNaN(clickAttr) && clickAttr > clickedInputAttr){
					 $(this).attr('click', clickAttr - 1);
				}
			});
			clickedInput.removeAttr('click');
			return false;
		}
			
		/***
		 * Get a list (array) of clickId
		 **/
		inputs.each(function(){
			var input = $(this), clickId = parseInt(input.attr('click'));
			if(!isNaN(clickId)){
				clicksId.push(parseInt(clickId));
			}
		});
		
		/***
		 * Get the bigget clickId
		 **/
		maxClick = Math.max.apply(Math, clicksId) + 1;

		/***
		 * Return clickId
		 **/
		return this.clickId = maxClick;
	},
        destroy: function(){
            return this.each(function(){
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;

                $(document).add(window).off('.' + pluginName);
                data.elements.wrapper.remove();

                var original;
                if ($this.is('ul')){
                    //get the list of original item
                    original = $this.children('li');
                    //update original
                    data.elements.listItem.li.each(function(k, v){
                        var li = $(this);
                        original.eq(k).data('selected', li.hasClass('selected'));
                    });
                }
                else {
                    original = $this.find('option,optgroup');
                    data.elements.listItem.li.each(function(k, v){
                        var li = $(this);
                        //we use .attr to force add the attribute to the DOM
                        original.eq(k).attr('selected', li.hasClass('selected') ? 'selected' : '');
                    });
                }

                $this.removeData(pluginName).show();
            });
        },
        selectAll: function(){
            return this.each(function(){
                fn._selectAll($(this), true);
            });
        },
        deselectAll: function(){
            return this.each(function(){
                fn._selectAll($(this), false);
            });
        },
        //open the list, can only open one a time
        open: function(){
            return this.each(function(){
                fn._open($(this));
            });
        },
        //close the list
        close: function(){
            return this.each(function(){
                fn._close($(this));
            });
        },
        //update the result box basing on the selected element
        update: function(){
            return this.each(function(){
                fn._update($(this));
            });
        },
        //count selected item, can only count one instance
        count: function(){
            return fn._count(this);
        },
        //get the values, can only get value of one instance
        get: function(){
            return fn._get(this);
        },
        //get all values, including non selected values
        getAll: function(){
            return fn._getAll($(this));
        },
        //get text of selected items
        getText: function(){
            return fn._getText(this);
        },
        //set the values
        set: function(vals, clearAll){
            if (vals === undefined)
            	return false;

            if (clearAll === undefined)
                clearAll = false;

            //convert to array if not array
            if (!(vals instanceof Array))
                vals = [vals];

            //convert to string
            for (var i = 0; i < vals.length; i++)
                vals[i] = vals[i].toString();

            return this.each(function(){
                fn._set($(this), vals, clearAll);
            });
        },
        unset: function(vals){
            if (vals === undefined)
            	return false;
            	        
            //convert to string
            for (var i = 0; i < vals.length; i++)
                vals[i] = vals[i].toString();

            return this.each(function(){
                fn._unset($(this), vals);
            });
        },
        //disable
        disable: function(){
            return this.each(function(){
                var data = $(this).data(pluginName);
                if (!data)
                    return;
                data.elements.wrapper.addClass(pluginName + '_disabled');
            });
        },
        //enable
        enable: function(){
            return this.each(function(){
                var data = $(this).data(pluginName);
                if (!data)
                    return;
                data.elements.wrapper.removeClass(pluginName + '_disabled');
            });
        },
        //change the settings
        settings: function(json){
            return this.each(function(){
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;
                data.settings = $.extend(true, data.settings, json);
                $this.data(pluginName, data);
            });
        },
        //refresh the list memory
        refresh: function(){
            return this.each(function(){
                var $this = $(this);
                var data = $this.data(pluginName);
                if (!data)
                    return;

                var selectAll;
                if (settings.firstItemSelectAll)
                    selectAll = ul.children(':first').addClass(pluginName + '_checkall');

                var li = ul.children();
                data.elements.listItem = {
                    li: li,
                    checkbox: li.children('input.' + pluginName + '_listItem_input')
                };
                data.elements.selectAll = selectAll;

                $this.data(pluginName, data);
            });
        },
        /**
         * rebuild the list from JSON
         * @param json ARRAY an array of JSON
         * @param showNoResult BOOLEAN whether to show text "No result found" if nothing found
         * @param isAdd BOOLEAN if true, data will be add to the end of the list instead of replacing the current list
         * @returns object 
         */
        buildFromJSON: function(json, showNoResult, isAdd){
            if (showNoResult === undefined)
                showNoResult = true;

            if (isAdd === undefined)
                isAdd = false;

            return this.each(function(){
                fn._buildFromJSON($(this), json, showNoResult, isAdd);
            });
        },
        /**
         * Intentionally release the drag status to prevent some bugs
         */
        releaseDrag: function(){
            dragging = false;
        },
        /*
         *  PRIVATE
         */
        _buildFromJSON: function(obj, json, showNoResult, isAdd){
            var data = obj.data(pluginName);
            if (!data)
                return;

            //if json is not an object, such as string, try to convert
            if (typeof json !== 'object')
                json = $.parseJSON(json);

            //it's an array
            if (json instanceof Array){
                //convert if it's an array of non object item
                if (json.length && typeof json[0] !== 'object'){
                    var new_json = [];

                    for (var i = 0; i < json.length; i++) {
                        new_json.push({
                            html: json[i],
                            val: i
                        });
                    }

                    json = new_json;
                }
            }
            //json of value=>label items
            else {
                var new_json = [];

                for (var i in json) {
                    new_json.push({
                        html: json[i],
                        val: i
                    });
                }

                json = new_json;
            }

            var elements = data.elements;
            var settings = data.settings;
            var li = fn._buildItemFromJSON(json || [], settings, obj.data('name'));
            var tmp = fn._insertList(elements.list, li, settings, showNoResult, isAdd, elements.mobile_popup);

            data.elements.listItem = {
                li: tmp.li,
                checkbox: tmp.checkbox
            };

            data.elements.selectAll = tmp.selectAll;
            obj.data(pluginName, data);
            fn._postProcessing(obj);
        },
        _registerEvent: function(self){
            var data = self.data(pluginName);
            var settings = data.settings;
            var elements = data.elements;
            var wrapper = elements.wrapper;
            var dropdown = elements.dropdown;
            var input = elements.input;
            var prediction = elements.prediction;
            var ul = elements.list;
            var checkbox = elements.listItem.checkbox;
            var removeAll = elements.removeAll;
            var popup = elements.popup;
            var arrow = elements.arrow;
            var close = elements.close;
            var shift_on = false;
            var timer;

            if (arrow)
                arrow.on('mousedown.' + pluginName, function(){
                    if (!ul.is(':hidden')){
                        fn._close(self);
                        return false;
                    }
                });

            //searching
            input.on('keydown.' + pluginName, function(e){
                var v = prediction.val();
                //clear prediction
                prediction.val(null);
                //if TAB and underlying input is different
                if (e.keyCode === 9 && v && this.value !== v){
                    this.value = v;
                    return false;
                }
                //if escape
                if (e.keyCode === 27){
                    //if use absolute position simulate escape key on dummy element
                    if (!isMobile && settings.absolutePosition){
                        var e = $.Event("keydown");
                        e.keyCode = 27;
                        $('div.' + pluginName + '_dummy').trigger(e);
                    }
                    fn._close(self);
                }
            })
            .on('keyup.' + pluginName, function(){
                var $this = $(this);
                var val = this.value;
                var noResult = true;
                var remote = settings.remote;

                ul.children('li.' + pluginName + '_noresult').remove();
                prediction.val(val);

                //if menu-style, show removeAll button, doesn't matter if items are selected or not
                if (settings.menuStyle.enable){
                    if (val)
                        removeAll.show();
                    else
                        removeAll.hide();
                }

                //if remote, replace the current list with new data
                if (remote.source || remote.fnQuery){
                    var cache = $this.data('remote');

                    //if text length < minLength do nothing
                    if (val.length < remote.minLength)
                        return;

                    //if cache not exist, fetch from remote source
                    if (!cache || cache[val] === undefined){
                        //clear the previous timer
                        clearTimeout(timer);
                        //set a timer to reduce server charge
                        timer = setTimeout(function(){
                            //predict the next word
                            if (remote.fnPredict)
                                remote.fnPredict(val, prediction, fn._predict);
                            //user defined func
                            fn._fetchData(self, val, 0);
                            //predict from local source
                            if (!remote.fnPredict)
                                fn._setPredictionFromLocalSource(self);
                        }, remote.delay);
                        return; //break the code here
                    }
                    else {  //load from cache
                        var json = cache[val];
                        if (json && json.length){
                            fn._buildFromJSON(self, json);
                            noResult = false;
                        }
                    }
                }
                else {  //using local source

                    var li = ul.children('li');

                    if (val === ''){
                        li.show();
                        noResult = false;
                        if (settings.collapseGroup)
                            fn._collapseGroup(self);
                    }
                    else {
                        ul.children('li.' + pluginName + '_checkall').hide();

                        //search for at least one instance only
                        var regex = new RegExp(fn._escapeRegexpString(val), 'i');
                        li.each(function(){
                            var $this = $(this);
                            var text = $this.text();
                            if (regex.test(text)){
                                $this.show();
                                noResult = false;
                                //if this is a child, also show the parent if collapseGroup mode is on
                                var parents = fn._getParents($this, settings.selectorChild, settings.selectorGroup);
                                for (var i = 0; i < parents.length; i++)
                                    parents[i].show();
                            }
                            else
                                $this.hide();
                        });
                    }

                    fn._setPredictionFromLocalSource(self);
                }

                //if is not menu or inline style and noresult
                if (!settings.menuStyle.enable && !settings.inline && noResult){
                    prediction.val(null);
                    ul.append('<li class="{0}_noresult">{1}</li>'.format(pluginName, settings.textNoResult));
                }

            })
            //stop propagoation to the wrapper
            .on('focusin.' + pluginName, function(e){
                e.stopPropagation();
            });

            if (isMobile)
                input.on('focusout.' + pluginName, function(e){
                    e.stopPropagation();
                });

            //show popup
            if (popup){
                dropdown.on('mouseover.' + pluginName, function(){
                    clearTimeout(popup.data('timeout'));
                    var timeout = setTimeout(function(){
                        //if have at least one element
                        if (fn._count(self) && !wrapper.hasClass(pluginName + '_disabled'))
                            settings.animation ? popup.fadeIn() : popup.show();
                    }, 200);
                    popup.data('timeout', timeout);
                });
                //if list is not opened, hide popup if mouse leave
                dropdown.add(popup).on('mouseout.' + pluginName, function(){
                    if (ul.is(':hidden')){
                        clearTimeout(popup.data('timeout'));
                        var timeout = setTimeout(function(){
                            popup.hide();
                        }, 200);
                        popup.data('timeout', timeout);
                    }
                });

                popup.on('mouseover.' + pluginName, function(){
                    clearTimeout(popup.data('timeout'));
                })
                //on popup item click, deselect that item
                .on('mousedown.' + pluginName, 'div', function(){
                    var $this = $(this);

                    if ($this.hasClass('stack'))
                        return;

                    if (settings.popupGroupValue){
                        //find anything that has the same value and deselect it
                        $this.children('div.stack').remove();
                        var val = $this.text();

                        ul.children('li.selected').each(function(){
                            var $t = $(this);
                            var input = $t.children('input.' + pluginName + '_listItem_input');
                            var v = settings.showValue ? input.val() : $t.text();
                            //found the bound item, deselect the checkbox
                            if (val === v){
                                input.prop('checked', false);
                                $t.removeClass('selected');
                            }
                        });
                    }
                    else {
                        var id = this.className.replace(pluginName + '_popup_item_', '');
                        ul.find('input.' + pluginName + '_input' + id).parent('li').trigger('mousedown').trigger('mouseup');
                    }

                    fn._update(self);
                    return false;
                });
            }

            //on checkbox click prevent default behaviour
            ul.on('click.' + pluginName, 'input.' + pluginName + '_listItem_input', function(e){
                e.preventDefault();
            })
            //on item mouse down
            .on('mousedown.' + pluginName, 'li.' + pluginName + '_listItem', function(e){
                var $this = $(this);

                //if locked or blocked or menu-style
                if ($this.hasClass('locked') || $this.hasClass('blocked') || settings.menuStyle.enable || wrapper.hasClass(pluginName + '_disabled'))
                    return false;

                //on select text, disable click
                var text;
                if (window.getSelection)
                    text = window.getSelection().toString();
                else if (document.getSelection)
                    text = document.getSelection();
                else if (document.selection)
                    text = document.selection.createRange().text;

                if (text)
                    return false;

                //disable propagation for live event
                e.stopPropagation();

                var checked = $this.hasClass('selected');

                //do nothing if single list and prevent deselect
                if (checked && !settings.multiple && !settings.allowDeselectSingleList)
                    return false;

                //reset the drag memory
                if (!dragging)
                    drag_memory = [];

                //add to the drag memory to notify that this element has been processed
                drag_memory.push($this);

                //if is dragging and the checkbox has same state, exit
                if (dragging && dragging_state === checked)
                    return false;

                var input = $this.children('input.' + pluginName + '_listItem_input');
                var valBefore = [];
                checkbox.filter(':checked').each(function(){
                    valBefore.push(this.value);
                });

                //reverse the checkbox status if the event is not from the checkbox
                checked = !checked;

                //checkall
                if ($this.hasClass(pluginName + '_checkall')){
                    //trigger change
                    if (self.triggerHandler('change') === false)
                        return false;

                    //call user defined function click
                    if (settings.onItemClick){
                        //if return false, prevent the selection
                        if (settings.onItemClick(null, $this, valBefore, fn._getAll(self), checked) === false){
                            dragging = false;
                            return false;
                        }
                    }

                    fn._selectAll(self, checked);
                }
                else {  //simple checkbox
                    //if is label do nothing if type radio
                    if (!settings.multiple && $this.hasClass(settings.selectorGroup))
                        return false;

                    var groupType = fn._getGroupType($this, settings);
                    var checkboxes = [];
                    var i;

                    //if a group is checked and is not exclusive, get the list of children
                    if ($this.hasClass(settings.selectorGroup) && groupType !== 2 && groupType !== 3 && groupType !== 4){
                        var children = fn._getChildren($this, settings.selectorChild, undefined, true);
                        for (i = 0; i < children.length; i++)
                            checkboxes.push(children[i].children('input.' + pluginName + '_listItem_input'));
                    }

                    checkboxes.push(input);
                    for (i = 0; i < checkboxes.length; i++) {
                        //if is already checked, remove this item from the list
                        if (checkboxes[i].prop('checked') === checked)
                            checkboxes[i] = null;
                        else
                            checkboxes[i].prop('checked', checked);
                    }

                    //trigger change
                    if (self.triggerHandler('change') === false)
                        return false;

                    //call user defined function click
                    if (settings.onItemClick){
                        //if return false, revert to previous selection
                        if (settings.onItemClick(input.prop('value'), $this, valBefore, fn._get(self), checked) === false){
                            for (var i = 0; i < checkboxes.length; i++) {
                                if (checkboxes[i])
                                    checkboxes[i].prop('checked', !checked);
                            }

                            dragging = false;
                            return false;
                        }
                    }

                    var idClick = fn.incrementClick(self, input);
                    if(idClick !== false){
	                    input.attr('click', idClick);
	            }
		
                    fn._update(self);
                }

                //start dragging handling, only the first clicked li can reach here
                if (!dragging && settings.multiple){
                    dragging = true;
                    //the state of checkbox at the moment of dragging (the first checked)
                    dragging_state = checked;
                }
                
                 //if is radio, close the list on click
                if (!settings.multiple){
                    fn._close(self);
                    return false;
                }
            })
            .on('mouseenter.' + pluginName, 'li.' + pluginName + '_listItem', function(){
                if (!dragging)
                    return;
                var $this = $(this);
                var found = false;

                //do not click the item twice
                for (var i = 0; i < drag_memory.length; i++) {
                    if ($this.is(drag_memory[i])){
                        found = true;
                        break;
                    }
                }

                if (!found)
                    $(this).trigger('mousedown');
            })
            .on('click.' + pluginName, 'a', function(e){
                if (wrapper.hasClass(pluginName + '_disabled'))
                    return false;

                e.stopPropagation();

                var $this = $(this);
                var href = $this.attr('href');
                var menuStyle = settings.menuStyle;

                //if contain an anchor, scroll to that item
                if (/^#/.test($this.attr('href'))){
                    var container = menuStyle.scrollSpyContainer;
                    if (container === 'window')
                        container = 'body';

                    var target = $(href);
                    if (!target.length)
                        return false;

                    var pos = $(href).offset().top;
                    if (container !== 'body')
                        pos += $(container).scrollTop();

                    container = $(container);
                    container.animate({scrollTop: pos - container.offset().top + parseInt(container.css('marginTop')) - menuStyle.scrollSpyOffsetTop},
                    menuStyle.scrollSpyAnimationDuration, function(){
                        setTimeout(function(){
                            //deselect all then select the clicked one
                            var li = $this.closest('li.' + pluginName + '_listItem');
                            li.closest('ul').children('li.selected').removeClass('selected');
                            li.addClass('selected');
                        });
                    });

                    return false;
                }
            })
            .on('mousedown.' + pluginName, 'a', function(e){
                e.stopPropagation();
                return false;
            })
            .on('scroll.' + pluginName, function(){
                if (!settings.remote.loadMoreOnScroll)
                    return;

                //load more only if the list reach its bottom
                var $this = $(this);
                if ($this.height() + 5 < ($this.get(0).scrollHeight - $this.scrollTop()))
                    return;

                var val = input.val();
                var offset = $this.children('li').length;
                fn._fetchData(self, val, offset);
            })
            .on('mousedown.' + pluginName, 'div.' + pluginName + '_expandable', function(){
                var $this = $(this);
                //the current group li
                var group = $this.parent();

                //already expanded
                if ($this.hasClass('expanded'))
                    fn._collapse(group, settings);
                else
                    fn._expand(group, settings);

                return false;
            });

            wrapper.on('focusin.' + pluginName, function(){
                if (!settings.labelStyle && ul.is(':hidden'))
                    fn._open(self);

                //as long as the wrapper has focus, focus on the input
                //IE hack
                if (!isMobile)
                    setTimeout(function(){
                        input.focus();
                    });
            })
            //blur not triggered in FF
            .on('focusout.' + pluginName, function(e){
                if (!settings.labelStyle && $(e.target).is($(this)) || isMobile)
                    return;
                //need to add delay for activeElement to be set
                setTimeout(function(){
                    //close list if the active element isn't any child of the wrapper
                    if (!$(document.activeElement).closest(wrapper).length)
                        fn._close(self);
                }, 10);
            })
            .on('keydown.' + pluginName, function(e){
                //if menustyle, do nothing
                if (settings.menuStyle.enable)
                    return;

                var key = e.keyCode;
                var li = ul.children('li');
                var current = li.filter('li.over');
                var next;

                //up/down
                if (key === 40 || key === 38){
                    //down
                    if (key === 40) //find the next over item
                        next = current.length ? current.last().next() : li.first();
                    else //up
                        next = current.length ? current.first().prev() : null;

                    //if has the next element
                    if (next && next.length){
                        //if shift is on, do not remove the current item
                        if (!shift_on){
                            current.removeClass('over');
                        }
                        next.addClass('over');

                        //scroll handling
                        if (key === 40 && next.position().top + next.height() > ul.height())
                            ul.scrollTop(ul.scrollTop() + 50);
                        else if (key === 38 && next.position().top < 0)
                            ul.scrollTop(ul.scrollTop() - 50);
                    }
                }
                //enter: do not submit form and select item
                else if (key === 13){
                    //if no selection, (de)select the fist visible item
                    if (!current.length)
                        li.filter(':visible').first().trigger('mousedown').trigger('mouseup');
                    else
                        current.trigger('mousedown').trigger('mouseup');
                    input.val(null);
                    return false;
                }
                //shift
                else if (key === 16){
                    shift_on = true;
                }
            })
            .on('keyup.' + pluginName, function(e){
                var key = e.keyCode;
                if (key === 16)
                    shift_on = false;
            })
            .on('mouseup.' + pluginName, function(e){
                dragging = false;
                e.stopPropagation();
            })
            .on('mousedown.' + pluginName, function(e){
                e.stopPropagation();

                if (wrapper.hasClass('mobile-style'))
                    return;

                if (settings.labelStyle){
                    if (ul.is(':hidden'))
                        fn._open(self);
                    else
                        fn._close(self);
                }
            });

            removeAll.on('mousedown.' + pluginName, function(){
		//Raz click
		fn.incrementClick(self, null, true);
		
                if (settings.onRemoveAll){
                    if (settings.onRemoveAll($(this), fn._get(self)) === false)
                        return false;
                }

                input.val(null).trigger('keyup');
                //deselect if is not menu-style
                if (!settings.menuStyle.enable)
                    fn._selectAll(self, false);
                return false;
            });

            //show/hide list on hover
            if (settings.openOnHover){
                var timeout;
                wrapper.on('mouseenter.' + pluginName, function(){
                    clearTimeout(timeout);
                    fn._open(self);
                })
                .on('mouseleave.' + pluginName, function(){
                    timeout = setTimeout(function(){
                        fn._close(self);
                    }, 500);
                });
            }

            if (close)
                close.on('click.' + pluginName, function(){
                    fn._close(self);
                    wrapper.trigger('blur');
                    return false;
                });

        },
        _fetchData: function(obj, val, offset){
            var data = obj.data(pluginName);
            var settings = data.settings;
            var remote = settings.remote;
            var input = data.elements.input;

            if (remote.fnQuery)
                remote.fnQuery(obj, val, offset, fn._buildFromJSON);
            else {
                //the built-in fnQuery
                $.getJSON(remote.source, {
                    text: val,
                    offset: offset
                },
                function(json){
                    //convert to array if empty
                    if (!json)
                        json = [];
                    //build the list from a VALID json
                    fn._buildFromJSON(obj, json, true, offset > 0);

                    //cache only when offset=0
                    if (remote.cache && !offset){
                        var cache = input.data('remote') || [];
                        cache[val] = json;
                        input.data('remote', cache);
                    }
                });
            }
        },
        _postProcessing: function(obj){
            var data = obj.data(pluginName);
            var elements = data.elements;
            var wrapper = elements.wrapper;
            var ul = elements.list;
            var settings = data.settings;

            //prevent tab stop
            ul.find('a,button,:input,object').attr('tabIndex', -1);

            //dynamic positioning, do not handle mobile support
            if (!isMobile){
                var pos = wrapper.offset();
                var wrapperH = wrapper.height();
                var x = pos.left - $(window).scrollLeft();
                var y = pos.top - $(window).scrollTop() + wrapperH;
                var w = ul.width() + 2;   //with border
                var h = ul.height() + 2;   //with border
                var wW = $(window).width();
                var wH = $(window).height();

                //dynamic-x
                if (x + w > wW){
                    var left = -(wW - x) + 2;   //with border
                    if (x - left >= 0)
                        ul.css({
                            left: left
                        });
                }

                //dynamic-y only when option is activated
                if (settings.dynamicPosition && y + h > wH){
                    var top = -h - wrapperH + 1;
                    if (top)
                        ul.css({
                            top: top
                        });
                }
            }

            //if inline, wrapper height should be the same as list height
            if (settings.inline)
                wrapper.css({minHeight: wrapper.outerHeight()});

            //hide removeAll at the start
            elements.removeAll.hide();

            if (settings.menuStyle.enable){
                fn._registerMenuStyle(obj);
                //collapse group at start
                fn._collapseGroup(obj);
            }
            else if (settings.collapseGroup)
                fn._collapseGroup(obj);

            //update selected element
            fn._update(obj);
        },
        _selectAll: function(obj, state){
            var data = obj.data(pluginName);
            if (!data)
                return;
            //all item without the locked one
            data.elements.listItem.li.not('li.locked').children('input.' + pluginName + '_listItem_input').prop('checked', state);
            this._update(obj);
        },
        _update: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return;
            var settings = data.settings;
            var elements = data.elements;
            var li = elements.listItem.li;
            var val = [], valHtml = [];
            var count = 0;
            var selectAll = true;
            var more = 0;
            var html = '';
            var logoFound = false, logoIsImg = true;

            /* Reorder li elements */
            if(data.settings.sortValues){
            	var clickedLi = [], unclickedLi = [];
            	
            	/***
            	 * Step 1: filter li elements without modifying them
            	 *
            	 * The one than have been clicked will go inside the array clickedLi
            	 * The others will go inside the array unclickedLi
            	 **/ 
            	li.filter(function(){
        		var hasClick = ($(this).children('input').attr('click'));
            		if(hasClick != undefined){
            			clickedLi.push(this);
            			return false;
            		}
      			unclickedLi.push(this);
            		return true;
	        });

            	if(clickedLi){
	            	/***
	            	 * Step 2: sort clicked elements by click id
	            	 * The below sort function was meant to work directly on li elements but didn't work with the search function
	            	 **/ 
			clickedLi.sort(function(a,b) {
				var $inputA = $(a).children('input'),
					$inputB = $(b).children('input'),
					clickAttr_A = parseInt($inputA.attr('click')),
					clickAttr_B = parseInt($inputB.attr('click'));

				return clickAttr_A > clickAttr_B;
			})

	            	/***
	            	 * Step 3: reverse the array (this could have done is step 2 by changing the return)
	            	 * Reason: see the unshift function of step 4
	            	**/			
			clickedLi.reverse();

	            	/***
	            	 * Step 4: Put back the sorted clicked li elements inside the unclick li elements
	            	**/
			$.each(clickedLi, function(i, v){
				unclickedLi.unshift(v);
			});

	            	/***
	            	 * Step 5: Override original li elements (which were inside a jQuery object)
	            	**/	            	
			li = $(unclickedLi);
        	}
            }	

            //list the selected values
            li.each(function(){
                var $this = $(this);
                if ($this.hasClass(pluginName + '_checkall'))
                    return;

                //if is a group
                if ($this.hasClass(settings.selectorGroup))
                    fn._updateParent($this, settings);

                var input = $this.children('input.' + pluginName + '_listItem_input');
                if (!input.length)
                    return;

                //prepare the data, if uniqueValue activated, check whether the item of the same value-text is selected twice
                if (input.prop('checked')){
                    var v = input.val();
                    var text = settings.showValue && v !== '' ? v : $this.text();

                    //if logo, text is the src
                    if (settings.popupLogoAsValue){
                    	var $logo = $this.find('.logo');
                    	if($logo.length){
	                    	if($logo.prop('tagName') == 'img'){
	                    		logoFound = true;
					text = $logo.attr('src');
                	    	}else{
					logoFound = true;
					logoIsImg = false;
					text = $logo.attr('class'); 
	                    	}
	                }
                    }

                    //update popup if enable
                    if (settings.popup){
                        var txt = text;

                        if (count >= settings.popupMaxItem)
                            more++;
                        else {
                            //get the id of the input
                            var id = input.attr('class').match(/input(\d+)/);

                            if (settings.popupLogoAsValue && logoFound){
                            	if(logoIsImg){
	                                txt = '<img class="logo" src="{0}" />'.format(txt);
	                        }else{
	                                txt = '<span class="'+pluginName+'_graph_results {0}" />'.format(txt);	                        
	                        }
	                    }
	                        
                            var className = pluginName + '_popup_item_' + id[1];
                            if ($this.hasClass('locked'))
                                className += ' locked';

                            html += '<div class="{0}">{1}</div>'.format(className, txt);
                        }
                    }

                    $this.addClass('selected');
                    val.push(v);
                    valHtml.push(text);
                    count++;
                }
                else    //not check
                {
                    $this.removeClass('selected');
                    selectAll = false;
                }
            });

            //if unique value, do the loop for a second time to gray out whatever has the same value
            if (settings.uniqueValue){
                li.not('li.selected').each(function(){
                    var $this = $(this);
                    var v = settings.showValue ? $this.children('input.' + pluginName + '_listItem_input').val() : $this.text();

                    if (settings.popupLogoAsValue){
                    	var $logo = $this.find('.logo');
                    	if($logo.length){
	                    	if($logo.prop('tagName') == 'img'){
	                    		logoFound = true;
					v = $logo.attr('src');
                	    	}else{
					logoFound = true;
					logoIsImg = false;
					v = $logo.attr('class'); 
	                    	}
	                }
                    }

                    //found dupplicate item
                    if ($.inArray(v, val) !== -1)
                        $this.addClass('blocked');
                    else
                        $this.removeClass('blocked');
                });
            }

            //update selected status of checkall
            if (elements.selectAll){
                if (selectAll)
                    elements.selectAll.addClass('selected');
                else {
                    elements.selectAll.removeClass('selected');
                }
            }

            //update popup if enable
            if (settings.popup){
                //if group value, need to rebuild the html, only loop through unique item
                if (settings.popupGroupValue){
                    //reset
                    html = '';
                    more = 0;
                    count = 0;

                    //loop through the unique value to build the html
                    var tmp_val = fn._getUniqueArray(val);
                    for (var i = 0; i < tmp_val.length; i++) {
                        var v = tmp_val[i];
                        //count the number of time this text has appeared in the original list
                        var c = val.filter(function(x){
                            return x === v;
                        }).length;

                        if (count >= settings.popupMaxItem)
                            more++;
                        else {
                            if (settings.popupLogoAsValue && logoFound){
                            	if(logoIsImg){
	                                v = '<img class="logo" src="{0}" />'.format(v);
	                        }else{
	                                v = '<span class="'+pluginName+'_graph_results {0}" />'.format(v);	                        
	                        }
	                    }

                            html += '<div>';
                            //if count more than one
                            if (c > 1){
                                html += '<div class="stack">' + c + '</div>';
                            }
                            html += v + '</div>';
                        }

                        count++;
                    }
                }

                if (more)
                    html += '<div class="{0}_more">'.format(pluginName) + settings.textMoreItem.format(more) + '</div>';
                elements.popup.html(html);
            }

            //update result
            if (!settings.menuStyle.enable)
            {
                var text, getResults;

                if (val.length){
        		getResults = function(){
	                	 if (settings.popupLogoAsValue && settings.htmlResults && logoFound){
	                	 	val = valHtml;
	                	 	$.each(val, function(i,v){
	                            		if(logoIsImg){
		                                	val[i] = '<img class="logo" src="{0}" />'.format(v);
			                        }else{
							if(settings.popupLogoClassRegexFind){
								var regex_replace = settings.popupLogoClassRegexReplace || '';
				                                v = v.replace(settings.popupLogoClassRegexFind, regex_replace);
				                        }
		        	                        val[i] = '<span class="'+pluginName+'_graph_results {0}" />'.format(v);	                        
	        	        	        }
	        	        	});
		
		               		return val.join(', ');
	                	 }

				if(settings.showResultsAsText){
					return valHtml.join(', ');
				}

                		return val.join(', ');
                    }
                
                    text = settings.textAllSelected && settings.multiple && selectAll && count > 1 ? settings.textAllSelected : getResults();

                    //show only if list multiple or allowDeselectSingleList
                    if (settings.multiple || settings.allowDeselectSingleList)
                        elements.removeAll.show();
                }
                else {
                    text = '<span class="{0}_placeholder">{1}</span>'.format(pluginName, data.settings.textEmpty);
                    elements.removeAll.hide();
                }

                if (elements.result)
                    elements.result.html(text);

	       //Update Event Listener
        	if (settings.onUpdateComplete){
			settings.onUpdateComplete(fn._get(obj),	{ originalList: obj, createdListEl: elements } );
            	}
            }
        },
        //search if an event exist
        _eventExist: function(obj, evt_type){
            var evt = $._data(obj.get(0), 'events');
            //find if event exist first
            if (evt && evt[evt_type] !== undefined){
                for (var i = 0; i < evt[evt_type].length; i++) {
                    if (evt[evt_type][i].namespace === pluginName)
                        return true;
                }
            }

            return false;
        },
        _open: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return;
            var elements = data.elements;
            var wrapper = elements.wrapper;
            var settings = data.settings;

            if (wrapper.hasClass(pluginName + '_disabled'))
                return;

            var list = elements.list;

            //ignore if is already opened
            if (!elements.list.is(':hidden'))
                return;

            var val = fn._get(obj);

            if (settings.onOpen){
                //if return false, do not open the list
                if (settings.onOpen(val) === false)
                    return;
            }

            if (elements.result)
                elements.result.hide();
            elements.input.show();
            //trigger keyup if remote source enable
            if (settings.remote.source || settings.remote.fnQuery)
                elements.input.trigger('keyup');
            elements.prediction.show();
            wrapper.addClass(pluginName + '_active');

            if (isMobile){
                wrapper.addClass('mobile-style');
                list.show();
            }
            else {
                //before showing the list, convert to absolute position if enable
                if (settings.absolutePosition){
                    var offset = wrapper.offset();
                    var dummy = $('<div></div>').attr('class', pluginName + '_dummy ' + pluginName + '_wrapper').width(wrapper.width()).height(wrapper.height());
                    obj.after(dummy);
                    //move the list so the absolute position can become effective
                    wrapper.addClass(pluginName + '_absolute').appendTo('body').css({
                        top: offset.top + 3,
                        left: offset.left
                    });

                    //bind an event to the document to detect lost of focus
                    var doc = $(document);
                    if (!fn._eventExist(doc, 'mousedown')){
                        doc.on('mousedown.' + pluginName, function(){
                            $('ul.' + pluginName + ', select.' + pluginName).jAutochecklist('close');
                        });
                    }

                    //bind to window to handle resize
                    var win = $(window);
                    if (!fn._eventExist(win, 'resize')){
                        win.on('resize.' + pluginName, function(){
                            //find the current position of the dummy
                            var next = obj.next();
                            if (next.hasClass(pluginName + '_dummy')){
                                offset = next.offset();
                                wrapper.css({
                                    top: offset.top + 3,
                                    left: offset.left
                                });
                            }
                        });
                    }
                }

                settings.animation ? list.fadeIn() : list.show();

                if (elements.popup)
                    settings.animation ? elements.popup.fadeIn() : elements.popup.show();

                //set focus on input
                elements.input.focus();
            }

            //remember the value when opening
            obj.data('value', val);

            //trigger focus
            obj.triggerHandler('focus');

            //close all other checklist
            $('ul.' + pluginName + ', select.' + pluginName).not(obj).jAutochecklist('close');
        },
        _close: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return;

            var elements = data.elements;

            //the object is destroyed or is not our plugin
            if (elements.list.is(':hidden'))
                return;

            var wrapper = elements.wrapper;
            var settings = data.settings;

            //trigger blur
            if (obj.triggerHandler('blur') === false)
                return;

            if (settings.onClose){
                //if return false, do not close the list
                var val = fn._get(obj);
                var valBefore = obj.data('value');
                if (settings.onClose(val, valBefore, val < valBefore || valBefore < val) === false)
                    return;
            }

            if (elements.popup)
                elements.popup.hide();
            if (elements.result)
                elements.result.show();
            elements.input.hide().val(null);
            elements.prediction.hide().val(null);
            elements.list.hide().children('li.' + pluginName + '_noresult').remove();
            elements.listItem.li.show().filter('li.over').removeClass('over');
            wrapper.removeClass(pluginName + '_active');
            if (settings.collapseGroup)
                fn._collapseGroup(obj);

            //convert back absolute position to inline
            if (!isMobile && settings.absolutePosition){
                wrapper.css({
                    top: 0,
                    left: 0
                }).removeClass(pluginName + '_absolute');
                var next = obj.next();
                if (next.hasClass(pluginName + '_dummy'))
                    next.replaceWith(wrapper);
            }

            if (isMobile)
                wrapper.removeClass('mobile-style');

            dragging = false;
        },
        _count: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return 0;

            return data.elements.listItem.checkbox.filter(':checked').length;
        },
        _filterArray: function(array)
        {
        	return array.filter(function(i) { return i != undefined });
        },
        _get: function(obj){
		var data = obj.data(pluginName);
                if (!data)
			return [];

	        var val = [], sortedVal = [];

                var checkEl = data.elements.listItem.checkbox.filter(':checked');
                
                checkEl.each(function(){
			val.push(this.value);

			if(data.settings.sortValues){
				var clickAttr = parseInt(this.getAttribute('click'));

				if(isNaN(clickAttr)){
					clickAttr = checkEl.length;
				}

				sortedVal[clickAttr] = this.value;
			}
		});

		if (!data.settings.multiple)
			return val[0] === undefined ? null : val[0];

		if(data.settings.sortValues)
			return fn._filterArray(sortedVal);
		
		return val;
        },
        _getAll: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return [];
            var val = [];

            data.elements.listItem.checkbox.each(function(){
                val.push(this.value);
            });

            return val;
        },
        _getText: function(obj){
            var data = obj.data(pluginName);
            if (!data)
                return [];

            var val = [], sortedVal = [];
            var checkEl = data.elements.listItem.li.filter('li.selected');
            
            checkEl.each(function(){
                val.push($(this).text());

		if(data.settings.sortValues){
			var clickAttr = parseInt(this.getAttribute('click'));

			if(isNaN(clickAttr)){
				clickAttr = checkEl.length;
			}

			sortedVal[clickAttr] = this.value;
		}
                
                //break the loop if is single select
                if (!data.settings.multiple)
                    return false;
            });

            if (!data.settings.multiple)
                return val[0] === undefined ? '' : val[0];
	
	    if(data.settings.sortValues)
		return fn._filterArray(sortedVal);

            return val;
        },
        _set: function(obj, vals, clearAll){
            var data = obj.data(pluginName);
            if (!data)
                return;
            if (clearAll)
                fn._selectAll(obj, false);

            data.elements.listItem.checkbox.each(function(){
                //value found
                if (vals.indexOf(this.value) !== -1)
                    this.checked = true;
            });

            fn._update(obj);
        },
        _unset: function(obj, vals){
            var data = obj.data(pluginName);
            if (!data)
                return;

            data.elements.listItem.checkbox.each(function(){
                //value found
                if (vals.indexOf(this.value) !== -1)
                    this.checked = false;
            });

            fn._update(obj);
        },
        _getLevel: function(li){
            var match = li.attr('class').match(/level(\d+)/);
            return match ? parseInt(match[1]) : null;
        },
        _getChildren: function(li, selectorChild, level, ignoreLocked){
            if (level === undefined)
                level = fn._getLevel(li);

            var next = li.next();
            //if next is a locked one, ignore it
            if (ignoreLocked && next.hasClass('locked'))
                next = next.next();
            if (!next.length)
                return [];

            var next_level = fn._getLevel(next);

            //find all li which has the same level or more until meet a group of the same level or a normal li
            if (next_level < level || (next_level === level && (!next.hasClass(selectorChild))))
                next = null;

            return next ? [next].concat(fn._getChildren(next, selectorChild, level, ignoreLocked)) : [];
        },
        _getDirectChildren: function(li, selectorChild, selectorGroup, ignoreLocked){
            var level_group = fn._getLevel(li);
            var children = fn._getChildren(li, selectorChild, level_group, ignoreLocked);
            var directChildren = [];

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var level = fn._getLevel(child);

                if (child.hasClass(selectorChild) && level === level_group)
                    directChildren.push(child);
                else if (child.hasClass(selectorGroup) && level === (level_group + 1)){
                    directChildren.push(child);
                }
            }

            return directChildren;
        },
        _getParents: function(li, selectorChild, selectorGroup){
            var isGroup = li.hasClass(selectorGroup);
            var isChild = li.hasClass(selectorChild);

            //if this is not any child
            if (!isChild && !isGroup)
                return [];

            var level = fn._getLevel(li);
            //if group first level
            if (isGroup){
                if (li.hasClass('level1'))
                    return [];
                level--;
            }

            var parent = li.prevAll('li.' + selectorGroup + '.level' + level + ':first');

            return parent ? [parent].concat(fn._getParents(parent, selectorChild, selectorGroup)) : [];
        },
        _updateParent: function(li, settings){
            var groupType = fn._getGroupType(li, settings);

            //children exclusive, so we don't handle this parent
            if (groupType === 2 || groupType === 5)
                return;

            var children = fn._getChildren(li, settings.selectorChild);
            var select;
            var checkbox = li.children('input.' + pluginName + '_listItem_input');

            if (groupType === 0 || groupType === 3){
                //by default selected, find at least one item not selected
                select = true;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].children('input.' + pluginName + '_listItem_input').prop('checked') === false){
                        select = false;
                        break;
                    }
                }
            }
            else if (groupType === 1 || groupType === 4){
                //by default not selected, find at least one selected
                select = false;
                for (var i = 0; i < children.length; i++) {
                    if (children[i].children('input.' + pluginName + '_listItem_input').prop('checked') === true){
                        select = true;
                        break;
                    }
                }
            }

            if (select)
                li.addClass('selected');
            //do not uncheck if the type is 3 and 4 because the parent is exclusive
            else if (groupType !== 3 && groupType !== 4)
                li.removeClass('selected');

            if (groupType !== 3 && groupType !== 4)
                checkbox.prop('checked', select);
            else if (select)
                checkbox.prop('checked', true);

        },
        _getGroupType: function(li, settings){
            var groupType = settings.groupType;
            //detect the type of the group if overriden
            if (li.hasClass('groupType0')) //all
                groupType = 0;
            else if (li.hasClass('groupType1')) //at least one
                groupType = 1;
            else if (li.hasClass('groupType2'))  //exclusive
                groupType = 2;
            else if (li.hasClass('groupType3'))  //exclusive
                groupType = 3;
            else if (li.hasClass('groupType4'))  //exclusive
                groupType = 4;
            else if (li.hasClass('groupType5'))  //exclusive
                groupType = 5;

            return groupType;
        },
        _buildFromUl: function(obj, settings){
            var json = [];
            var locked_origin = null;

            obj.children().each(function(){
                var t = $(this);
                var className = this.className || '';
                var locked = t.data('locked');
                var isGroup = t.hasClass(settings.selectorGroup);
                var isChild = t.hasClass(settings.selectorChild);
                var level;

                //get level from className
                if (className)
                    level = fn._getLevel(t);
                //if isChild minimum level is 1
                if (!level && isChild)
                    level = 1;
                //lock all the chidren if parent is locked
                if (locked_origin && level >= locked_origin)
                    locked = true;
                //determine the level origin of the locked group
                if (isGroup && locked && locked_origin === null)
                    locked_origin = level || 1;

                json.push({
                    className: className,
                    extraName: t.data('name') || false,
                    groupType: t.data('grouptype'),
                    html: t.html(),
                    isChild: isChild,
                    isGroup: isGroup,
                    level: level,
                    locked: locked,
                    selected: t.data('selected'),
                    val: t.data('value') || ''
                });
            });

            return json;
        },
        _buildFromSelect: function(obj, settings){
            var json = [];

            obj.children().each(function(){
                var t = $(this);

                //if is a group
                if (t.is('optgroup')){
                    //if group is disabled/locked the children has to be locked too
                    var forceLocked = t.data('locked') || this.disabled;

                    //create a li from optgroup
                    json.push({
                        className: (this.className || '') + ' ' + settings.selectorGroup,
	                extraName: t.data('name') || false,
                        groupType: t.data('grouptype'),
                        html: this.label,
                        isChild: false,
                        isGroup: true,
                        level: null,
                        locked: forceLocked,
                        selected: false,
                        style: this.getAttribute('style'),
                        val: null
                    });

                    //foreach option in group
                    t.children().each(function(){
                        json.push({
                            className: (this.className || '') + ' ' + settings.selectorChild,
	                    extraName: t.data('name') || false,                            
                            groupType: 0,
                            html: this.innerHTML,
                            isChild: true,
                            isGroup: false,
                            level: null,
                            locked: forceLocked || t.data('locked') || this.disabled,
                            selected: this.selected && this.hasAttribute('selected'),
                            style: this.getAttribute('style'),
                            val: this.hasAttribute('value') ? this.value : ''
                        });
                    });
                }
                else {
                    json.push({
                        className: this.className || '',
                        extraName: t.data('name') || false,
                        groupType: 0,
                        html: this.innerHTML,
                        isChild: false,
                        isGroup: false,
                        level: null,
                        locked: t.data('locked') || this.disabled,
                        selected: this.selected && this.hasAttribute('selected'),
                        style: this.getAttribute('style'),
                        val: this.hasAttribute('value') ? this.value : ''
                    });
                }

            });

            return json;
        },
        _buildItemFromJSON: function(json, settings, name){
            if (!name)
                name = pluginName;
            var li = '';
            var type = settings.multiple ? 'checkbox' : 'radio';
            var count = 0;

            for (var i = 0; i < json.length; i++) {
                var e = json[i];
                var val = (e.val === '' || e.val === undefined || e.val === null) ? '' : e.val;
                var className = (e.className ? e.className + ' ' : '') + pluginName + '_listItem';
                var extraName = (e.extraName) ? ' data-name="'+e.extraName+'" ' : '';
                var isGroup = e.isGroup || false;
                var isChild = e.isChild || false;

                if (e.groupType !== undefined)
                    className += ' groupType' + e.groupType;
                if (e.locked)
                    className += ' locked';

                //add some padding
                var px = 5;
                //check the item level
                if (e.level && e.level > 1){
                    px += (e.level - 1) * 20;
                    className += ' level' + e.level;
                }
                else if (isGroup || isChild)
                    className += ' level1';

                //if is a group
                var style = e.style ? [e.style] : [];
                if (isGroup){   //group
                    if (val === ''){
                        className += ' ' + pluginName + '_listItem_group_empty ';
                        if (settings.checkbox)
                            px += 15;
                    }
                }
                else if (isChild){   //child
                    className += ' ' + pluginName + '_listItem_child';
                    px += 20;
                    if (settings.checkbox)
                        px += 15;
                    if (settings.collapseGroup)
                        px += 18;
                }

                if (px > 5)
                    style.push('{0}-{1}:{2}px'.format(settings.menuStyle.enable ? 'padding' : 'margin', settings.rtl ? 'right' : 'left', px));

                style = style.length ? 'style="' + style.join(';') + '"' : '';

                li += '<li class="{0}" {1}{2}>'.format(className, style, extraName);

                //if case single select and is first item, must add a fallback, if name doesn't contain []
                if (!settings.multiple && !count && name.indexOf('[]', name.length - 2) === -1)
                    li += '<input type="hidden" name="{0}" value="{1}" />'.format(name, settings.defaultFallbackValue);

                //if is a group add an icon collapse/expand is enable
                if (isGroup && settings.collapseGroup)
                    li += '<div class="{0}_expandable"></div>'.format(pluginName);

                //if is not a group, or empty label or select all
                if ((!isGroup || val !== '') && (!settings.firstItemSelectAll || i > 0)){
                    //multiple, add []
                    var n = name;
                    if (settings.multiple){
                        //fallback, only apply to multiple element
                        if (settings.fallback){
                            n += '[' + count + ']';
                            li += '<input type="hidden" name="{0}" value="{1}" />'.format(n, settings.defaultFallbackValue);
                        }
                        else
                            n += '[]';
                    }

                    li += '<input type="{0}" name="{1}" value="{2}" class="{3}_listItem_input {3}_input{5}" {4} />'.format(type, n, val, pluginName, e.selected ? 'checked' : '', count++);
                }

                li += e.html + '</li>';
            }

            return li;
        },
        _insertList: function(ul, li, settings, showNoResult, isAdd){
            //empty object
            var selectAll, checkbox;

            if (showNoResult && !li){
                ul.html('<li class="{0}_noresult">{1}</li>'.format(pluginName, settings.textNoResult));
                li = $();
            }
            else {
                if (isAdd)
                    ul.append(li);
                else
                    ul.html(li);
                li = ul.children();

                //if checkall enable
                if (settings.firstItemSelectAll)
                    selectAll = ul.children(':first').addClass(pluginName + '_checkall');

                checkbox = li.children('input.' + pluginName + '_listItem_input');

                //show or hide checkbox
                if (settings.checkbox)
                    checkbox.show();

            }

            return {
                li: li,
                checkbox: checkbox,
                selectAll: selectAll
            };

        },
        _setPredictionFromLocalSource: function(self){
            var data = self.data(pluginName);
            var elements = data.elements;
            var prediction = elements.prediction;
            var li = elements.listItem.li;
            var val = elements.input.val();

            //predictive search if has at least some result
            if (val === '')
                prediction.val(null);
            else {
                var text = [];
                //we already know that each li contain our value, search for the next word after the value
                li.filter(':visible').each(function(){
                    text.push($(this).text());
                });

                fn._predict(val, prediction, text);
            }
        },
        //predict the next word
        _predict: function(val, input, suggest){
            var result;
            var val_lower = val.toLowerCase();

            for (var i = 0; i < suggest.length; i++) {
                var text = suggest[i].toLowerCase();
                var index = text.indexOf(val_lower);
                //word not found in text
                if (index === -1)
                    continue;
                //starting index
                index += val_lower.length;
                //find the index of the following space character
                var sp_index = text.indexOf(' ', index);
                //if space is the next character, find the next next space
                if (index === sp_index)
                    sp_index = text.indexOf(' ', index + 1);
                //if reaching the end without space, get all text from starting index
                result = val + (sp_index === -1 ? text.substr(index) : text.substring(index, sp_index));
                //as we found the first matched element, stop the search
                if (result !== val){
                    input.val(result);
                    return false;
                }
            }
        },
        //collapse all groups
        _collapseGroup: function(obj){
            var data = obj.data(pluginName);
            var elements = data.elements;
            var settings = data.settings;
            var li = elements.listItem.li;

            li.filter(function(){
                var $this = $(this);
                if ($this.hasClass(settings.selectorChild))
                    return true;
                if ($this.hasClass(settings.selectorGroup)){
                    if (fn._getLevel($this) > 1)
                        return true;
                }
            }).hide();

            elements.list.find('div.expanded').removeClass('expanded');
        },
        _collapse: function(li, settings){
            //if is not a group
            if (!li.hasClass(settings.selectorGroup))
                return;

            var children = fn._getChildren(li, settings.selectorChild);
            var arrow = li.children('div.' + pluginName + '_expandable');
            arrow.removeClass('expanded');

            for (var i = 0; i < children.length; i++)
                children[i].hide();
        },
        _expand: function(li, settings){
            //if is not a group
            if (!li.hasClass(settings.selectorGroup))
                return;

            var children = fn._getDirectChildren(li, settings.selectorChild, settings.selectorGroup);
            var arrow = li.children('div.' + pluginName + '_expandable');
            arrow.addClass('expanded');

            for (var i = 0; i < children.length; i++) {
                children[i].show();
                if (children[i].hasClass(settings.selectorGroup))
                    children[i].children('div.expanded').removeClass('expanded');
            }
        },
        //group item in the popup together. Return true if success, false if the item doesn't exist
        _getUniqueArray: function(arr){
            var u = {}, a = [], val;
            for (var i = 0; i < arr.length; i++) {
                val = arr[i];
                if (u.hasOwnProperty(val))
                    continue;

                a.push(val);
                u[val] = 1;
            }

            return a;
        },
        _registerMenuStyle: function(obj){
            var data = obj.data(pluginName);
            var settings = data.settings;
            var container = settings.menuStyle.fixedPositionContainer;
            var scrollSpyContainer = settings.menuStyle.scrollSpyContainer;

            //handle menu fixed
            if (settings.menuStyle.fixedPosition){
                if (container === 'window')
                    container = window;

                obj.data('originalPosition', data.elements.wrapper.offset());

                $(container).on('scroll.' + pluginName, function(){
                    fn._handleFixedMenu(obj);
                });
            }

            //handle scrollspy
            var anchor = [];
            data.elements.listItem.li.each(function(){
                var target = $(this).find('a').attr('href');
                //if target contain a #
                if (!/^#/.test(target))
                    return;

                target = $(target);
                if (target.length)
                    anchor.push({
                        source: $(this),
                        target: target,
                        position: target.offset().top
                    });
            });

            //if at least one anchor exist
            if (anchor.length){
                obj.data('anchor', anchor);

                if (scrollSpyContainer === 'window')
                    scrollSpyContainer = window;

                $(scrollSpyContainer).on('scroll.' + pluginName, function(){
                    fn._handleScrollSpy(obj);
                });
            }
        },
        _handleFixedMenu: function(obj){
            var data = obj.data(pluginName);
            var settings = data.settings;
            var menuStyle = settings.menuStyle;
            var container = menuStyle.fixedPositionContainer;
            var container_pos, container_scroll;
            if (container === 'window'){
                container_pos = $('body').offset().top;
                container_scroll = $(window).scrollTop();
            }
            else {
                container_pos = $(container).offset().top;
                container_scroll = $(container).scrollTop();
            }
            var wrapper = data.elements.wrapper;
            var pos = obj.data('originalPosition');
            var top = pos.top;
            var placeholder = obj.data('placeholder');

            //if the menu is off the screen
            if (menuStyle.fixedPositionOffsetTop >= top - container_scroll - container_pos){
                //if is not fixed yet
                if (wrapper.css('position') !== 'fixed'){
                    wrapper.css({
                        position: 'fixed',
                        top: top - container_scroll
                    })
                    .animate({
                        top: menuStyle.fixedPositionOffsetTop + container_pos
                    },
                    'fast');

                    placeholder = $('<div>').attr('class', pluginName + '_menustyle_placeholder').css({
                        width: wrapper.outerWidth(),
                        height: wrapper.outerHeight()
                    });
                    obj.data('placeholder', placeholder);
                    wrapper.after(placeholder);
                }
            }
            //reset to original position if is currently fixed
            else {
                if (wrapper.css('position') === 'fixed'){
                    wrapper.css({position: 'static'});
                    placeholder.remove();
                    obj.removeData('placeholder');
                }
            }
        },
        _handleScrollSpy: function(obj){
            var data = obj.data(pluginName);
            var settings = data.settings;
            var menuStyle = settings.menuStyle;
            var anchor = obj.data('anchor');
            var container = menuStyle.scrollSpyContainer;
            var container_pos, container_scroll;
            if (container === 'window'){
                container_pos = 0;
                container_scroll = $(window).scrollTop();
            }
            else {
                container_pos = $(container).offset().top;
                container_scroll = $(container).scrollTop();
            }

            //clone
            anchor = $.extend([], true, anchor);

            //use pop to do a reverse scan
            var a;
            while (a = anchor.pop()){
                if (menuStyle.scrollSpyOffsetTop >= a.position - container_scroll - container_pos){
                    var source = a.source;

                    if (menuStyle.onScrollSpyActivate){
                        if (menuStyle.onScrollSpyActivate(source) === false)
                            return;
                    }

                    data.elements.listItem.li.removeClass('selected');
                    source.addClass('selected');
                    //collapse everything
                    fn._collapseGroup(obj);
                    //if is a group, expand all child
                    fn._expand(a.source, settings);
                    //also select the parent
                    var parents = fn._getParents(a.source, settings.selectorChild, settings.selectorGroup);
                    if (parents.length){
                        for (var i = 0; i < parents.length; i++) {
                            parents[i].addClass('selected');
                            fn._expand(parents[i], settings);
                        }
                    }

                    a.source.show();

                    break;
                }
            }
        },
        _escapeRegexpString: function(regexp){
            return regexp.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

    };

    $.fn.jAutochecklist = function(method){
        //main
        if (fn[method]){
            if (method.substr(0, 1) === '_')
                $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
            return fn[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method){
            return fn.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
        }
    };

    //modify the default behavior of the select list
    var old_val = $.fn.val;
    $.fn.val = function(value){
        var data = this.data(pluginName);
        //if the list has applied the plugin
        if (data){
            //getter
            if (value === undefined)
                return this.jAutochecklist('get');
            //setter
            else
                return this.jAutochecklist('set', value, true);
        }

        return old_val.apply(this, arguments);
    };

})(jQuery, document, window);