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

declare(strict_types=1);

namespace editor_codemirror\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;
use core_external\external_single_structure;

/**
 * External function for formatting text with filters.
 *
 * @package    editor_codemirror
 * @copyright  2025
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class format_text extends external_api {

    /**
     * Returns description of method parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'text' => new external_value(PARAM_RAW, 'The text to format'),
            'contextid' => new external_value(PARAM_INT, 'Context ID'),
            'format' => new external_value(PARAM_INT, 'Text format', VALUE_DEFAULT, FORMAT_HTML),
        ]);
    }

    /**
     * Format text with filters.
     *
     * @param string $text The text to format
     * @param int $contextid Context ID
     * @param int $format Text format
     * @return array
     */
    public static function execute(string $text, int $contextid, int $format = FORMAT_HTML): array {
        global $PAGE;

        $params = self::validate_parameters(self::execute_parameters(), [
            'text' => $text,
            'contextid' => $contextid,
            'format' => $format,
        ]);

        $context = \context::instance_by_id($params['contextid']);
        self::validate_context($context);

        // Set the page context for filter processing
        $PAGE->set_context($context);

        $options = new \stdClass();
        $options->filter = true;
        $options->noclean = false;
        $options->para = false;

        // Pass the context object, not the context ID
        $formattedtext = format_text($params['text'], $params['format'], $options);

        return [
            'text' => $formattedtext,
        ];
    }

    /**
     * Returns description of method result value.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'text' => new external_value(PARAM_RAW, 'The formatted text'),
        ]);
    }
}
