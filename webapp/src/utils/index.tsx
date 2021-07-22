import { Reference, Resource } from "fhir/r4";
import "./index.scss";

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



export function constructReferenceMap<R extends string, T extends Resource&{[key in R]?: Reference|Reference[]}>(resources: T[], refProp: R): Map<string, T[]> {
    const refMap = new DefaultMap<string, T[]>(() => []);
    resources.forEach(res => {
        let refs: (Reference|undefined)[]|undefined;
        if(Array.isArray(res[refProp])) {
            refs = res[refProp] as Reference[]|undefined;
        } else {
            refs = [res[refProp] as Reference|undefined];
        }
        refs?.forEach(ref => {
            if(ref?.reference === undefined) return;
            refMap.defaultGet(ref?.reference).push(res);
        })
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

type OptTuple<T extends unknown[]> = {[K in keyof T]: T[K]|undefined};
export function optionalCompute<T extends unknown[], S>(fun: (...inp: [...T]) => S, ...inp: [...OptTuple<T>]): S|undefined {
    if(inp.some(x => x===undefined))
        return undefined
    else {
        return fun(...(inp as [...T]))
    }
}



/**
 * returns the respective gender symbol as svg
 * @param gender of a patient 
 */
 export const transformIntoGenderSymbol = (gender?: string) => {
    
    const svg_width = "20";
    const svg_height = "20";
    const male_color = "#137cbd";
    const female_color = "black";

    if (gender === "male") {
        return (
            <svg width={svg_width} height={svg_height} viewBox="0 15 30 10" className="GenderIcon">
                <circle cx="15" cy="25" r="8"  strokeWidth="2" fill="none" />
                <line x1="19" x2="26" y1="17" y2="10" strokeWidth="2" />
                <line x1="27" x2="16" y1="9" y2="11" strokeWidth="2" />
                <line x1="27" x2="27" y1="9" y2="19" strokeWidth="2" />
            </svg>
        )
    } else if (gender === "female") {
        return (
            <svg width={svg_width} height={svg_height} viewBox="0 15 30 10" className="GenderIcon">
                <circle cx="15" cy="15" r="8"  strokeWidth="2" fill="none" />
                <line x1="15" x2="15" y1="23" y2="33" strokeWidth="2" />
                <line x1="10" x2="20" y1="28" y2="28" strokeWidth="2" />
            </svg>
        )
    } else {
        console.log("gender is undefined");
        return null
    }
}