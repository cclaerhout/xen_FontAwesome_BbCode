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
}