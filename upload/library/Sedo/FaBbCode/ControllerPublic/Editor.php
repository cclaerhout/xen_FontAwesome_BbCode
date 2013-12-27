<?php
class Sedo_FaBbCode_ControllerPublic_Editor extends XFCP_Sedo_FaBbCode_ControllerPublic_Editor
{
	protected function _quattroViewParams($dialog, $viewParams)
	{
		if ($dialog == 'bbm_fa')
		{
			$viewParams['fonts'] = array_flip(Sedo_FaBbCode_Helper_FontAwesome::getFonts());
		}		
		
		return parent::_quattroViewParams($dialog, $viewParams);
	}
}