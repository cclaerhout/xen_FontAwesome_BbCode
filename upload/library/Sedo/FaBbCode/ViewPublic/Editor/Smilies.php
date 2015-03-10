<?php
class Sedo_FaBbCode_ViewPublic_Editor_Smilies extends XFCP_Sedo_FaBbCode_ViewPublic_Editor_Smilies
{
	public function renderHtml()
	{
		if(is_callable('parent::renderHtml'))
		{
			parent::renderHtml();
		}

		if(XenForo_Application::get('options')->get('fa_bbcode_smilies_below_box_fa_integration'))
		{
			$this->_params['FA'] = Sedo_FaBbCode_Helper_FontAwesome::getFonts();
		}
	}
}
//Zend_Debug::dump($abc);