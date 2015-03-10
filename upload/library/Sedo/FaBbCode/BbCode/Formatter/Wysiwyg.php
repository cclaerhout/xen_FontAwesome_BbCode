<?php
class Sedo_FaBbCode_BbCode_Formatter_Wysiwyg extends XFCP_Sedo_FaBbCode_BbCode_Formatter_Wysiwyg
{
	/**
	 * Extend tags
	 */
	public function getTags()
	{
		$parentTags = parent::getTags();

		if(is_array($parentTags))
		{
			$faTag = BBM_Helper_Bbm::getBbmTagNameByUniqId('sedo_adv_fa');

			$parentTags += array(
				$faTag => array(
					'callback' => array($this, 'renderTagSedoFa'),
				)
			);			
		}

		return $parentTags;
	}

	public function renderTagSedoFa(array $tag, array $rendererStates)
	{
		$tagName = $tag['tag'];
		$tagOptions = explode('|', $tag['option']);
		$content = $this->renderSubTree($tag['children'], $rendererStates);
		
		if(count($tagOptions) != 1 || $content)
		{
			return $this->renderTagUnparsed($tag, $rendererStates);
		}
		else
		{
			return '<i name="fa" class="fa '.$tagOptions[0].'">&#8888;</i>&#8291;';
		}
	}
}
//Zend_Debug::dump($parent);