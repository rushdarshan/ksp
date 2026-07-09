import pandas as pd
import numpy as np
from faker import Faker
import random
import os
from datetime import datetime, timedelta

faker = Faker('en_IN')
np.random.seed(42)
random.seed(42)

out_dir = "synthetic_data"
os.makedirs(out_dir, exist_ok=True)

# 1. State
state_data = pd.DataFrame([{"StateID": 1, "StateName": "Karnataka", "NationalityID": 1, "Active": 1}])
state_data.to_csv(f"{out_dir}/1_State.csv", index=False)

# 2. District
districts = ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi", 
             "Kalaburagi", "Ballari", "Shivamogga", "Tumakuru", "Vijayapura"]
district_data = pd.DataFrame([{"DistrictID": i+1, "DistrictName": d, "StateID": 1, "Active": 1} for i, d in enumerate(districts)])
district_data.to_csv(f"{out_dir}/2_District.csv", index=False)

# 3. UnitType
unit_type_data = pd.DataFrame([
    {"UnitTypeID": 1, "UnitTypeName": "Police Station", "CityDistState": "City", "Hierarchy": 3, "Active": 1}
])
unit_type_data.to_csv(f"{out_dir}/3_UnitType.csv", index=False)

# 4. Unit (Police Stations)
units = []
unit_id = 1
for _, dist in district_data.iterrows():
    for j in range(3):  # 3 stations per district
        units.append({
            "UnitID": unit_id, "UnitName": f"{dist['DistrictName']} PS {j+1}", "TypeID": 1,
            "ParentUnit": None, "NationalityID": 1, "StateID": 1, "DistrictID": dist['DistrictID'], "Active": 1
        })
        unit_id += 1
unit_data = pd.DataFrame(units)
unit_data.to_csv(f"{out_dir}/4_Unit.csv", index=False)

# 5. Rank
rank_data = pd.DataFrame([
    {"RankID": 1, "RankName": "Inspector", "Hierarchy": 2, "Active": 1},
    {"RankID": 2, "RankName": "Sub-Inspector", "Hierarchy": 3, "Active": 1}
])
rank_data.to_csv(f"{out_dir}/5_Rank.csv", index=False)

# 6. Designation
desig_data = pd.DataFrame([
    {"DesignationID": 1, "DesignationName": "SHO", "Active": 1, "SortOrder": 1},
    {"DesignationID": 2, "DesignationName": "Investigating Officer", "Active": 1, "SortOrder": 2}
])
desig_data.to_csv(f"{out_dir}/6_Designation.csv", index=False)

# 7. Employee
emps = []
for _, unit in unit_data.iterrows():
    emps.append({
        "EmployeeID": unit['UnitID'], "DistrictID": unit['DistrictID'], "UnitID": unit['UnitID'],
        "RankID": 1, "DesignationID": 1, "KGID": f"KG{faker.random_number(digits=6)}",
        "FirstName": faker.name(), "EmployeeDOB": faker.date_of_birth(minimum_age=30, maximum_age=55),
        "GenderID": 1, "BloodGroupID": 1, "PhysicallyChallenged": 0, "AppointmentDate": faker.date_this_century()
    })
emp_data = pd.DataFrame(emps)
emp_data.to_csv(f"{out_dir}/7_Employee.csv", index=False)

# 8. CaseCategory
case_cat_data = pd.DataFrame([{"CaseCategoryID": 1, "LookupValue": "FIR"}])
case_cat_data.to_csv(f"{out_dir}/8_CaseCategory.csv", index=False)

# 9. GravityOffence
gravity_data = pd.DataFrame([
    {"GravityOffenceID": 1, "LookupValue": "Heinous"},
    {"GravityOffenceID": 2, "LookupValue": "Non-Heinous"}
])
gravity_data.to_csv(f"{out_dir}/9_GravityOffence.csv", index=False)

# 10. CrimeHead
crime_head_data = pd.DataFrame([
    {"CrimeHeadID": 1, "CrimeGroupName": "Crimes Against Body", "Active": 1},
    {"CrimeHeadID": 2, "CrimeGroupName": "Property Crimes", "Active": 1}
])
crime_head_data.to_csv(f"{out_dir}/10_CrimeHead.csv", index=False)

# 11. CrimeSubHead
crime_sub_data = pd.DataFrame([
    {"CrimeSubHeadID": 1, "CrimeHeadID": 1, "CrimeHeadName": "Murder", "SeqID": 1},
    {"CrimeSubHeadID": 2, "CrimeHeadID": 2, "CrimeHeadName": "Robbery", "SeqID": 2}
])
crime_sub_data.to_csv(f"{out_dir}/11_CrimeSubHead.csv", index=False)

# 12. Act
act_data = pd.DataFrame([{"ActCode": "IPC", "ActDescription": "Indian Penal Code", "ShortName": "IPC", "Active": 1}])
act_data.to_csv(f"{out_dir}/12_Act.csv", index=False)

# 13. Section
section_data = pd.DataFrame([
    {"ActCode": "IPC", "SectionCode": "302", "SectionDescription": "Murder", "Active": 1},
    {"ActCode": "IPC", "SectionCode": "392", "SectionDescription": "Robbery", "Active": 1}
])
section_data.to_csv(f"{out_dir}/13_Section.csv", index=False)

# 14. CrimeHeadActSection
chas_data = pd.DataFrame([
    {"CrimeHeadID": 1, "ActCode": "IPC", "SectionCode": "302"},
    {"CrimeHeadID": 2, "ActCode": "IPC", "SectionCode": "392"}
])
chas_data.to_csv(f"{out_dir}/14_CrimeHeadActSection.csv", index=False)

