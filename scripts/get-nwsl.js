// run this in the console on page 
// https://en.wikipedia.org/wiki/National_Women%27s_Soccer_League#Teams


var getLocation = function (title) {
  // await fetch(url);
  var url = new URL('https://en.wikipedia.org/w/api.php');
  
  return new Promise(async (resolve, reject) => {
    const params = {
      'action': 'query',
      'prop': 'coordinates',
      'titles': title,
      'format': 'json',
      'origin': '*'
    };
    // https://github.com/github/fetch/issues/256#issuecomment-379196019
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key])
    });

    const results = await fetch(url);
    const jsonResults = await results.json();

    const key = Object.keys(jsonResults.query.pages)[0];
    const resObject = jsonResults.query.pages[key];
    if(resObject.hasOwnProperty('coordinates')) {
      resolve(resObject.coordinates[0]);
    } else {
      console.log('issue!', key);
      resolve(false);
    }
    
  });
};


const results = $('.wikitable').first().find('tr').get().map(async function(tr) {
  if($(tr).find('td').eq(0).find('a').text()) {

    var stadiumLink = $(tr).find('td').eq(1).find('a').eq(0).attr('href');
    console.log('stadiumLink:', stadiumLink);
    if(stadiumLink) {
      var location = await getLocation(decodeURIComponent(stadiumLink.replace('/wiki/', '')))
    }

    if(location) {
      console.log('location', location);
      return [
        $(tr).find('td').eq(0).find('a').eq(0).text(), // team name
        $(tr).find('td').eq(3).find('a').eq(0).text().split(',')[0].trim(), // city
        $(tr).find('td').eq(3).find('a').eq(0).text().split(',')[1].trim(), // state
        location.lat, // latitude
        location.lon, // longitude
        $(tr).find('td').eq(1).find('a').eq(0).text(), // stadium
        $(tr).find('td').eq(2).text().replace(',','').trim(), // stadium_capacity,
        $(tr).find('td').eq(4).text().trim(), // founded,
        $(tr).find('td').eq(5).text().trim(), // joined,
        $(tr).find('td').eq(6).find('a').eq(0).text().trim(),// head_coach
      ];
    } else {

      return [];
    }
  } else {
    // title or something
    return [];
  }
});
const r = await Promise.all(results);

let retString = 'team,city,state,latitude,longitude,stadium,stadium_capacity,founded,joined,head_coach';
r.forEach((arr) => {
  if(arr.length > 0) {
    retString = `${retString}\n${arr.join(',')}`;
  } 
});
console.log(retString);