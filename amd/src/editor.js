import {initPreview} from './preview';

export const init = (targetid, options) => {
    require(['editor_codemirror/cm6pro-lazy'], (CodeProEditor) => {
        const targetElem = document.getElementById(targetid);
        const cm = new CodeProEditor(targetElem, options);

        // Initialize preview functionality
        initPreview(cm, targetElem);
    });
};
