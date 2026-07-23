const CHART_COLORS = ['#171717', '#c45f3b', '#4b79a8', '#7a8f63', '#b58b35', '#8a6f9e'];

function asArray(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    const candidates = [value.data, value.items, value.records, value.results, value.cases, value.officers];
    return candidates.find(Array.isArray) || [];
}

function getRandomColor(count) {
    return Array.from({ length: count }, (_, index) => CHART_COLORS[index % CHART_COLORS.length]);
}

function countElements(array) {
    // Create an empty object to store counts
    const counts = {};

    // Loop through the array
    asArray(array).forEach(item => {
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
    asArray(array).forEach(item => {
        // If the item is not in the counts object, initialize its count to 1
        // Otherwise, increment its count by 1
        if(activeCase.includes(item.fir_stage)){
            activeCaseCount = activeCaseCount + 1; 
        }else {
            closedCaseCount = closedCaseCount  + 1;
        }
    });
    const total = activeCaseCount + closedCaseCount;
    const clearanceRate = total ? Math.round((closedCaseCount / total) * 100) : 0;
    // Return the counts object
    return {activeCaseCount,closedCaseCount, clearanceRate}
}

function getconvictionRate(data){
    const records = asArray(data);
    if (records.length < 1) return 0;
    const sum = records.reduce(
        (accumulator, currentValue) => {
          const charged = Number(currentValue.accused_chargesheeted_count) || 0;
          const convicted = Number(currentValue.conviction_count) || 0;
          return accumulator + (charged ? convicted / charged : 0);
        },
        0
      );
    const convictionRate = Math.round((sum/records.length) * 100)
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
    if (str === null || str === undefined) return '';
    // Remove underscores and replace them with spaces
    let result = String(str).split('_').join(' ');
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Add spaces before uppercase letters (not preceded by a space)
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  
    return result;
  }

function getCrimeHotspots(data){
    const clean = s => ['Dist','Sub-Dist','Region','TOWN','City','PS'].reduce((r,sub) => r.replace(new RegExp(sub,'g'),''), s).trim();
    let newobj={}
        asArray(data).forEach(item=>{
            if (!item?.beat_name) return;
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
    UnitName: 'Brigade Road PS',
    FirNo: 'KSP-2026-0142',
    RI: '1',
    year: '2026',
    Month: '3',
    Offence_From_Date: '2026-03-15T20:25:00+05:30',
    Offence_To_Date: '2026-03-15T20:35:00+05:30',
    FIR_Reg_DateTime: '2026-03-15T23:58:00+05:30',
    Fir_Date: '2026-03-15',
    FIR_Type: 'Heinous',
    fir_stage: 'Under Investigation',
    Complaint_Mode: 'Online',
    CrimeGroup_Name: 'Robbery',
    CrimeHead_Name: 'Robbery',
    Latitude: '12.9762',
    Longitude: '77.6033',
    ActSection: 'BNS 2023: Sections 304, 309 and 3(5) pending legal review',
    IOName: 'PI DHARMENDRA',
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

export {asArray,getRandomColor,countElements,policeRanks,formatString,smapleFirValues,getClearanceRate,getconvictionRate,config,getCrimeHotspots}
