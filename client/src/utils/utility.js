function getRandomColor(count) {
    return Array.from({ length: count }, () => `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`);
}

function countElements(array) {
    // Create an empty object to store counts
    const counts = {};

    // Loop through the array
    array.forEach(item => {
        // If the item is not in the counts object, initialize its count to 1
        // Otherwise, increment its count by 1
        counts[item.fir_stage] = (counts[item.fir_stage] || 0) + 1;
    });

    // Return the counts object
    return counts;
}
function getClearanceRate(array) {
    // Create an empty object to store counts
    let activeCaseCount=0;
    let closedCaseCount=0;
    const activeCase= ["Under Investigation"]
    // Loop through the array
    array.forEach(item => {
        // If the item is not in the counts object, initialize its count to 1
        // Otherwise, increment its count by 1
        if(activeCase.includes(item.fir_stage)){
            activeCaseCount = activeCaseCount + 1; 
        }else {
            closedCaseCount = closedCaseCount  + 1;
        }
    });
    const clearanceRate =Math.round((closedCaseCount / (activeCaseCount + closedCaseCount )) * 100)
    // Return the counts object
    return {activeCaseCount,closedCaseCount, clearanceRate}
}

function getconvictionRate(data){
    if(!data)
        return 0
    if (data.length < 1)
        return 0
    const dataLength = data.length
    const sum = data.reduce(
        (accumulator, currentValue) => accumulator + (currentValue.conviction_count/currentValue.accused_chargesheeted_count),
        0
      );
    const convictionRate = Math.round((sum/dataLength) * 100)
    return convictionRate > 100 ? 100 : convictionRate
}
const policeRanks = {
    "Dy.SP": "Deputy Superintendent of Police",
    "ASI": "Assistant Sub-Inspector",
    "PI": "Police Inspector",
    "PSI": "Police Sub-Inspector",
    "HC" : "Head Constable"
};
function formatString(str) {
    // Remove underscores and replace them with spaces
    let result = str.split('_').join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Add spaces before uppercase letters (not preceded by a space)
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  
    return result;
  }

function getCrimeHotspots(data){
    const clean = s => ['Dist','Sub-Dist','Region','TOWN','City','PS'].reduce((r,sub) => r.replace(new RegExp(sub,'g'),''), s).trim();
    let newobj={}
        Object.values(data).forEach(item=>{
            if(!newobj[item.beat_name]?.crimeCount){
                newobj[item.beat_name]={...item,
                    crimeCount : (newobj[item.beat_name]?.crimeCount || 0)+ 1,
                    location: `${clean(item.village_area_name)}, ${clean(item.district)}, India`,
                }
            }
            else {
                newobj[item.beat_name]={...newobj[item.beat_name],crimeCount : (newobj[item.beat_name]?.crimeCount || 0)+ 1}
            }
        })
    return newobj
}
const smapleFirValues = {
    district: 'Bengaluru City',
    UnitName: 'East Zone Women PS',
    FirNo: '0001/2016',
    RI: '1',
    year: '2016',
    Month: '1',
    Offence_From_Date: '00:00.0',
    Offence_To_Date: '00:00.0',
    FIR_Reg_DateTime: '10:00.0',
    Fir_Date: '07-13-2004',
    FIR_Type: 'Non Heinous',
    fir_stage: 'Pending Trial',
    Complaint_Mode: 'Written',
    CrimeGroup_Name: 'CRUELTY BY HUSBAND',
    CrimeHead_Name: 'CRUELTY BY HUSBAND',
    Latitude: '13.01528',
    Longitude: '77.390757',
    ActSection: 'IPC 1860 U/s: 498A,506',
    IOName: 'ANJUMALA T NAYAK (Dy.SP)',
    KGID: '1841136',
    IOAssignment: 'NaN',
    Internal_IO: '200045',
    place_of_offence: 'NO 5TH MAIN 1ST CROSS SPANDANA LAYOUT NEXT MOHREE, NO 5TH MAIN 1ST CROSS SPANDANA LAYOUT NEXT MOHREE',
    distance_from_ps: 'TOWORDS EAST 10 KM',
    beat_name: 'EAST DIVISION 2',
    village_area_name: 'BOWRING HOSPITAL',
    male: '2123',
    female: '1',
    boy: '0',
    girl: '0',
    age_0: '0',
    victim_count: '0',
    accused_count: '1',
    arrested_male: '1',
    arrested_female: '0',
    arrested_count_no: '1',
    accused_chargesheeted_count: '1',
    conviction_count: '0',
    fir_id: '2016000001',
    unit_id: '1978',
    crime_no: '10443100000000000'
  }
  
const config = () => ({
    headers: { jwt_token: localStorage.getItem("token") }
})

export {getRandomColor,countElements,policeRanks,formatString,smapleFirValues,getClearanceRate,getconvictionRate,config,getCrimeHotspots}