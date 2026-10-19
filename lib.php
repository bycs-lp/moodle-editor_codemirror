<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Callback implementations for Codemirror
 *
 * @package    editor_codemirror
 * @copyright  2024 ISB Bayern
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Class editor
 *
 * @package    editor_codemirror
 * @copyright  2024 ISB Bayern
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class codemirror_texteditor extends texteditor {
    /**
     * This plugin only supports the FORMAT_CODE format.
     * @return array
     */
    public function get_supported_formats() {
        $formats = [ FORMAT_HTML => FORMAT_HTML ];
        return $formats;
    }

    /**
     * This editor prefers the FORMAT_HTML format.
     * @return int
     */
    public function get_preferred_format() {
        return FORMAT_HTML;
    }

    /**
     * This editor supports all browsers Moodle is currently supporting.
     *
     * @return bool
     */
    public function supported_by_browser() {
        return true;
    }

    /**
     * This editor does not support repositories.
     * @return bool
     */
    public function supports_repositories() {
        return false;
    }

    /**
     * Load JS for the editor.
     * @param string $elementid The ID of the element to attach the editor to.
     * @param array|null $options Options for the editor.
     * @param mixed $fpoptions Options for the filepicker.
     */
    public function use_editor($elementid, ?array $options = null, $fpoptions = null) {
        global $PAGE;

        $PAGE->requires->js_call_amd('editor_codemirror/editor', 'init', [$elementid, $options]);
    }
}
