import { Condition, Encounter, Observation } from "fhir/r4";
import './index.scss';

interface DevelopmentTableProps {
    encounters: Encounter[],
    conditionMap: Map<string, Condition[]>,
    observationMap: Map<string, Observation[]>,
}

export const DevelopmentTable = (props: DevelopmentTableProps) => {
    return (
        <table className="DevelopmentTable-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Letzter Wert</th>
                    <th>Aktueller Wert</th>
                    <th>Entwicklung</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>{'Apnoe Index (n/h)'}</td></tr>
                <tr><td>{'Hypnopnoe Index (n/h)'}</td></tr>
                <tr><td>{'RERA Index (n/h)'}</td></tr>
                <tr><td>{'AHI'}</td></tr>
                <tr><td>{'RDI'}</td></tr>
                <tr><td>{'RDI / AHI (n/h)'}</td></tr>
                <tr><td>{'Schlaflatenz (min)'}</td></tr>
                <tr><td>{'Arousal Index (n/h)'}</td></tr>
                <tr><td>{'Schnarchzeit (min)'}</td></tr>
                <tr><td>{'totale Schlafzeit (min)'}</td></tr>
                <tr><td>{'Schnarchen Total (%TST)'}</td></tr>
                <tr><td>{'PLM Index'}</td></tr>
            </tbody>
        </table>
    )
}



