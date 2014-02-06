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

	public static function mceConfig($mceConfigObj)
	{
		if($mceConfigObj->hasMenu('adv_insert'))
		{
			$mceConfigObj->addMenuItem('bbm_sedo_adv_fa', 'adv_insert', '@adv_insert_3');
		}
		else
		{
			$mceConfigObj->addMenuItem('bbm_sedo_adv_fa', 'insert', '@insert_2');
		}
	}	
}