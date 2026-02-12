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
 * @module     editor_codemirror/codemirror
 * @file       amd/src/preview.js
 */

import {get_strings as getStrings} from 'core/str';
import Ajax from 'core/ajax';

/**
 * Creates and manages preview toggle functionality for the editor.
 *
 * @param {Object} editorInstance - The CodeMirror editor instance
 * @param {HTMLElement} targetElement - The target element where editor is initialized
 * @returns {Object} Preview controller with destroy method
 */
export const initPreview = (editorInstance, targetElement) => {
    const state = {
        isPreview: false,
        applyFilters: true,
        elements: {},
        strings: {}
    };

    /**
     * Creates the preview container.
     * @returns {HTMLElement}
     */
    const createPreviewContainer = () => {
        const container = document.createElement('div');
        container.classList.add('editor_codemirror/preview-container');
        container.style.display = 'none';
        container.style.padding = '10px';
        container.style.border = '1px solid #ddd';
        container.style.minHeight = '200px';
        container.style.backgroundColor = '#fff';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', state.strings.htmlpreview);
        return container;
    };

    /**
     * Creates the toggle button with fallback icon support.
     * @returns {HTMLElement}
     */
    const createToggleButton = () => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-secondary', 'editor_codemirror/preview-toggle');
        button.setAttribute('aria-label', state.strings.togglepreview);
        button.setAttribute('title', state.strings.togglepreview);

        // Set initial icon (eye for "view preview" state)
        updateButtonIcon(button, false);

        return button;
    };

    /**
     * Creates the filter checkbox.
     * @returns {HTMLElement}
     */
    const createFilterCheckbox = () => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('form-check');
        wrapper.classList.add('form-switch');
        wrapper.style.marginLeft = '10px';
        wrapper.style.display = 'none';
        wrapper.style.alignItems = 'center';
        wrapper.style.cursor = 'pointer';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = state.applyFilters;
        checkbox.setAttribute('id', 'editor_codemirror/filter-checkbox');
        checkbox.classList.add('form-check-input');
        checkbox.style.marginRight = '5px';

        const label = document.createElement('label');
        label.textContent = state.strings.applyfilters;
        label.classList.add('form-check-label');
        label.setAttribute('for', 'editor_codemirror/filter-checkbox');

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        return wrapper;
    };

    /**
     * Updates button icon with fallback for different Moodle versions.
     * Supports both Font Awesome 4.x (Moodle LTS) and 6.x (Moodle 4.0+)
     *
     * @param {HTMLElement} button - The button element
     * @param {boolean} isPreviewMode - Whether preview is currently active
     */
    const updateButtonIcon = (button, isPreviewMode) => {
        // Clear existing content.
        button.innerHTML = '';

        const icon = document.createElement('i');

        if (isPreviewMode) {
            // Show code icon when in preview mode (to switch back to code).
            icon.className = 'fa fa-code';
            icon.setAttribute('aria-hidden', 'true');
            button.appendChild(icon);
            button.appendChild(document.createTextNode(state.strings.code));
        } else {
            // Switch to preview.
            icon.className = 'fa fa-eye';
            icon.setAttribute('aria-hidden', 'true');
            button.appendChild(icon);
            button.appendChild(document.createTextNode(state.strings.preview));
        }
    };

    /**
     * Toggles between code and preview mode.
     */
    const togglePreview = async() => {
        const {previewContainer, toggleButton, editorElement, filterCheckbox} = state.elements;

        state.isPreview = !state.isPreview;

        if (state.isPreview) {
            // Switch to preview mode.
            previewContainer.style.display = 'block';
            editorElement.hidden = true;
            filterCheckbox.style.display = 'inline-flex';

            // Get content from editor.
            const content = editorInstance.getValue();

            // Check if filters should be applied.
            if (state.applyFilters) {
                // Apply filters through Moodle's format_text function.
                try {
                    const result = await Ajax.call([{
                        methodname: 'editor_codemirror_format_text',
                        args: {
                            text: content,
                            contextid: M.cfg.contextid || 1,
                            format: 1 // FORMAT_HTML.
                        }
                    }])[0];
                    previewContainer.innerHTML = result.text;
                } catch (error) {
                    // Fallback to unfiltered content if web service fails.
                    previewContainer.innerHTML = content;
                }
            } else {
                // Display unfiltered content.
                previewContainer.innerHTML = content;
            }

            updateButtonIcon(toggleButton, true);
            toggleButton.setAttribute('aria-pressed', 'true');
        } else {
            // Switch to code mode.
            previewContainer.style.display = 'none';
            editorElement.hidden = false;
            filterCheckbox.style.display = 'none';

            updateButtonIcon(toggleButton, false);
            toggleButton.setAttribute('aria-pressed', 'false');
        }
    };

    /**
     * Initializes the preview functionality.
     */
    const initialize = async() => {
        // Load language strings.
        const strings = await getStrings([
            {key: 'preview', component: 'editor_codemirror'},
            {key: 'code', component: 'editor_codemirror'},
            {key: 'togglepreview', component: 'editor_codemirror'},
            {key: 'htmlpreview', component: 'editor_codemirror'},
            {key: 'applyfilters', component: 'editor_codemirror'}
        ]);

        // Store strings in state.
        state.strings = {
            preview: strings[0],
            code: strings[1],
            togglepreview: strings[2],
            htmlpreview: strings[3],
            applyfilters: strings[4]
        };

        const editorElement = document.querySelector('.cm-editor');

        if (!editorElement || !targetElement.parentNode) {
            // eslint-disable-next-line no-console
            console.error('CodeMirror editor element not found');
            return;
        }

        // Create UI elements.
        const previewContainer = createPreviewContainer();
        const toggleButton = createToggleButton();
        const filterCheckbox = createFilterCheckbox();

        // Create controls container.
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('editor_codemirror/preview-controls');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.marginBottom = '10px';
        controlsContainer.style.paddingTop = '10px';

        // Store references.
        state.elements = {
            editorElement,
            previewContainer,
            toggleButton,
            filterCheckbox,
            controlsContainer
        };
        toggleButton.addEventListener('click', togglePreview);

        const checkbox = filterCheckbox.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            state.applyFilters = e.target.checked;
            // If preview is currently shown, refresh it.
            if (state.isPreview) {
                togglePreview().then(() => togglePreview());
            }
        });

        // Append buttons to controls container then to DOM.
        controlsContainer.appendChild(toggleButton);
        controlsContainer.appendChild(filterCheckbox);
        targetElement.parentNode.appendChild(previewContainer);
        targetElement.parentNode.appendChild(controlsContainer);
    };

    /**
     * Destroys the preview functionality and cleans up.
     */
    const destroy = () => {
        const {previewContainer, toggleButton, controlsContainer} = state.elements;

        if (toggleButton) {
            toggleButton.removeEventListener('click', togglePreview);
        }

        if (controlsContainer) {
            controlsContainer.remove();
        }

        if (previewContainer) {
            previewContainer.remove();
        }

        state.elements = {};
    };

    // Initialize on creation.
    initialize();

    // Return controller.
    return {
        destroy,
        toggle: togglePreview
    };
};
