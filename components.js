import { urlFrom } from "./module-url.js";

// Proxy dont work as expected so we will use our BaseComponent as base for other components
export class BaseComponent extends HTMLElement {
    constructor(...args) {
        super(...args);
        this._componentInit(this);
    }
    _componentInit(){};
}

export async function componentLoad(importMeta, templateUrl, styleUrl) {
    const files = [];
    if (templateUrl) {
        files.push(fetch(urlFrom(importMeta, templateUrl)));
    } else {
        files.push('');
    }
    if (styleUrl) {
        files.push(fetch(urlFrom(importMeta, styleUrl)));
    } else {
        files.push('');
    }
    const [templateResponse, styleResponse] = await Promise.all(files);
    return {template:  templateResponse == '' ? templateResponse : await templateResponse.text(), style: styleResponse == '' ? styleResponse : await styleResponse.text()};
}
export function componentCreate(importMeta, constructor, {name, style, template}) {
    const component = constructor;
    // Using proxy in different modules causes constructor errors so we modify prototype of passed component
    component.prototype._componentInit = function(comp) {
        comp.attachShadow({mode: 'open'});
        comp.shadowRoot.innerHTML = '<style>' + data.style + '</style>' + data.template;
        // Binding events to component functions
        let elements = comp.shadowRoot.querySelectorAll('[data-c-on]');
        for (let elem of elements) {
            const [eventName,callbackName] = elem.dataset.cOn.split(',');
            elem.addEventListener(eventName, function(event) {
                comp[callbackName](event, comp);
            });
        }
        // Binding element reference to component propery
        elements = comp.shadowRoot.querySelectorAll('[data-c-ref]');
        for (let elem of elements) {
            const refName = elem.dataset.cRef;
            comp[refName] = elem;
        }
    };
    const data = {
        name,
        component,
        style: '',
        template: ''
    };
    componentLoad(importMeta, template, style).then(function(files) {
        data.template = files.template;
        data.style = files.style;
        customElements.define(name, component);
    });
    return data;
}