

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


interface DiagProps {
    diag_code_discharge: string,
    diag_name_discharge: string,
    diag_code_admission: string,
    diag_name_admission: string
}