import { Resource } from "fhir/r4";
import internal from "stream";

/**
 * Map that will provide add the value obtained by defaultFunction if a unknown key is given in the get method.
 */
export class DefaultMap<K, V> extends Map<K, V> {
    
    get(key: K): V {
        let value = super.get(key);
        if (value === undefined) {
            value = this.defaultFunction();
            this.set(key, value);
            return value;
        }
        return value;
    }
    
    constructor(private defaultFunction: () => V, entries?: readonly (readonly [K, V])[] | null) {
      super(entries);
    }
}

/**
 * Maps a FHIR resource to its (relative path)
 * E.g. 
 * `{resource: {id: "5", resourceType: "Patient"}}` will be mapped to 'Patient/5'
 */
export function getResourcePath(resource: Resource): string|undefined {
    const id = resource.id;
    if (id === undefined) return undefined;
    return resource.resourceType + '/' + id;
}