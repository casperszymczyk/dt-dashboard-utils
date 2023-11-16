  // optional import of sdk modules
import { eventsClient } from "@dynatrace-sdk/client-classic-environment-v2";
import { units } from "@dynatrace-sdk/units"
export default async function () {
  const eventList: any[] = [];
  let eventsResponse = await importEvents();
  eventList.push(...eventsResponse.events.map(i => i));
  
  while (eventsResponse.nextPageKey){
  eventsResponse = await importEventsNextPage(eventsResponse.nextPageKey);
  eventList.push(...eventsResponse.events.map(i => i));
  }

function importEvents() {
let events = eventsClient.getEvents({
  eventSelector: 'frequentEvent(true),suppressAlert(false)',
  entitySelector: 'type("HOST")',
  from: $dt_timeframe_from,
  to: $dt_timeframe_to
});
  return events;
}

function importEventsNextPage(_nextPageKey) {
let events = eventsClient.getEvents({
  nextPageKey: _nextPageKey
});
  return events;
}

  var jsonText = [];

  for (var key in eventList){
    let eventLength = (eventList[key]['endTime'] - eventList[key]['startTime'])/1000;
    let unit = '';
    if (eventLength < 0){
      eventLength = 'N/A';
    } 
    if (eventLength > 60){
      eventLength = eventLength / 60;
    }
    
    let serviceName;
    let osName;
    let title = eventList[key]['title'];
    let host = eventList[key]['entityId']['name'];
    let zones = '';
    let time = new Date(eventList[key]['startTime']).toLocaleString("en-GB");
      
    for (var zone in eventList[key]['managementZones']){
    if (!(eventList[key]['managementZones'][zone]['name'].includes('GENERIC'))){
    zones += eventList[key]['managementZones'][zone]['name'] +', '
      }
    }
    
    for (var tag in eventList[key]['entityTags']){
      if (eventList[key]['entityTags'][tag]['key'] == "Service"){
        serviceName = eventList[key]['entityTags'][tag]['value']
      } else if (eventList[key]['entityTags'][tag]['key'] == "Windows Version" || eventList[key]['entityTags'][tag]['key'] == "Unix Version" ){
        osName = eventList[key]['entityTags'][tag]['value']
      }
    }
    
    var myObj = {
      startTime: time,
      hostName: host,
      eventTitle: title,
      lengthMins: eventLength,
      managementZones: zones,
      os: osName
    }
    jsonText.push(myObj);
  }

return jsonText;
}