# 15. CaseStatusMaster
status_data = pd.DataFrame([
    {"CaseStatusID": 1, "CaseStatusName": "Under Investigation"},
    {"CaseStatusID": 2, "CaseStatusName": "Charge Sheeted"}
])
status_data.to_csv(f"{out_dir}/15_CaseStatusMaster.csv", index=False)

# 16. Court
courts = []
for _, dist in district_data.iterrows():
    courts.append({
        "CourtID": dist['DistrictID'], "CourtName": f"District Court {dist['DistrictName']}",
        "DistrictID": dist['DistrictID'], "StateID": 1, "Active": 1
    })
court_data = pd.DataFrame(courts)
court_data.to_csv(f"{out_dir}/16_Court.csv", index=False)

# 17, 18, 19. Occupation, Religion, Caste
pd.DataFrame([{"OccupationID": 1, "OccupationName": "Private"}]).to_csv(f"{out_dir}/17_OccupationMaster.csv", index=False)
pd.DataFrame([{"ReligionID": 1, "ReligionName": "Hindu"}]).to_csv(f"{out_dir}/18_ReligionMaster.csv", index=False)
pd.DataFrame([{"caste_master_id": 1, "caste_master_name": "General"}]).to_csv(f"{out_dir}/19_CasteMaster.csv", index=False)

# 20. CaseMaster
firs = []
for i in range(1, 501):
    dist_idx = np.random.choice(len(district_data), p=[0.2, 0.15, 0.1, 0.1, 0.1, 0.1, 0.05, 0.05, 0.05, 0.1])
    dist = district_data.iloc[dist_idx]
    
    # Intentionally clustering locations around dist lat/long
    base_lat = 12.9716 if dist['DistrictName'] == "Bengaluru Urban" else 12.0 + dist_idx
    base_lon = 77.5946 if dist['DistrictName'] == "Bengaluru Urban" else 76.0 + dist_idx
    
    ps = unit_data[unit_data['DistrictID'] == dist['DistrictID']].iloc[0]
    crime_no = f"1044{ps['UnitID']:04d}2026{i:05d}"
    
    head_id = np.random.choice([1, 2])
    date = faker.date_time_between(start_date="-1y", end_date="now")
    
    firs.append({
        "CaseMasterID": i, "CrimeNo": crime_no, "CaseNo": crime_no[-9:], "CrimeRegisteredDate": date.date(),
        "PolicePersonID": ps['UnitID'], "PoliceStationID": ps['UnitID'], "CaseCategoryID": 1,
        "GravityOffenceID": 1 if head_id == 1 else 2, "CrimeMajorHeadID": head_id, "CrimeMinorHeadID": head_id,
        "CaseStatusID": 1, "CourtID": dist['DistrictID'], "IncidentFromDate": date, "IncidentToDate": date + timedelta(hours=2),
        "InfoReceivedPSDate": date + timedelta(hours=3), 
        "latitude": base_lat + random.uniform(-0.05, 0.05), "longitude": base_lon + random.uniform(-0.05, 0.05),
        "BriefFacts": f"Incident reported at {dist['DistrictName']} hotspot."
    })
case_data = pd.DataFrame(firs)
case_data.to_csv(f"{out_dir}/20_CaseMaster.csv", index=False)

# 21. ComplainantDetails
comps = []
for i in range(1, 501):
    comps.append({
        "ComplainantID": i, "CaseMasterID": i, "ComplainantName": faker.name(), "AgeYear": random.randint(20, 60),
        "OccupationID": 1, "ReligionID": 1, "CasteID": 1, "GenderID": random.choice([1, 2])
    })
pd.DataFrame(comps).to_csv(f"{out_dir}/21_ComplainantDetails.csv", index=False)

# 22. Victim
vics = []
for i in range(1, 501):
    vics.append({
        "VictimMasterID": i, "CaseMasterID": i, "VictimName": faker.name(), "AgeYear": random.randint(20, 60),
        "GenderID": random.choice([1, 2]), "VictimPolice": "0"
    })
pd.DataFrame(vics).to_csv(f"{out_dir}/22_Victim.csv", index=False)

# 23. Accused
accs = []
# Create a few repeat offenders for the network graph
offender_pool = [faker.name() for _ in range(50)]
for i in range(1, 501):
    accs.append({
        "AccusedMasterID": i, "CaseMasterID": i, "AccusedName": random.choice(offender_pool) if random.random() < 0.3 else faker.name(), 
        "AgeYear": random.randint(18, 50), "GenderID": random.choice([1, 2]), "PersonID": "A1"
    })
pd.DataFrame(accs).to_csv(f"{out_dir}/23_Accused.csv", index=False)

# 24. ActSectionAssociation
asa = []
for i in range(1, 501):
    head = case_data.loc[case_data['CaseMasterID'] == i, 'CrimeMajorHeadID'].values[0]
    sec = "302" if head == 1 else "392"
    asa.append({
        "CaseMasterID": i, "ActID": "IPC", "SectionID": sec, "ActOrderID": 1, "SectionOrderID": 1
    })
pd.DataFrame(asa).to_csv(f"{out_dir}/24_ActSectionAssociation.csv", index=False)

# 25, 26 empty for now
pd.DataFrame(columns=["ArrestSurrenderID", "CaseMasterID", "ArrestSurrenderTypeID", "ArrestSurrenderDate", "ArrestSurrenderStateId", "ArrestSurrenderDistrictId", "PoliceStationID", "IOID", "CourtID", "AccusedMasterID", "IsAccused", "IsComplainantAccused"]).to_csv(f"{out_dir}/25_ArrestSurrender.csv", index=False)
pd.DataFrame(columns=["CSID", "CaseMasterID", "csdate", "cstype", "PolicePersonID"]).to_csv(f"{out_dir}/26_ChargesheetDetails.csv", index=False)
print("Generated 26 CSVs in synthetic_data/")
