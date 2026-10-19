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

namespace editor_codemirror\form;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir . '/formslib.php');
require_once($CFG->libdir . '/form/editor.php');

/**
 * Element type for Moodleforms to enforce the use of the codemirror editor.
 * @package    editor_codemirror
 * @copyright  2026 ISB Bayern
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author     Stefan Hanauska <stefan.hanauska@csg-in.de>
 */
class MoodleQuickForm_codemirror extends \MoodleQuickForm_editor {
    /**
     * Constructor
     *
     * @param string|null $name (optional) name of the editor
     * @param string|null $label (optional) editor label
     * @param string|array|null $attributes (optional) Either a typical HTML attribute string or an associative array
     * @param array|null $options set of options to initalize filepicker
     */
    public function __construct(
        ?string $name = null,
        ?string $label = null,
        string|array|null $attributes = null,
        ?array $options = null
    ) {
        $this->_type = 'codemirror';
        parent::__construct($name, $label, $attributes, $options);
        if (is_array($attributes) && isset($attributes['data-codemirror-language'])) {
            $this->_options['codemirror-language'] = $attributes['data-codemirror-language'];
        }
        $editor = get_texteditor('codemirror');
        // Use textarea as a fallback.
        if (!$editor) {
            $editor = get_texteditor('textarea');
        }
        $editor->head_setup();
    }

    /**
     * Returns HTML for editor form element.
     *
     * @return string
     */
    public function toHtml() { // phpcs:ignore
        global $OUTPUT;

        if ($this->_flagFrozen) {
            return $this->getFrozenHtml();
        }

        $id           = $this->_attributes['id'];
        $text         = $this->_values['text'];

        $str = $this->_getTabs();
        $str .= '<div>';

        $editor = get_texteditor('codemirror');

        $editor->set_text($text);
        $editor->use_editor($id, $this->_options);

        $rows = empty($this->_attributes['rows']) ? 15 : $this->_attributes['rows'];
        $cols = empty($this->_attributes['cols']) ? 80 : $this->_attributes['cols'];

        $context = [];
        $context['rows'] = $rows;
        $context['cols'] = $cols;
        $context['frozen'] = $this->_flagFrozen;
        foreach ($this->getAttributes() as $name => $value) {
            $context[$name] = $value;
        }

        $context['id'] = $id;
        $context['value'] = $text;

        $str .= $OUTPUT->render_from_template('core_form/editor_textarea', $context);

        $str .= '</div>';

        return $str;
    }

    /**
     * Accept plain strings as well as editor arrays.
     *
     * @param string|array|object $values
     */
    public function setValue($values) { // phpcs:ignore
        if (!is_array($values) && !is_object($values)) {
            $values = ['text' => (string) $values, 'format' => FORMAT_HTML];
        }
        parent::setValue($values);
    }

    /**
     * Register the editor type with the form library.
     */
    public static function register() {
        // Register the editor type with the form library.
        \MoodleQuickForm::registerElementType('codemirror', __FILE__, '\editor_codemirror\form\MoodleQuickForm_codemirror');
    }
}
