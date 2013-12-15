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

		$fontSize = '';
		$textPosition = 'right';
		
		/* Browse Options */
		foreach($options as $option)
		{
			$original = $option;
			$option = self::_cleanOption($option, true);
			
			if (Sedo_FaBbCode_Helper_FontAwesome::getFontCode($option))
			{
				$calledFonts[] = $option;				
			}
			elseif(Sedo_FaBbCode_Helper_FontAwesome::checkFontSize($option))
			{
				$fontSize = $option;
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
					$callOptions[] = 'fa-border';
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
		}
		
		$cssUniqFont = false;
		$cssWrapper = false;
		$cssFont1 = false;
		$csssFont2 = false;

		if(count($calledFonts) >= 2 && isset($callOptions['wrapper']))
		{
			if(!isset($callOptions['font_2']))
			{
				$callOptions['font_2'] = array();
			}
			
			$callOptions['wrapper'][] = $fontSize;
			$callOptions['font_1'][] = $calledFonts[0];
			$callOptions['font_2'][] = $calledFonts[1];
			
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
			$callOptions += array($calledFonts[0], $fontSize);
			
			$callOptions = array_unique($callOptions);
			$cssUniqFont = implode(' ', $callOptions);
		}
		
		$options['uniqFont'] = $cssUniqFont;
		$options['stack'] = array(
			'wrapper' => $cssWrapper,
			'font1' => $cssFont1,
			'font2' => $cssFont2
		);
		$options['textPosition'] = $textPosition;
		$options['badIE'] = self::_isBadIE(8);
	}

	/*Mini Tools*/

	protected static function _cleanOption($string, $strtolower = false)
	{
		if(XenForo_Application::get('options')->get('FaBbCode_ZenkakuConv'))
		{
			$string = mb_convert_kana($string, 'a', 'UTF-8');
		}
		
		if($strtolower == true)
		{
			$string = strtolower($string);
		}
		
		return $string;
	}
	
	protected static function _isBadIE($isBelow = 9)
	{
		$goTo = $isBelow-1;

		$visitor = XenForo_Visitor::getInstance();
		if(isset($visitor->getBrowser['IEis']))
		{
			//Browser Detection (Mobile/MSIE) Addon
			if($visitor->getBrowser['isIE'] && $visitor->getBrowser['IEis'] < $isBelow)
			{
				return true;
			}
		}
		else
		{
			//Manual helper
			if(Sedo_AdvBBcodeBar_Helper_Sedo::isBadIE('target', "6-$goTo"))
			{
				return true;
			}
		}
		
		return false;
	}

	public static $regexUrl = '#^(?:(?:https?|ftp|file)://|www\.|ftp\.)[-\p{L}0-9+&@\#/%=~_|$?!:,.]*[-\p{L}0-9+&@\#/%=~_|$]$#ui';

	protected static function _rgb2hex($color)
	{
		//Match R, G, B values
		preg_match('#^rgb\((?P<r>\d{1,3}).+?(?P<g>\d{1,3}).+?(?P<b>\d{1,3})\)$#i', $color, $rgb);
		//Convert them in hexa
		//Code source: http://forum.codecall.net/php-tutorials/22589-rgb-hex-colors-hex-colors-rgb-php.html				
		$output = sprintf("%x", ($rgb['r'] << 16) + ($rgb['g'] << 8) + $rgb['b']);
		
	       	return $output;
	}
	
	protected static $requestUri = null;
	protected static $fullBasePath = null;
	protected static $fullUri = null;	

	protected static function _getRequestPath($mode = 'requestUri')
	{
		if(self::$requestUri === null)
		{
			$requestPath = XenForo_Application::get('requestPaths');
			self::$requestUri = $requestPath['requestUri'];
			self::$fullBasePath = $requestPath['fullBasePath'];
			self::$fullUri = $requestPath['fullUri'];			
		}
		
		switch ($mode) {
			case 'requestUri':
				return self::$requestUri;
			break;
			case 'fullBasePath':
				return self::$fullBasePath;
			break;
			case 'fullUri':
				return self::$fullUri;
			break;		
		}
	}

	public static function useResponsiveMode()
	{
		$isResponsive = XenForo_Template_Helper_Core::styleProperty('enableResponsive');
		
		if(!$isResponsive)
		{
			return false;
		}
		
		return self::isMobile();
	}
	
	public static function isMobile($option = false)
	{
		if((!class_exists('Sedo_DetectBrowser_Listener_Visitor') || !isset($visitor->getBrowser['isMobile'])))
		{
			return XenForo_Visitor::isBrowsingWith('mobile');
		}
		else
		{
			//External addon
			if($option == 'onlyTablet')
			{
				return $visitor->getBrowser['isTablet'];
			}

			return $visitor->getBrowser['isMobile'];
		}
	}	
}
//Zend_Debug::dump($abc);