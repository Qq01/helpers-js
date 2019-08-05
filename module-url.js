/**
 * 
 * @param {{url:string}} importMeta 
 * @param {string} path 
 */
export function urlFrom(importMeta, path) {
    return new URL(path, importMeta.url);
}