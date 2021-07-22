import { Condition, Encounter, Observation, Procedure } from "fhir/r4";
import './index.scss';
import { arrayMax, getResourcePath, optionalCompute } from 'utils/index'
import { Icon } from "@blueprintjs/core";
import { interpolateCividis } from "d3-scale-chromatic";

interface DevelopmentTableProps {
    encounters: Encounter[],
    conditionMap: Map<string, Condition[]>,
    observationMap: Map<string, Observation[]>,
    procedures: Procedure[],
    procedureObservationMapping: Map<string, Observation[]>,
}

function computeObservationData(observationList: Observation[]) {
    return {
        ApnoeIndex: observationList?.find(obs => obs.valueQuantity?.code === '90562-0')?.valueQuantity?.value,
        HypnopnoeIndex: observationList?.find(obs => obs.valueQuantity?.code === '90561-2')?.valueQuantity?.value,    
        RERAIndex: observationList?.find(obs => obs.valueQuantity?.code === '90565-3')?.valueQuantity?.value,    
        AHI: observationList?.find(obs => obs.valueQuantity?.code === '69990-0')?.valueQuantity?.value,    
        RDI: observationList?.find(obs => obs.valueQuantity?.code === '90566-1')?.valueQuantity?.value,    
        RDIpAHI: optionalCompute((a:number, b:number)=>a/b,
            observationList?.find(obs => obs.valueQuantity?.code === '90566-1')?.valueQuantity?.value,
            observationList?.find(obs => obs.valueQuantity?.code === '69990-0')?.valueQuantity?.value
        ),
        Schlaflatenz: observationList?.find(obs => obs.valueQuantity?.code === 'custom::sleepLatency')?.valueQuantity?.value,    
        Schnarchzeit: observationList?.find(obs => obs.valueQuantity?.code === 'custom::snoringTime')?.valueQuantity?.value,    
        totaleSchlafzeit: observationList?.find(obs => obs.valueQuantity?.code === '93832-4')?.valueQuantity?.value,    
        SchnarchenTotal: optionalCompute((a:number, b:number) => a/b*100.0, 
            observationList?.find(obs => obs.valueQuantity?.code === 'custom::snoringTime')?.valueQuantity?.value,
            observationList?.find(obs => obs.valueQuantity?.code === '93832-4')?.valueQuantity?.value
        ) ,    
        PLMIndex: observationList?.find(obs => obs.valueQuantity?.code === 'custom::plmIndex')?.valueQuantity?.value,
        ArousalIndex: observationList?.find(obs => obs.valueQuantity?.code === 'custom::arousalIndex')?.valueQuantity?.value
    }
}

function computeChange<T>(data1: {[K in keyof T]: number|undefined}, data2: {[K in keyof T]: number|undefined}): {[K in keyof T]: number|undefined} {
    const changeObj = {};
    for (const [key, value] of Object.entries<number|undefined>(data1)) {
        // @ts-ignore
        changeObj[key] = optionalCompute((a:number, b:number)=>100*(a/b-1), value, data2[key])
    }

    return changeObj as {[K in keyof T]: number|undefined} ;
}

const numberFormatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
function formatQuantityValue(quantity?: number): string {
    if(quantity === undefined){
        return '---';
    } else {
        return numberFormatter.format(quantity)
    }
}

function formatChange(change?: number) {
    if(change === undefined){
        return '---';
    } else {
        return <>
            <span>{numberFormatter.format(change)+' %'}</span>
        </>
    }
}

function changeArrow(change?: number) {
    if(change === undefined){
        return <Icon icon="minus"/>;
    } else {
        return <>
            <Icon icon="arrow-right" style={{
                transform: `rotate(${-Math.atan(change/100)}rad)`,
                color: change > 0 ? '#d9822b' : '#137cbd'
            }}/>
        </>
    }
}


const dateTimeStrCompare = (dts1: string, dts2: string) => Date.parse(dts2) - Date.parse(dts1);
const sortCriterion = (crit: 'start'|'end') => (e1: Encounter, e2: Encounter) => Date.parse(e1.period?.[crit]??'')-Date.parse(e2.period?.[crit]??''); 

