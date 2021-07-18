import { IObserv } from './utils'

export const DiagnosisRow = ({
    diag_code_discharge,
    diag_code_admission,
    diag_name_admission,
    diag_name_discharge
    
}: DiagProps) => {

    return (
        <div className={`details-view__diag-row`}>
            <b>Aufnahme:</b>
            <div>
                {diag_name_admission + " (" + diag_code_admission + ")"}
            </div>
            <b>Entlassung:</b>
            <div>
                {diag_name_discharge + " (" + diag_code_discharge + ")"}
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
            <td className={`poly-data-table-td`}>{attrib_1_title}</td>
            <td className={`poly-data-table-td`}>{attrib_1_value}</td>
            <td className={`poly-data-table-td`}>{attrib_1_unit}</td>
            <td className={`poly-data-table-td`}>{attrib_2_title}</td>
            <td className={`poly-data-table-td`}>{attrib_2_value}</td>
            <td className={`poly-data-table-td`}>{attrib_2_unit}</td>
        </tr>

    )
}

export const PolySomnoView = ({
    observations
}: PolyProps) => {

    const m_observations = observations;

    return (
        <table className={`poly-data-table`}>
            <TableRow attrib_1_title="-" attrib_1_value="-" attrib_1_unit="-"
                        attrib_2_title="-" attrib_2_value="-" attrib_2_unit="-"/>
            <TableRow attrib_1_title="-" attrib_1_value="-" attrib_1_unit="-"
                        attrib_2_title="-" attrib_2_value="-" attrib_2_unit="-"/>
            <TableRow attrib_1_title="-" attrib_1_value="-" attrib_1_unit="-"
                        attrib_2_title="-" attrib_2_value="-" attrib_2_unit="-"/>
            <TableRow attrib_1_title="-" attrib_1_value="-" attrib_1_unit="-"
                        attrib_2_title="-" attrib_2_value="-" attrib_2_unit="-"/>
        </table>
    )
}

interface PolyProps {
    observations?: IObserv[]
}

interface DiagProps {
    diag_code_discharge: string,
    diag_name_discharge: string,
    diag_code_admission: string,
    diag_name_admission: string
}

interface RowPros {
    attrib_1_title: string,
    attrib_1_value: string,
    attrib_1_unit: string,
    attrib_2_title: string,
    attrib_2_value: string,
    attrib_2_unit: string
}