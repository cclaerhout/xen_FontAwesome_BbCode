xenMCE.Templates.Bbm_fa = {
	getFaOptions: function()
	{
		var faSize = ['fa-lg', 'fa-2x', 'fa-3x', 'fa-4x', 'fa-5x'],
			faPull = ['pull-right', 'pull-left'],
			faRotate = ['fa-rotate-90', 'fa-rotate-180', 'fa-rotate-270'],
			faStack = ['fa-stack', 'fa-stack-1x', 'fa-stack-2x', 'fa-inverse'],
			faStackSize = ['fa-stack-1x', 'fa-stack-2x'],
			faFlip = ['fa-flip-horizontal', 'fa-flip-vertical'],
			faMisc = ['fa-fw', 'fa-border', 'fa-spin'],
			faAll = $.merge($.merge([],faSize), faPull);
			
		$.each([faRotate, faStack, faFlip, faMisc], function(i,v){
			$.merge(faAll, v);
		});
		
		return {
			size: faSize,
			pull: faPull,
			rotate: faRotate,
			stack: faStack,
			stackSize: faStackSize,
			flip: faFlip,
			misc: faMisc,
			faAll: faAll
		}
	},
	intersect: function(array1, array2, alterArray1)
	{
		var firstArrayAltered = false,
			keys = [],
			vals = $.grep(array1, function(v) {
				/*Important: ouput will be an array*/
				return $.inArray(v, array2) > -1;
			});

		$.each(vals, function(i, v){
			var key_tmp = $.inArray(v.toString(), array1);
		
			if(alterArray1 === true && key_tmp !== -1){
				array1.splice(key_tmp, 1);		
				firstArrayAltered = true;
			}
			
			keys.push(key_tmp);
		});
		
		return {
			array: { keys: keys, vals: vals	},
			string: { keys: keys.toString(), vals: vals.toString() },
			altered: firstArrayAltered 
		}
	},
	deleteValFromArray: function(array, toDelete, toAddIfMissing)
	{
		var self = this, stringMode = true, newArray = [];
					
		if( $.isArray(toDelete) ){
			stringMode = false;
		}else if(typeof toDelete !== 'string'){
			return newArray;
		}

		if(stringMode){
			$.each(array, function(i, v){
				if(v != toDelete){
					newArray.push(v);
				}
			});
		}else{
			$.each(array, function(i, v){
				if($.inArray(v, toDelete) === -1){
					newArray.push(v);
				}
			});
		}
		
		if(typeof toAddIfMissing === 'undefined'){
			return newArray;	
		}else if(typeof toAddIfMissing === 'string'){
			toAddIfMissing = [toAddIfMissing];
		}

		$.each(toAddIfMissing, function(i, v){
			if($.inArray(v, toDelete) === -1){
				newArray.push(v);
			}
		});
		
		return newArray;
	},
	onafterload: function($ovl, data, ed, parentClass)
	{
		/***
		 * MCE INTERFACE
		 **/
		var selection = parentClass.getSelection(), 
			content = selection.text, 
			phrases = xenMCE.Phrases;

		/***
		 * Init some variables
		 **/
		var  self = this,
			listFaName = 'fa_list', 
			listOptionsName = 'fa_options',
			listOptionsWrapper = 'options_wrapper',
			keyPhrase = 'jAutochecklist',
			keyWrapperPhrase = keyPhrase+'_wrapper',
			popPhrase = keyPhrase+'_popup',
			faPhrases = xenMCE.Phrases.Fa,
			inputPhrase = faPhrases.textInput,
			faOptions = this.getFaOptions(),
			$faList = $ovl.find('#'+listFaName),
			$optionLists = $ovl.find('.'+listOptionsName),
			preview_fa = 'preview_fa',
			inputs = {
				$b1: findInput('bbmFaBtn1'),
				$b2: findInput('bbmFaBtn2'),
				$opt1: findInput('bbmFaOpt1'),
				$opt2: findInput('bbmFaOpt2'),
				$optRoot: findInput('bbmFaOptRoot'),
				$pos: findInput('bbmFaPos'),
				$text: findInput('bbmFaText'),
				$stack: findInput('bbmFaStack'),
				$color1: findInput('bbmFaColor1'),
				$color2: findInput('bbmFaColor2')
			},
			preview = {
				$container: $ovl.find('#'+preview_fa),
				$text: $ovl.find('#'+preview_fa+'_txt'),
				$solo: $ovl.find('#'+preview_fa+'_solo'),
				$stack: $ovl.find('#'+preview_fa+'_stack'),
				$align: $ovl.find('#'+preview_fa+'_align'),
				$colpick1: $ovl.find('#bbm_fa_colpick_1'),
				$colpick2: $ovl.find('#bbm_fa_colpick_2')
			};
			
		preview.stack = {
			$root: preview.$stack.children('span'),
			$b1: preview.$stack.find('i').eq(0),
			$b2: preview.$stack.find('i').eq(1)
		};

		this.stackMode = false;
		this.itemClickCallBack = false;
		
		//to avoid any bugs - reason, the jackl return data sometimes have problems
		this.protectedData = { icons: [], opt1: [], opt2: [] }; 

		/***
		 * Functions library
		 **/	

			//This function is specific to font-awesome
			function getValuesToDeleteByVal(val){
				if(!val) return [];
				
				var valuesToDelete = [];
			
				if($.inArray(val, faOptions.size) !== -1){
					valuesToDelete = self.deleteValFromArray(faOptions.size, val);
				}
				if($.inArray(val, faOptions.pull) !== -1){
					valuesToDelete = self.deleteValFromArray(faOptions.pull, val);
				}
				if($.inArray(val, faOptions.rotate) !== -1){
					valuesToDelete = self.deleteValFromArray(faOptions.rotate, val);
					$.merge(valuesToDelete, faOptions.flip);
				}
				if($.inArray(val, faOptions.stackSize) !== -1){
					valuesToDelete = self.deleteValFromArray(faOptions.stackSize, val);
				}
				if($.inArray(val, faOptions.flip) !== -1){
					valuesToDelete = faOptions.rotate;
				}
				
				return valuesToDelete;
			}

			//This function is a way to be sure to have real values (the jackl can return curious things)
			function manageProtectedData(val, list){
				if(typeof val === 'undefined') return false;
			
				var protectedData = self.protectedData[list],
					valInData = ($.inArray(val, protectedData) !== -1),
					dataWasAdded = false;
	
				if(!valInData){
					var valuesToDelete = getValuesToDeleteByVal(val);
	
					protectedData.push(val);
					
					if(valuesToDelete.length){
						protectedData = self.deleteValFromArray(protectedData, valuesToDelete);
					}
					
					dataWasAdded = true;
				}else{
					protectedData = self.deleteValFromArray(protectedData, val);
				}
				
				self.protectedData[list] = protectedData;
				
				return dataWasAdded;
			}
		 	
			//Basic function to get the list once it has been created by its name
			function findCreatedList(name){
				return $ovl.find('#'+keyWrapperPhrase+'_'+name);
			}
			
			//Function to enable/disable a list by it's jQuery selector - @return the original list
			function enableList(targetedList, state){
				if((typeof state === 'undefined' || state == true) && state != 'disable'){
					state = 'enable';
				}else{
					state = 'disable';
				}
				
				return $ovl.find(targetedList).jAutochecklist(state);	
			}
	
			//Function to enable/disable the stack mode
			function enableStackMode(state){
				var className = 'locked', state = (state) ? 1:0;
				self.stackMode = state;
	
				enableList('#'+listOptionsName+'_2', state);
				inputs.$stack.val(state);
				
				if(state){
					$stackLi.removeClass(className);
				}else{
					$stackLi.addClass(className);
					resetOptList_2();
				}
			}
	
			//Shortcut for jAutochecklist
			function jackl($src, cmd, a, b, c){
				return $src.jAutochecklist(cmd, a, b, c);
			}
			
			//Manage stack size (should be rewritten to make it simpler since both stack size are not dependent)
			function manageStackSize(stackMode){
				var stack1x = 'fa-stack-1x', stack2x = 'fa-stack-2x';
	
				if(!stackMode){
					jackl($optionLists, 'unset', [stack1x, stack2x]);
					return false;
				};
	
				var stackSize = {1: stack1x, 2: stack2x},
					data_l1 = jackl($optionList_1, 'get'),
					data_l2 = jackl($optionList_2, 'get'),
					empty_l1 = empty_l2 = true,
					results = { l1: {}, l2: {} };
	
				$.each(stackSize, function(i, v){
					var l1 = $.inArray(v, data_l1),
						l2 = $.inArray(v, data_l2);
					
					results.l1[i] = (l1 !== -1);
					results.l2[i] = (l2 !== -1);
					
					if(l1 !== -1){
						results.l1.val = data_l1[l1];
					}
	
					if(l2 !== -1){
						results.l2.val = data_l2[l2];
					}				
				});
	
				function oppositeVal(val){
					switch(val){
						case stack1x: return stack2x;
						case stack2x: return stack1x;
					}
				}
			
				if(results.l1[1] || results.l1[2]){
					empty_l1 = false;
				}
	
				if(results.l2[1] || results.l2[2]){
					empty_l2 = false;
				}
	
				if(empty_l1 && empty_l2){
					manageProtectedData(stack2x, 'opt1');
					manageProtectedData(stack1x, 'opt2');
					jackl($optionList_1, 'set', [stack2x]);
					jackl($optionList_2, 'set', [stack1x]);
					return;
				}else if(empty_l1 && !empty_l2){
					//give opposite value to l1
					var data = oppositeVal(results.l2.val);
					manageProtectedData(data, 'opt1');
					jackl($optionList_1, 'set', data);
					return;
				}else if(empty_l2 && !empty_l1){
					//give opposite value to l2
					var data = oppositeVal(results.l1.val);
					manageProtectedData(data, 'opt2');
					jackl($optionList_2, 'set', oppositeVal(results.l1.val));
					return;
				}
			}
			
			//Short cut to find input by name
			function findInput(inputName){
				return $ovl.find('input[name="'+inputName+'"]');
			}
			

			//Delete a value from an input
			function deleteValFromInput($input, toDelete){
				var inputVal = $input.val();
				inputVal = inputVal.split(',');
				inputVal = self.deleteValFromArray(inputVal, toDelete);
				inputVal = $.grep(inputVal,function(n){ return(n) });
				
				$input.val(inputVal);
			}

			//Delete a value from an input
			function addValFromInput($input, toAdd){
				var inputVal = $input.val();
				inputVal = inputVal.split(',');
				inputVal = self.deleteValFromArray(inputVal, toAdd);
				inputVal.push(toAdd);
				inputVal = $.grep(inputVal,function(n){ return(n) });

				$input.val(inputVal);
			}

			//A few reset functions		
			function resetAll(){
				resetListState();
				resetInputs();
				resetPreview();
			
				//Stack Mode
				self.stackMode = false;
	
				//Deselect all options lists			
				$optionLists.jAutochecklist('deselectAll');
				
				//Reset protected data
				self.protectedData = { icons: [], opt1: [], opt2: [] }; 
			}
	
			function resetListState(){
				enableList('#'+listOptionsName+'_1, #'+listOptionsName+'_2', false);
			}
		
			function resetInputs(){
				//Inputs
				$.each(inputs, function(k,$e){
					var value = '', name = $e.attr('name');
					
					switch(name){
						case 'bbmFaStack': value = 0; break;
						case 'bbmFaPos': value = 'left'; break;
						case 'bbmFaText': value = inputPhrase; break;
						case 'bbmFaColor1': return;
						case 'bbmFaColor2': return;
					}
		
					$e.val(value);
				});
			}
		
			function resetPreview(){
				preview.$solo.show().children().removeClass();
				preview.$stack.hide();
				$.each(preview.stack, function(k,$e){
					$e.removeClass();
				});
			}
			
			//To use when self.stackMode is disabled (especially when there were 2 icons and one is unselected)
			function resetOptList_2(extra){
					self.protectedData.opt1 = self.deleteValFromArray(self.protectedData.opt1, faOptions.stackSize);
					
					inputs.$b2.val('');
					inputs.$optRoot.val('');
					
					//jackl($optionList_2, 'deselectAll'); //Doesn't work
					jackl($optionList_2, 'unset', self.protectedData.opt2);
					self.protectedData.opt2 = [];

					if(extra == true){
						enableList('#'+listOptionsName+'_2', false);
						resetPreview();
					}
			}

			//Stack Mode Enable - Manage stack root options
			function manageOptRoot(data){
				var sizeIntersect = self.intersect(data, faOptions.size, true);
						
				if(sizeIntersect.altered){
					var size = sizeIntersect.string.vals,
						inputVal = inputs.$optRoot.val();
						inputVal = (!inputVal.length) ? [] : inputVal.split(',');
						
					//Delete previous size from inputVal if needed
					self.intersect(inputVal, faOptions.size, true);
					
					//Push new size
					inputVal.push(size);
	
					//Update input
					inputs.$optRoot.val(inputVal);
	
					//Update preview
					var $root = preview.stack.$root;
					$.each(faOptions.size, function(k,v){
						$root.removeClass(v);
					});
					$root.addClass(size);
	
					return size;
				}		
			}

		/***
		 * CONFIG LISTS
		 * Ref: http://iflyingangel.com/project/jAutochecklist
		 **/
		var configFaList = {
			multiple: true,
			popup: true,
			popupMaxItem: 2,
			listMaxHeight: 100,
			width: 250,
			popupSizeDelta: 0,
			//dynamicPosition: true,
			popupLogoAsValue:true,
			htmlResults: true,
			sortValues: true,
			popupLogoClassRegexFind: /fa-(lg|2x|3x|4x|5x)/gi,
		        onItemClick: function(val, $li, valBefore, valAfter){
				var i = $faList.jAutochecklist('count'),
					data = $faList.jAutochecklist('get'),
					list1 = (i > 0),
					stackMode = false,
					btn1 = '',
					btn2 = '';

				enableList('#'+listOptionsName+'_1', list1);

				if(i == 1){
					$stackLi.addClass('locked');
					btn1 = data[0];
				}else if(i == 2){
					stackMode = true;
					$stackLi.removeClass('locked');
					btn1 = data[0];
					btn2 = data[1];
				}else if(i > 2){
					return false;
				}

				enableStackMode(stackMode);

				if(stackMode){
					var oldB1Val = inputs.$b1.val(), 
						oldB2Val = inputs.$b2.val(),
						extraClass = '';
						
					preview.stack.$root.addClass('fa-stack');
					preview.stack.$b1.removeClass(oldB1Val).addClass('fa '+btn1+extraClass);
					preview.stack.$b2.removeClass(oldB2Val).addClass('fa '+btn2+extraClass);
									
					preview.$solo.hide();
					preview.$stack.show();

					inputs.$b1.val(btn1);
					inputs.$b2.val(btn2);					
				}else{
					var oldB1Val = inputs.$b1.val();
					preview.$solo.children('i').removeClass(oldB1Val).addClass('fa '+btn1);
					preview.$stack.hide();
					preview.$solo.show();				

					inputs.$b1.val(btn1);
				}

				//Let's manage Stack size options at the very end
				manageStackSize(stackMode);
			},
			onRemoveAll: function(button, values){
				resetAll();
			}
		}

		var configOptionsList = {
			multiple: true,
			popup: true,
			listMaxHeight: 100,
			width: 250,
			popupSizeDelta: 0,
			sortValues: true,
			groupType: 4,
			showResultsAsText: true,
			sortValues: true,
		        onItemClick: function(val, $li, valBefore, valAfter, checked){
				var $currentList = $li.parents('.'+keyWrapperPhrase),
					index = 1+$createdOptionLists.index($currentList),
					$src = $ovl.find('#'+listOptionsName+'_'+index),
					newData = (!$li.hasClass('selected'));

				var dataWasAdded = manageProtectedData(val, 'opt'+index);

				self.itemClickCallBack = false;

				/*Create a callback to execute on update complete*/
				if(dataWasAdded){
					var valuesToDelete = getValuesToDeleteByVal(val);

					if(valuesToDelete.length){
						self.itemClickCallBack = {
							$src: $src,
							toDelete: valuesToDelete,
							toAdd: val
						};
					}
				}
			},
			onUpdateComplete: function(values, source){
				var index = 1+$optionLists.index(source.originalList),
					list = 'opt'+index,
					$target, btnVal, cssClass, optionInput, 
					values = self.protectedData[list];

				if(self.stackMode){
					if(index == 1){
						/*Manage root options - will modified values*/							
						manageOptRoot(values);
						
						$target = preview.stack.$b1;
						optionInput = inputs.$opt1;
						btnVal = inputs.$b1.val();
					}else{
						$target = preview.stack.$b2;
						optionInput = inputs.$opt2;
						btnVal = inputs.$b2.val();
					}
				}else{
					if(index == 1){
						$target = preview.$solo.children('i');
						optionInput = inputs.$opt1;
						btnVal = inputs.$b1.val();
					}else{
						return false;	
					}
	
				}

				/*Manage Option Input & Preview*/
				if(btnVal){
					$target.removeClass().addClass('fa '+btnVal);				
				}
				
				if(values.length){
					$.each(values, function(i, v){
						$target.addClass(v);
					});
				}

				optionInput.val(values);

				/*Execute Callback if enabled*/
				if(self.itemClickCallBack != false){
					var callback = $.extend({}, self.itemClickCallBack);
					self.itemClickCallBack = false;
					jackl(callback.$src, 'unset', callback.toDelete);
				}
			},
			onRemoveAll: function(button, values){
				var $currentCreateOptiondList = button.parents('.'+keyWrapperPhrase),
					index = 1+ $createdOptionLists.index($currentCreateOptiondList),
					list = 'opt'+index,
					values = self.protectedData[list];
					
				if(self.stackMode){
					if(index == 1){
						$target = preview.stack.$b1;
						inputs.$opt1.val('');
					}else{
						$target = preview.stack.$b2;
						inputs.$opt2.val('');
					}
				}else{
					$target = preview.$solo.children('i');
					inputs.$opt1.val('');
				}
					
				$.each(values, function(i,v){
					$target.removeClass(v);
				});
				
				self.protectedData[list] = [];
			}
		
		}
		
		/***
		 * EXTEND LIST CONFIG WITH TRANSLATED PHRASES
		 **/
		$.extend(configFaList, faPhrases);
		$.extend(configOptionsList, faPhrases);

		/***
		 * INIT LISTS
		 **/
		$faList.jAutochecklist(configFaList);
		$optionLists.jAutochecklist(configOptionsList);
		
		var $optionList_1 = enableList('#'+listOptionsName+'_1', false),
			$optionList_2 = enableList('#'+listOptionsName+'_2', false),
			$createdOptionLists = $ovl.find('.'+keyWrapperPhrase+'.'+listOptionsName),
			$stackLi = $createdOptionLists.children('ul').children().filter(function(){
				return $(this).data('name') == 'stack';
			});

		/***
		 * Text Input
		 **/
		inputs.$text.one('focus', function () {
			$(this).val('');
		}).focus(function () {
			if( $(this).val() == inputPhrase ) 
				$(this).val('');
		}).focusout(function() {
			if( $(this).val().length == 0 ){
				$(this).val(inputPhrase);
			}
		});

		/***
		 * Align Management
		 **/
		preview.$align.click(function(e){
			var $children = $(this).children(),
				$square = $children.eq(0),
				$align = $children.eq(1),
				left = 'left', right = 'right',
				faleft = 'fa-align-'+left,
				faright = 'fa-align-'+right;
			
			function resetClass(){
				$align.removeClass(faleft+' '+faright);
			}
			
			if($align.hasClass(faleft)){
				resetClass();
				$align.addClass(faright);
				inputs.$pos.val(right);
				preview.$text.appendTo(preview.$container)
					.removeClass(left).addClass(right);
			
			}else{
				resetClass();
				$align.addClass(faleft);							
				inputs.$pos.val(left);
				preview.$text.prependTo(preview.$container)
					.removeClass(right).addClass(left);
			}
		});

		/***
		 * Color pickers
		 **/
		 var $bbm_fa_colpick = $ovl.find('.bbm_fa_colpick').colpick({
			colorScheme:'dark',
			layout:'hex',
			color:'ff8800',
			onSubmit:function(hsb,hex,rgb,el) {
				var $el = $(el);
					index = $ovl.find('.bbm_fa_colpick').index($el),
					color = '#'+hex;
		
				index++;
				if(index == 0) return;
				
				if(index == 1){
					inputs.$color1.val(color);
					preview.$solo.children('i').css('color', color);
					preview.stack.$b1.css('color', color);
				}

				if(index == 2){
					inputs.$color2.val(color);
					preview.stack.$b2.css('color', color);
				}
				
				$el.find('i').last().css('color', color);
				$el.colpickHide();
			},
			onShow: function(el){
				var $el = $(el);

				$el.css({
					zIndex: 65550,
					height: '230px'
				});
				
				$raz = $('<div class="bbm_fa_color_raz">'+faPhrases.resetColor+'</div>');

				$raz.click(function(e){
					var $this = $(this), 
						$parent = $this.parent(),
						isSecond = $parent.prev('.colpick').length,
						index = (isSecond) ? 2 : 1;
					
					if(index == 0) return;
					
					if(index == 1){
						inputs.$color1.val('');
						preview.$solo.children('i').css('color', '');
						preview.stack.$b1.css('color', '');
						preview.$colpick1.find('i').last().css('color', '');
						preview.$colpick1.colpickHide();
					}

					if(index == 2){
						inputs.$color2.val('');
						preview.stack.$b2.css('color', '');
						preview.$colpick2.find('i').last().css('color', '');
						preview.$colpick2.colpickHide();
					}
				});
				
				$raz.appendTo($el);
			}
		});
	},
	submit: function(e, $ovl, ed, parentClass)
	{
 		var faOptions = this.getFaOptions(),
	 		faPhrases = xenMCE.Phrases.Fa,
			inputPhrase = faPhrases.textInput;
 		
		var tag = parentClass.bbm_tag, separator = parentClass.bbm_separator, data = e.data,
			stack = parseInt(data.bbmFaStack), //bool
			btn1 = data.bbmFaBtn1.split(','), //array
			btn2 = data.bbmFaBtn2.split(','), //array
			optRoot = data.bbmFaOptRoot.split(','), //array
			opt1 = data.bbmFaOpt1.split(','), //array
			opt2 = data.bbmFaOpt2.split(','), //array
			text = (data.bbmFaText != inputPhrase) ? parentClass.escapeHtml(data.bbmFaText) : '', //string
			left = (data.bbmFaPos == 'left'), //bool
			color1 = data.bbmFaColor1 || '', //string
			color2 = data.bbmFaColor2 || ''; //string
			
		var output = '', tagO, tagC, options = [];

		function message(){
			ed.windowManager.alert(faPhrases.missingAlert);
		}
		
		if(stack){
			//Let's put this data as the first one with the stack mode
			if(optRoot.length){
				$.merge(options, optRoot);
			}
		}

		if(!btn1.length){
			message();
			return false;
		}else{
			if(color1.length){
				options.push(color1);
			}

			$.merge(options, btn1);

			if(opt1.length){
				$.merge(options, opt1);
			}			
		}

		if(stack){
			options.push('fa-stack');

			if(!btn2.length){
				message();
				return false;
			}else{
				if(color2.length){
					options.push(color2);
				}

				$.merge(options, btn2);
					
				if(opt2.length){
					$.merge(options, opt2);
				}
			}
		}

		if(text.length && left){
			options.push('left');
		}
			
		//Delete empty values
		options = $.grep(options,function(n){ return(n) });
		//To string
		options = options.join(separator);

		tagO = '['+tag+'='+options+']',
		tagC = '[/'+tag+']';
		output = tagO+text+tagC;

		if(!options || options == 'left'){
			message();
			return false;
		}
		
		ed.execCommand('mceInsertContent', false, output);		
	},
	onclose: function(e, $ovl, ed, parentClass)
	{
		//Remove all instance of color pickers
		$ovl.find('.bbm_fa_colpick').each(function(){
			var colpickId = $(this).data('colpickId');
			
			if(!colpickId) return;
			
			$('#'+colpickId).remove();
		});
	}
}