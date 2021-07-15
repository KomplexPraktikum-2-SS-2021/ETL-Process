import { Reference, Resource } from "fhir/r4";
import internal from "stream";

/**
 * Map that will provide add the value obtained by defaultFunction if a unknown key is given in the get method.
 */
export class DefaultMap<K, V> extends Map<K, V> {
    
    defaultGet(key: K): V {
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



export function constructReferenceMap<R extends string, T extends Resource&{[key in R]?: Reference}>(resources: T[], refProp: R): Map<string, T[]> {
    const refMap = new DefaultMap<string, T[]>(() => []);
    resources.forEach(res => {
        const ref = res[refProp]?.reference;
        if(ref === undefined) return;
        
        refMap.defaultGet(ref).push(res);
    });

    return refMap;
}


export function binaryChainReferenceMaps<A extends Resource, B extends Resource>(refMap1: Map<string, A[]>, refMap2: Map<string, B[]>) {
    const refMap = new Map<string, B[]>();
    refMap1.forEach(
        (value, key) => refMap.set(key, value.flatMap(
            a => refMap2.get(getResourcePath(a) ?? '') ?? [])
        )
    );
    return refMap;
}


// export function chainReferenceMaps(refMaps: [Reference, ...Reference[]]) {
//     return 
// }


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

// function arrayMin<T>(arr: [T,...T[]], comp: (a:T, b:T) => number): T ;
export function arrayMin<T>(arr: T[], comp: (a:T, b:T) => number): T|undefined{
    return arr.reduce((p, v) => comp(p,v)<0 ? p : v, arr[0]);
}
  
export function arrayMax<T>(arr: T[], comp: (a:T, b:T) => number): T|undefined{
    return arr.reduce((p, v) => comp(p,v)>0 ? p : v, arr[0]);
}



export function calculateAge(birthday: Date): number { // birthday is a date
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// From https://www.tutorialspoint.com/levenshtein-distance-in-javascript
export function levenshteinDistance(str1 = '', str2 = ''): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
};