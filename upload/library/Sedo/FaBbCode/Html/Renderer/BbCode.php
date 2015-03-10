<?php
class Sedo_FaBbCode_Html_Renderer_BbCode extends XFCP_Sedo_FaBbCode_Html_Renderer_BbCode
{
	protected $_sedoBackupHandlers;

	public function __construct(array $options = array())
	{
		$parent = parent::__construct($options);

		if(isset($this->_handlers['i']))
		{
			$this->_sedoBackupHandlers['i'] = $this->_handlers['i'];
		}
		
		$this->_handlers['i'] = array('filterCallback' => array('$this', 'handleSedoFa'), 'skipCss' => true);

		return $parent;
	}

	public function handleSedoFa($text, XenForo_Html_Tag $tag)
	{
		if($tag->attribute('name') == 'fa')
		{
			$faTag = BBM_Helper_Bbm::getBbmTagNameByUniqId('sedo_adv_fa');
			$faClass = explode(' ', $tag->attribute('class'));
			return "[{$faTag}={$faClass[1]}][/{$faTag}]";
		}
		
		return $this->_sedoOriginalHandlerOutput('i', $text, $tag);
	}
	
	protected function _sedoOriginalHandlerOutput($handlerCode, $outputText, XenForo_Html_Tag $tag, $preCssOutput = '')
	{
		if(!isset($this->_sedoBackupHandlers[$handlerCode]))
		{
			return $outputText;
		}
		
		$handler = $this->_sedoBackupHandlers[$handlerCode];
		
		if (!empty($handler['filterCallback']))
		{
			$callback = $handler['filterCallback'];
			if (is_array($callback) && $callback[0] == '$this')
			{
				$callback[0] = $this;
			}
			$outputText = call_user_func($callback, $outputText, $tag, $preCssOutput);
		}
		else if (isset($handler['wrap']))
		{
			$outputText = sprintf($handler['wrap'], $outputText);
		}
		
		return $outputText;
	}
}
//Zend_Debug::dump($abc);