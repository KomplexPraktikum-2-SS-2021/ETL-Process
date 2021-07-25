import { IDiag, IObservEntry } from './utils'

const setDiagText = (name: string, code: string) => {
    if (name !== code) {
        return name + " (" + code + ")"
    } else {
        return code
    }
}


export const DiagnosisRow = ({
    diag_admission,
    diag_discharge
    
}: DiagProps) => {

    console.log("diag_admission:", diag_discharge)

    return (
        <div className={`details-view__diag-row`}>
            <b>Aufnahme:</b>
            <div className={`diag-entry`}>
                {
                    diag_admission? (
                        setDiagText(diag_admission.name, diag_admission.code)
                    ) : "nicht verfügbar"
                }
            </div>
            <b style={{"marginLeft": "40px"}}>Entlassung:</b>
            <div className={`diag-entry`}>
                {
                    diag_discharge? (
                        setDiagText(diag_discharge.name, diag_discharge.code)
                    ) : "nicht verfügbar"
                }
            </div>
        </div>
    )
}

const TableRow = ({
    attrib_1_title,
    attrib_1_value,
    attrib_1_unit,
    attrib_2_title,
    attrib_2_value,
    attrib_2_unit
}: RowPros) => {

    return (
        <tr className={`poly-data-table-tr`}>
            <td className={`poly-data-table-td poly-data-other poly-data-title`}>{attrib_1_title}</td>
            <td className={`poly-data-table-td poly-data-value`}>{attrib_1_value}</td>
            <td className={`poly-data-table-td poly-data-other spacer`}>{attrib_1_unit}</td>
            <td className={`poly-data-table-td poly-data-other poly-data-title`}>{attrib_2_title}</td>
            <td className={`poly-data-table-td poly-data-value`}>{attrib_2_value}</td>
            <td className={`poly-data-table-td poly-data-other`}>{attrib_2_unit}</td>
        </tr>

    )
}

function createTableRow(observ1: IObservEntry, observ2?: IObservEntry) {

    let m_observ2_name = "";
    let m_observ2_value = "";
    let m_observ2_unit = "";

    if (observ2) {
        m_observ2_name = observ2.name;
        m_observ2_value = observ2.value.toString();
        m_observ2_unit = observ2.unit;
    }

    return (
        <TableRow attrib_1_title={observ1.name} attrib_1_value={observ1.value.toString()} attrib_1_unit={observ1.unit}
                    attrib_2_title={m_observ2_name} attrib_2_value={m_observ2_value} attrib_2_unit={m_observ2_unit}/>
    )

}

function convertIntoDoubleEntries(observations: IObservEntry[]) {
    const new_observations: IObservEntry[][] = []
    let i = 0;
    while(i < observations.length) {
        const j = i;
        new_observations.push([observations[j], observations[j + 1]])
        i += 2;
    }
    return new_observations;
}

function sortObservations(observations: IObservEntry[]) {
    let mapping_code_name = new Map()
    mapping_code_name.set('Apnea Index', 1);
    mapping_code_name.set('Hypnopnea Index', 2);
    mapping_code_name.set('RERA Index', 3);
    mapping_code_name.set('AHI', 4);
    mapping_code_name.set('RDI', 5);
    mapping_code_name.set('RDI / AHI', 6);
    mapping_code_name.set('Totale Schlafzeit', 11);
    mapping_code_name.set('PLM Index', 8);
    mapping_code_name.set('Schnarchzeit', 9);
    mapping_code_name.set('Schlaflatenz', 10);
    mapping_code_name.set('Schnarchen Total', 12);
    mapping_code_name.set('Arousal Index', 7);

    let i = 0;
    while (i < observations.length) {
        observations[i].order = mapping_code_name.get(observations[i].name);
        i += 1;
    }

    observations.sort((a, b) => {
        return a.order - b.order;
    })

    return observations;
}

export const PolySomnoView = ({
    observations
}: PolyProps) => {
    //const m_observations = convertIntoDoubleEntries(observations);
    const m_observations = sortObservations(observations);

    if (observations.length !== 0) {
        return (
            <table className={`poly-data-table`}>
                <TableRow attrib_1_title={m_observations[0].name} attrib_1_value={m_observations[0].value.toString()} attrib_1_unit={m_observations[0].unit}
                            attrib_2_title={m_observations[1].name} attrib_2_value={m_observations[1].value.toString()} attrib_2_unit={m_observations[1].unit}/>
                <TableRow attrib_1_title={m_observations[2].name} attrib_1_value={m_observations[2].value.toString()} attrib_1_unit={m_observations[2].unit}
                            attrib_2_title={m_observations[3].name} attrib_2_value={m_observations[3].value.toString()} attrib_2_unit={m_observations[3].unit}/>
                <TableRow attrib_1_title={m_observations[4].name} attrib_1_value={m_observations[4].value.toString()} attrib_1_unit={m_observations[4].unit}
                            attrib_2_title={m_observations[5].name} attrib_2_value={m_observations[5].value.toString()} attrib_2_unit={m_observations[5].unit}/>
                <TableRow attrib_1_title={m_observations[6].name} attrib_1_value={m_observations[6].value.toString()} attrib_1_unit={m_observations[6].unit}
                            attrib_2_title={m_observations[7].name} attrib_2_value={m_observations[7].value.toString()} attrib_2_unit={m_observations[7].unit}/>
                <TableRow attrib_1_title={m_observations[8].name} attrib_1_value={m_observations[8].value.toString()} attrib_1_unit={m_observations[8].unit}
                            attrib_2_title={m_observations[9].name} attrib_2_value={m_observations[9].value.toString()} attrib_2_unit={m_observations[9].unit}/>
                <TableRow attrib_1_title={m_observations[10].name} attrib_1_value={m_observations[10].value.toString()} attrib_1_unit={m_observations[10].unit}
                            attrib_2_title={m_observations[11].name} attrib_2_value={m_observations[11].value.toString()} attrib_2_unit={m_observations[11].unit}/>
            </table>
        )
    } else {
        return (null)
    }
}

interface PolyProps {
    observations: IObservEntry[]
}

interface DiagProps {
    diag_discharge: IDiag,
    diag_admission: IDiag
}

interface RowPros {
    attrib_1_title: string,
    attrib_1_value: string,
    attrib_1_unit: string,
    attrib_2_title?: string,
    attrib_2_value?: string,
    attrib_2_unit?: string
}