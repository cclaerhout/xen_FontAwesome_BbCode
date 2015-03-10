<?php
class Sedo_FaBbCode_Listeners
{
	public static function controllerPublic($class, array &$extend)
	{
		if ($class == 'XenForo_ControllerPublic_Editor')
        	{
			$extend[] = 'Sedo_FaBbCode_ControllerPublic_Editor';
		}
	}

	public static function extendViewPublicEditorSmilies($class, array &$extend)
	{
		if($class == 'XenForo_ViewPublic_Editor_Smilies')
		{
			$extend[] = 'Sedo_FaBbCode_ViewPublic_Editor_Smilies';
		}
	}

	public static function extendHtmlRendererBbCode($class, array &$extend)
	{
		if($class == 'XenForo_Html_Renderer_BbCode')
		{
			$extend[] = 'Sedo_FaBbCode_Html_Renderer_BbCode';
		}
	}
	
	public static function extendBbCodeWysiwygFormatter($class, array &$extend)
	{
		if($class == 'XenForo_BbCode_Formatter_Wysiwyg')
		{
			$extend[] = 'Sedo_FaBbCode_BbCode_Formatter_Wysiwyg';
		}	
	}
	
	public static function extendMceConfig($mceConfigObj)
	{
		if($mceConfigObj->hasMenu('adv_insert'))
		{
			$mceConfigObj->addMenuItem('bbm_sedo_adv_fa', 'adv_insert', '@adv_insert_3');
		}
		else
		{
			$mceConfigObj->addMenuItem('bbm_sedo_adv_fa', 'insert', '@insert_2');
		}
		
		$mceConfigObj->setMceExtendedValidElement('i', array('name', 'class', 'data'));
	}
}