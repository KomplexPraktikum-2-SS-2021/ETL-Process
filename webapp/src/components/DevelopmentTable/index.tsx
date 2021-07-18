import { Condition, Encounter, Observation, Procedure } from "fhir/r4";
import './index.scss';
import { getResourcePath, optionalCompute } from 'utils/index'
import { Icon } from "@blueprintjs/core";

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
        Schlaflatenz: observationList?.find(obs => obs.valueQuantity?.code === 'Schlaflatenz')?.valueQuantity?.value,    
        Schnarchzeit: observationList?.find(obs => obs.valueQuantity?.code === '72863001')?.valueQuantity?.value,    
        totaleSchlafzeit: observationList?.find(obs => obs.valueQuantity?.code === '93832-4')?.valueQuantity?.value,    
        SchnarchenTotal: optionalCompute((a:number, b:number) => a/b*100.0, 
            observationList?.find(obs => obs.valueQuantity?.code === '72863001')?.valueQuantity?.value,
            observationList?.find(obs => obs.valueQuantity?.code === '93832-4')?.valueQuantity?.value
        ) ,    
        PLMIndex: observationList?.find(obs => obs.valueQuantity?.code === '418763003')?.valueQuantity?.value
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

const dateTimeStrCompare = (dts1: string, dts2: string) => Date.parse(dts2) - Date.parse(dts1);

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

    return (
        <table className="DevelopmentTable-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Letzter Wert<br/>{new Date(lastProcedure.performedDateTime ?? '').toLocaleDateString('de')}</th>
                    <th>Aktueller Wert<br/>{new Date(currentProcedure.performedDateTime ?? '').toLocaleDateString('de')}</th>
                    <th>Entwicklung</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{'Apnoe Index (n/h)'}</td>
                    <td>{formatQuantityValue(lastObservationData.ApnoeIndex)}</td>
                    <td>{formatQuantityValue(currentObservationData.ApnoeIndex)}</td>
                    <td>{formatQuantityValue(dataChange.ApnoeIndex)} <Icon icon="arrow-right" style={{
                        transform: 'rotate(90deg)'
                    }}></Icon></td>
                </tr>
                <tr>
                    <td>{'Hypnopnoe Index (n/h)'}</td>
                    <td>{formatQuantityValue(lastObservationData.HypnopnoeIndex)}</td>
                    <td>{formatQuantityValue(currentObservationData.HypnopnoeIndex)}</td>
                    <td>{formatQuantityValue(dataChange.HypnopnoeIndex)}</td>
                </tr>
                <tr>
                    <td>{'RERA Index (n/h)'}</td>
                    <td>{formatQuantityValue(lastObservationData.RERAIndex)}</td>
                    <td>{formatQuantityValue(currentObservationData.RERAIndex)}</td>
                    <td>{formatQuantityValue(dataChange.RERAIndex)}</td>
                </tr>
                <tr>
                    <td>{'AHI'}</td>
                    <td>{formatQuantityValue(lastObservationData.AHI)}</td>
                    <td>{formatQuantityValue(currentObservationData.AHI)}</td>
                    <td>{formatQuantityValue(dataChange.AHI)}</td>
                </tr>
                <tr>
                    <td>{'RDI'}</td>
                    <td>{formatQuantityValue(lastObservationData.RDI)}</td>
                    <td>{formatQuantityValue(currentObservationData.RDI)}</td>
                    <td>{formatQuantityValue(dataChange.RDI)}</td>
                </tr>
                <tr>
                    <td>{'RDI / AHI (n/h)'}</td>
                    <td>{formatQuantityValue(lastObservationData.RDIpAHI)}</td>
                    <td>{formatQuantityValue(currentObservationData.RDIpAHI)}</td>
                    <td>{formatQuantityValue(dataChange.RDIpAHI)}</td>
                </tr>
                <tr>
                    <td>{'Schlaflatenz (min)'}</td>
                    <td>{formatQuantityValue(lastObservationData.Schlaflatenz)}</td>
                    <td>{formatQuantityValue(currentObservationData.Schlaflatenz)}</td>
                    <td>{formatQuantityValue(dataChange.Schlaflatenz)}</td>
                </tr>
                <tr>
                    <td>{'Schnarchzeit (min)'}</td>
                    <td>{formatQuantityValue(lastObservationData.Schnarchzeit)}</td>
                    <td>{formatQuantityValue(currentObservationData.Schnarchzeit)}</td>
                    <td>{formatQuantityValue(dataChange.Schnarchzeit)}</td>
                </tr>
                <tr>
                    <td>{'totale Schlafzeit (min)'}</td>
                    <td>{formatQuantityValue(lastObservationData.totaleSchlafzeit)}</td>
                    <td>{formatQuantityValue(currentObservationData.totaleSchlafzeit)}</td>
                    <td>{formatQuantityValue(dataChange.totaleSchlafzeit)}</td>
                </tr>
                <tr>
                    <td>{'Schnarchen Total (%TST)'}</td>
                    <td>{formatQuantityValue(lastObservationData.SchnarchenTotal)}</td>
                    <td>{formatQuantityValue(currentObservationData.SchnarchenTotal)}</td>
                    <td>{formatQuantityValue(dataChange.SchnarchenTotal)}</td>
                </tr>
                <tr>
                    <td>{'PLM Index'}</td>
                    <td>{formatQuantityValue(lastObservationData.PLMIndex)}</td>
                    <td>{formatQuantityValue(currentObservationData.PLMIndex)}</td>
                    <td>{formatQuantityValue(dataChange.PLMIndex)}</td>
                </tr>
            </tbody>
        </table>
    )
}






                
