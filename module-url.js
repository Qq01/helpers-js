export function urlFrom(moduleImport, path) {
    return new URL(path, moduleImport.meta.url);
}