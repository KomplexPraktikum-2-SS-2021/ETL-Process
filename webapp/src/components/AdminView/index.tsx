import './index.css';
import { Patient, HumanName } from 'fhir/r4';
import { convertToGermanDateFormat } from 'components/DetailsView/utils';
import { transformIntoGenderSymbol } from 'utils';



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
            return convertToGermanDateFormat(patient.birthDate);
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