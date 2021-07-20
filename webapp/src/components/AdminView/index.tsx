import './index.css';
import { Patient, HumanName } from 'fhir/r4';


/**
 * returns the respective gender symbol as svg
 * @param gender of a patient 
 */
 export const transformIntoGenderSymbol = (gender?: string) => {
    
    const svg_width = "20";
    const svg_height = "20";
    const male_color = "blue";
    const female_color = "#c00";

    if (gender === "male") {
        return (
            <svg width={svg_width} height={svg_height} viewBox="0 15 30 10">
                <circle cx="15" cy="25" r="8"  stroke={male_color} strokeWidth="2" fill="none" />
                <line x1="19" x2="26" y1="17" y2="10" strokeWidth="2" stroke={male_color} />
                <line x1="27" x2="16" y1="9" y2="11" strokeWidth="2" stroke={male_color} />
                <line x1="27" x2="27" y1="9" y2="19" strokeWidth="2" stroke={male_color} />
            </svg>
        )
    } else if (gender === "female") {
        return (
            <svg width={svg_width} height={svg_height} viewBox="0 15 30 10">
                <circle cx="15" cy="15" r="8"  stroke={female_color} strokeWidth="2" fill="none" />
                <line x1="15" x2="15" y1="23" y2="33" strokeWidth="2" stroke={female_color} />
                <line x1="10" x2="20" y1="28" y2="28" strokeWidth="2" stroke={female_color} />
            </svg>
        )
    } else {
        console.log("gender is undefined");
        return (
            null
        )
    }
}

/*
const DataCol = (props: ColProps) => {
    const {elements} = props;

    return ( 
        <div className={`patient-view-administrative-col`}>
            {elements.map((element, i) => {
                return (<div>{element}</div>)
            })}
        </div>
    )
}
*/

const TableRow = (props: RowProps) => {
    let {attrib_name1, attrib_name2, attrib_value1, attrib_value2} = props;

    let isGenderAttrib = false;
    if (attrib_name2 === "gender" || attrib_name2 === "Geschlecht") {
        isGenderAttrib = true
    }

    if (isGenderAttrib) {
        return (
            <tr className={`border-less-tr`}>
                <td className={`attrib-title border-less-td`}>{attrib_name1}</td>
                <td className={`border-less-td`}>{attrib_value1}</td>
                <td className={`attrib-title border-less-td`}>{attrib_name2}</td>
                <td className={`border-less-td`}>{transformIntoGenderSymbol(attrib_value2)}</td>
            </tr>
    
        )
    } else {
        return (
            <tr className={`border-less-tr`}>
                <td className={`attrib-title border-less-td`}>{attrib_name1}</td>
                <td className={`border-less-td`}>{attrib_value1}</td>
                <td className={`attrib-title border-less-td`}>{attrib_name2}</td>
                <td className={`border-less-td`}>{attrib_value2}</td>
            </tr>
    
        )
    }
}

/*
export const PatientView = () => {
    const { id }: Params = useParams();

    const patient_object = {name: "Olaf", forename:"Olaf1", gender: "male", birthdate: "01.02.1997", address: "01069 Dresden Nürnberger Straße 14"}

    return (
        <div className={`patient-view-container`}>
            <div className={`patient-view`}>
                <h1>Patients View</h1>
                <div className={`patient-view-administrative-container`}>
                    <h2>Allgemeine Informationen</h2>
                    <div className={`patient-view-administrative-container`}>
                        <DataCol elements={["Name", "Geburtsdatum", "Wohnadresse"]} />
                        <DataCol elements={[patient_object.name, patient_object.birthdate, patient_object.address]} />
                        <DataCol elements={["Vorname", "Geschlecht"]} />
                        <DataCol elements={[patient_object.forename, patient_object.gender]} />
                    </div>
                </div>
            </div>
        </div>
    )
}*/

export const AdminView = ({patient}: AdminViewProps) => {

    function getExtension() {
        if (patient.extension) {
            if (patient.extension[0].valueAnnotation) {
                if (patient.extension[0].valueAnnotation.text === 'no follow-up available') {
                    return "nicht verfügbar"
                } else {
                    return patient.extension[0].valueAnnotation.text;
                }
            } else {
                return "";
            }
        } else {
            return "";
        }
    }
    console.log("Follow-up: ", getExtension());

    const getAddress = () => {
        if (patient.address) {
            const address_object = patient.address[0]
            return address_object.postalCode + ' ' + address_object.city + ', ' + address_object.line
        } else {
            return ""
        }
    }

    const getFamilyName = () => {
        if (patient.name) {
            const patient_name = patient.name[0]
            return patient_name.family
        } else {
            return ""
        }
    }

    const getName = () => {
        if (patient.name) {
            const patient_name = patient.name[0].given
            if (patient_name) {
                const patient_name_given = patient_name[0]
                return patient_name_given
            }
        } else {
            return ""
        }
    }

    const getGender = () => {
        if (patient.gender) {
            return patient.gender
        }
    }

    const getBirthdate = () => {
        if (patient.birthDate) {
            return patient.birthDate
        }
    }

    return (
        <div className={`patient-view-administrative-container`}>
            <div>
                <h2>Allgemeine Informationen</h2>
            </div>
            <table className={`patient-view-table-style`}>
                <TableRow attrib_name1={"Name"} attrib_name2={"Vorname"} attrib_value1={getFamilyName()} attrib_value2={getName()} />
                <TableRow attrib_name1={"Geburtsdatum"} attrib_name2={"Geschlecht"} attrib_value1={getBirthdate()} attrib_value2={getGender()} />
                <TableRow attrib_name1={"Wohnadresse"} attrib_value1={getAddress()} attrib_name2={"Nächster Termin"} attrib_value2={getExtension()}/>
            </table>
        </div>
    
    )
}
/*
interface AdminViewProps {
    name: string,
    forename: string,
    birthdate: string,
    gender: string,
    address: Address
}
*/

interface AdminViewProps {
    patient: Patient
}

interface RowProps {
    attrib_name1: string,
    attrib_value1?: string,
    attrib_name2?: string,
    attrib_value2?: string,
}