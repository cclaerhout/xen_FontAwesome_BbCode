<?php

class Sedo_FaBbCode_BbCode_Formatter_FaBbCode
{
	public static function parseTagFa(&$content, array &$options, &$templateName, &$fallBack, array $rendererStates, $parentClass)
	{
		$xenOptions = XenForo_Application::get('options');
		$visitor = XenForo_Visitor::getInstance();
		
		$calledFonts = array();
		$callOptions = array();
		$stackEnabled = false;
		
		$extraCssFirst = array();
		$extraCssSecond = array();
		
		$fontSize = array();
		$color = array();		
		$textPosition = 'right';
		
		/* Browse Options */
		foreach($options as $option)
		{
			$original = $option;
			$option = BBM_Helper_BbCodes::cleanOption($option, true);
			
			if (Sedo_FaBbCode_Helper_FontAwesome::getFontCode($option))
			{
				$calledFonts[] = $option;				
			}
			elseif(Sedo_FaBbCode_Helper_FontAwesome::checkFontSize($option))
			{
				$fontSize[] = $option;
			}
			elseif(Sedo_FaBbCode_Helper_FontAwesome::checkFontOption($option, false))
			{
				if(!$stackEnabled)
				{
					if($option != 'fa-stack')
					{
						$callOptions[] = $option;
					}
				}
				else
				{
					$callOptions['font_2'][] = $option;
				}

				if(in_array($option, array('pull-right', 'pull-left')))
				{
					//$callOptions[] = 'fa-border';
				}
				elseif($option == 'fa-stack')
				{
					$stackEnabled = true;
					$callOptions = array(
						'wrapper' => array('fa-stack'),
						'font_1' => $callOptions
					);
				}
				
			}
			elseif($option == 'left')
			{
				$textPosition = 'left';
			}
			elseif($option == 'right')
			{
				$textPosition = 'right';
			}
			elseif(preg_match(BBM_Helper_BbCodes::$colorRegex, $option, $match)){
				$color[] = $match[0];
			}
		}
		
		$cssUniqFont = false;
		$cssWrapper = false;
		$cssFont1 = false;
		$cssFont2 = false;

		if(count($calledFonts) >= 2 && isset($callOptions['wrapper']))
		{
			if(!isset($callOptions['font_2']))
			{
				$callOptions['font_2'] = array();
			}
			
			$callOptions['wrapper'][] = (isset($fontSize[0])) ? $fontSize[0] : '';
			$callOptions['font_1'][] = $calledFonts[0];
			$callOptions['font_2'][] = $calledFonts[1];
			
			if(isset($fontSize[1]) && $fontSize[1] = 'fa-lg')
			{
				//Only allow fa-lg for the second option to avoid too big icons
				$callOptions['font_2'][] = $fontSize[1];
			}
			
			if(isset($color[0]))
			{
				$extraCssFirst[] = 'color: '.$color[0];
			}
			
			if(isset($color[1]))
			{
				$extraCssSecond[] = 'color: '.$color[1];			
			}
			
			foreach($callOptions as &$arrayParent)
			{
				$arrayParent = array_unique($arrayParent);
			}
			
			$cssWrapper = implode(' ', $callOptions['wrapper']);
			$cssFont1 = implode(' ', $callOptions['font_1']);
			$cssFont2 = implode(' ', $callOptions['font_2']);
		}
		elseif(!empty($calledFonts))
		{
			$fontSize = (isset($fontSize[0])) ? $fontSize[0] : '';

			$callOptions = array_merge($callOptions, array($calledFonts[0], $fontSize));
			$callOptions = array_unique($callOptions);
			$cssUniqFont = implode(' ', $callOptions);

			if(isset($color[0]))
			{
				$extraCssFirst[] = 'color: '.$color[0];
			}			
		}

		$extraCssFirst = implode('; ', $extraCssFirst);
		$extraCssSecond = implode('; ', $extraCssSecond);
		
		$options['uniqFont'] = $cssUniqFont;
		$options['stack'] = array(
			'wrapper' => $cssWrapper,
			'font1' => $cssFont1,
			'font2' => $cssFont2
		);
		$options['extraCssFirst'] = (empty($extraCssFirst)) ? '' : "style='$extraCssFirst'";
		$options['extraCssSecond'] = (empty($extraCssSecond)) ? '' : "style='$extraCssSecond'";
		$options['textPosition'] = $textPosition;
		$options['badIE'] = BBM_Helper_BbCodes::isBadIE(8);
	}
}
//Zend_Debug::dump($abc);