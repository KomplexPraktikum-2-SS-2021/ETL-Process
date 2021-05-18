def create_encounter_dict(df_row):
    this_dict = {
        "resourceType" : "Encounter",
        "identifier" : [{
            "value" : str(df_row.id)
        }],
        "status" : "finished",
        "class" : {
            "system" : "http://terminology.h17.org/CodeSystem/v3-ActCode",
            "version" : "2018-08-12",
            "code" : "IMP"
        },
        "period" : {
            "start" : df_row.admission,
            "end" : df_row.discharge
        }
    }

    return this_dict


class JSON_Builder:

    def get_json_dict(self, table_str, df_row):
        json_dict = 0;

        if table_str == 'cases':
            json_dict = create_encounter_dict(df_row)

        return json_dict

