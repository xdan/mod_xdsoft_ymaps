<?php
/**
 * @copyright	Copyright (c) 2014 XDSoft (http://xdan.ru) chupurnov@gmail.com. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

if (!function_exists('validateGeometry')) {
	function validateGeometry($geometry){
		$coords = $geometry;
		if (is_string($geometry)) {
			$coords = json_decode($geometry);
		}
		if ($coords and is_array($coords)) {
			if (count($coords)) {
				foreach ($coords as $r=>$t) {
					if (is_array($coords[$r])) {
						if (!validateGeometry($coords[$r])) {
							return false;
						}
					} else {
						if (!is_numeric($coords[$r]) || $coords[$r] === null) {
							return false;
						}
					}
				}
				return true;
			}
		}
		return false;
	}
}