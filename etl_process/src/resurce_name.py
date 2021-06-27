from enum import Enum

class ResourceName(Enum):
    PATIENT = 'Patient'
    ENCOUNTER = 'Encounter'
    OBSERVATION = 'Observation' 
    PROCEDURE = 'Procedure' 
    CONDITION = 'Condition' 