export const DevelopmentTable = (props: DevelopmentTableProps) => {

    const proceduresWithDateTime = props.procedures.filter(proc => proc.performedDateTime !== undefined);
    if(proceduresWithDateTime.length < 2) {
        return (<span>Es sind nicht genug PSG daten hinterlegt, um einen Verlauf darzustellen.</span>)
    }

    proceduresWithDateTime.sort((proc1, proc2) => optionalCompute(dateTimeStrCompare, proc1.performedDateTime, proc2.performedDateTime) ?? 0)
    console.log(proceduresWithDateTime);

    const lastProcedure = proceduresWithDateTime[1];
    const currentProcedure = proceduresWithDateTime[0];

    const lastProcedureStr = getResourcePath(lastProcedure);
    const currentProcedureStr = getResourcePath(currentProcedure);

    const lastObservations = props.procedureObservationMapping.get(lastProcedureStr ?? '') ?? [];
    const currentObservations = props.procedureObservationMapping.get(currentProcedureStr ?? '') ?? [];

    console.debug(props.observationMap)

    const lastObservationData = computeObservationData(lastObservations)
    const currentObservationData = computeObservationData(currentObservations)
    const dataChange = computeChange(currentObservationData, lastObservationData)
    console.log(dataChange)


    // Compute most recent diagnoses
    // const activeEncounters = props.encounters
    //     ?.filter(enc => enc.status === 'in-progress') ?? [];

    // let isActive = false;
    // let mostRecentEncounter: Encounter|undefined;
    // if(activeEncounters.length > 1) {
    //     console.warn(`Patient has multiple active cases!`)
    //     mostRecentEncounter = arrayMax(activeEncounters, sortCriterion('start'));
    //     isActive = true;
    // } else if(activeEncounters.length == 1) {
    //     mostRecentEncounter = activeEncounters[0];
    //     isActive = true;
    // } else if(activeEncounters.length == 0) {
    //     mostRecentEncounter = arrayMax(props.encounters, sortCriterion('end'));
    //     isActive = false;
    // }

    // const conditions = mostRecentEncounter ? props.conditionMap.get(getResourcePath(mostRecentEncounter)??'') : undefined;
    // let mostRecentCondition = conditions?.find(cond => cond.note?.[0].text === 'discharge') ??
    //     conditions?.find(cond => cond.note?.[0].text === 'admission');

    // console.log() 

    const conditionsForLastProcedure =  props.conditionMap.get(lastProcedure.encounter?.reference ?? '');
    const mostRecentConditionForLastProcedure = conditionsForLastProcedure?.find(cond => cond.note?.[0].text === 'discharge') ?? 
        conditionsForLastProcedure?.find(cond => cond.note?.[0].text === 'admission');

    const conditionsForCurrentProcedure =  props.conditionMap.get(currentProcedure.encounter?.reference ?? '');
    const mostRecentConditionForCurrentProcedure = conditionsForCurrentProcedure?.find(cond => cond.note?.[0].text === 'discharge') ?? 
        conditionsForCurrentProcedure?.find(cond => cond.note?.[0].text === 'admission');

    return (
        <>
            <h2>Verlaufsinformationen</h2>
            <div className="DevelopmentTable-container">
                <table className="DevelopmentTable-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Letzter Wert<br/>{new Date(lastProcedure.performedDateTime ?? '').toLocaleDateString('de')}</th>
                            <th>Aktueller Wert<br/>{new Date(currentProcedure.performedDateTime ?? '').toLocaleDateString('de')}</th>
                            <th>Entwicklung</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="DevelopmentTable-lastDiagnoseRow">
                            <td>{'Letzte Diagnose'}</td>
                            <td>{mostRecentConditionForLastProcedure?.code?.coding?.[0].display ?? '---'}</td>
                            <td>{mostRecentConditionForCurrentProcedure?.code?.coding?.[0].display ?? '---'}</td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr>
                            <td>{'Arousal Index (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.ArousalIndex)}</td>
                            <td>{formatQuantityValue(currentObservationData.ArousalIndex)}</td>
                            <td>{formatChange(dataChange.ArousalIndex)}</td>
                            <td>{changeArrow(dataChange.ArousalIndex)}</td>
                        </tr>
                        <tr>
                            <td>{'Apnoe Index (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.ApnoeIndex)}</td>
                            <td>{formatQuantityValue(currentObservationData.ApnoeIndex)}</td>
                            <td>{formatChange(dataChange.ApnoeIndex)}</td>
                            <td>{changeArrow(dataChange.ApnoeIndex)}</td>
                        </tr>
                        <tr>
                            <td>{'Hypnopnoe Index (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.HypnopnoeIndex)}</td>
                            <td>{formatQuantityValue(currentObservationData.HypnopnoeIndex)}</td>
                            <td>{formatChange(dataChange.HypnopnoeIndex)}</td>
                            <td>{changeArrow(dataChange.HypnopnoeIndex)}</td>
                        </tr>
                        <tr>
                            <td>{'RERA Index (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.RERAIndex)}</td>
                            <td>{formatQuantityValue(currentObservationData.RERAIndex)}</td>
                            <td>{formatChange(dataChange.RERAIndex)}</td>
                            <td>{changeArrow(dataChange.RERAIndex)}</td>
                        </tr>
                        <tr>
                            <td>{'AHI (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.AHI)}</td>
                            <td>{formatQuantityValue(currentObservationData.AHI)}</td>
                            <td>{formatChange(dataChange.AHI)}</td>
                            <td>{changeArrow(dataChange.AHI)}</td>
                        </tr>
                        <tr>
                            <td>{'RDI (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.RDI)}</td>
                            <td>{formatQuantityValue(currentObservationData.RDI)}</td>
                            <td>{formatChange(dataChange.RDI)}</td>
                            <td>{changeArrow(dataChange.RDI)}</td>
                        </tr>
                        <tr>
                            <td>{'RDI / AHI (1)'}</td>
                            <td>{formatQuantityValue(lastObservationData.RDIpAHI)}</td>
                            <td>{formatQuantityValue(currentObservationData.RDIpAHI)}</td>
                            <td>{formatChange(dataChange.RDIpAHI)}</td>
                            <td>{changeArrow(dataChange.RDIpAHI)}</td>
                        </tr>
                        <tr>
                            <td>{'Schlaflatenz (min)'}</td>
                            <td>{formatQuantityValue(lastObservationData.Schlaflatenz)}</td>
                            <td>{formatQuantityValue(currentObservationData.Schlaflatenz)}</td>
                            <td>{formatChange(dataChange.Schlaflatenz)}</td>
                            <td>{changeArrow(dataChange.Schlaflatenz)}</td>
                        </tr>
                        <tr>
                            <td>{'Schnarchzeit (min)'}</td>
                            <td>{formatQuantityValue(lastObservationData.Schnarchzeit)}</td>
                            <td>{formatQuantityValue(currentObservationData.Schnarchzeit)}</td>
                            <td>{formatChange(dataChange.Schnarchzeit)}</td>
                            <td>{changeArrow(dataChange.Schnarchzeit)}</td>
                        </tr>
                        <tr>
                            <td>{'totale Schlafzeit (min)'}</td>
                            <td>{formatQuantityValue(lastObservationData.totaleSchlafzeit)}</td>
                            <td>{formatQuantityValue(currentObservationData.totaleSchlafzeit)}</td>
                            <td>{formatChange(dataChange.totaleSchlafzeit)}</td>
                            <td>{changeArrow(dataChange.totaleSchlafzeit)}</td>
                        </tr>
                        <tr>
                            <td>{'Schnarchen Total (%TST)'}</td>
                            <td>{formatQuantityValue(lastObservationData.SchnarchenTotal)}</td>
                            <td>{formatQuantityValue(currentObservationData.SchnarchenTotal)}</td>
                            <td>{formatChange(dataChange.SchnarchenTotal)}</td>
                            <td>{changeArrow(dataChange.SchnarchenTotal)}</td>
                        </tr>
                        <tr>
                            <td>{'PLM Index (n/h)'}</td>
                            <td>{formatQuantityValue(lastObservationData.PLMIndex)}</td>
                            <td>{formatQuantityValue(currentObservationData.PLMIndex)}</td>
                            <td>{formatChange(dataChange.PLMIndex)}</td>
                            <td>{changeArrow(dataChange.PLMIndex)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}






                
