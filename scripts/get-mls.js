// run this in the console on page
// https://en.wikipedia.org/wiki/Major_League_Soccer#Clubs

var getLocation = function (title) {
  // await fetch(url);
  var url = new URL("https://en.wikipedia.org/w/api.php");

  return new Promise(async (resolve, reject) => {
    const params = {
      action: "query",
      prop: "coordinates",
      titles: title,
      format: "json",
      origin: "*",
    };
    // https://github.com/github/fetch/issues/256#issuecomment-379196019
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    const results = await fetch(url);
    const jsonResults = await results.json();

    const key = Object.keys(jsonResults.query.pages)[0];
    const resObject = jsonResults.query.pages[key];
    if (resObject.hasOwnProperty("coordinates")) {
      resolve(resObject.coordinates[0]);
    } else {
      console.log(
        "issue!",
        key,
        title,
        " THIS SHOULD HAVE coordinates property:",
        resObject
      );
      resolve(false);
    }
  });
};

var getWebsite = function (title) {
  // await fetch(url);
  var url = new URL("https://en.wikipedia.org/api/rest_v1/page/html/" + title);

  return new Promise(async (resolve, reject) => {
    const results = await fetch(url);
    const textResults = await results.text();

    const parts = textResults.split(
      '<h2 id="External_links">External links</h2>'
    );
    if (parts.length > 1) {
      const parts2 = parts[1].split('<a rel="mw:ExtLink nofollow" href="');
      const parts3 = parts2[1].split('"');
      var u = new URL(parts3[0]);
      resolve(u.href);
    } else {
      // else:
      console.error("error in parsing", title);
      resolve(false);
    }
  });
};

var getLogo = function (title) {
  return new Promise((resolve, reject) => {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${title}`)
      .then((response) => response.text())
      .then((result) => {
        let firstSrc = result.indexOf("src");
        while (result[firstSrc + 5] != "/") {
          firstSrc = result.indexOf("src", firstSrc + 1);
        }
        let firstUrlString = result.indexOf("/", firstSrc);
        let tempUrl = "";
        while (result[firstUrlString] != '"') {
          tempUrl += result[firstUrlString];
          firstUrlString++;
        }
        resolve(tempUrl);
      });
  });
};

const results = $(".wikitable")
  .first()
  .find("tr")
  .get()
  .map(async function (tr) {
    console.log("tr", tr);
    if ($(tr).find("td,th").eq(0).find("a").text()) {
      const first = $(tr).find("td,th").eq(0).find("a").eq(0).text();

      console.log("first", first);
      let baseIndex = 0;
      if (first.includes("Western") || first.includes("Eastern")) {
        baseIndex = 1;
      }

      console.log("baseindex", baseIndex);

      var stadiumLink = $(tr)
        .find("td,th")
        .eq(2 + baseIndex)
        .find("a")
        .eq(0)
        .attr("href");
      console.log("stadiumLink", stadiumLink);
      var location = await getLocation(
        decodeURIComponent(stadiumLink.replace("/wiki/", ""))
      );

      var teamLink = $(tr)
        .find("td,th")
        .eq(0 + baseIndex)
        .find("a")
        .eq(0)
        .attr("href");
      var website = await getWebsite(
        decodeURIComponent(teamLink.replace("/wiki/", ""))
      );
      var logoUrl = await getLogo(
        decodeURIComponent(teamLink.replace("/wiki/", ""))
      );

      if (location) {
        console.log("location:", location);

        const name = $(tr)
          .find("td,th")
          .eq(0 + baseIndex)
          .find("a")
          .eq(0)
          .text();
        console.log("name", name);
        const city = $(tr)
          .find("td,th")
          .eq(1 + baseIndex)
          .find("a")
          .eq(0)
          .text()
          .split(",")[0]
          .trim();
        console.log("city", city);
        const state = $(tr)
          .find("td,th")
          .eq(1 + baseIndex)
          .find("a")
          .eq(0)
          .text()
          .split(",")[1]
          .trim();
        console.log("state", state);
        const lat = location.lat;
        const lon = location.lon;
        const stadium = $(tr)
          .find("td,th")
          .eq(2 + baseIndex)
          .find("a")
          .eq(0)
          .text();
        console.log("stadium", stadium);
        const capacity = $(tr)
          .find("td,th")
          .eq(3 + baseIndex)
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .replace(",", "")
          .trim();
        console.log("cap", capacity);

        return [
          name, // team name
          city, // city
          state, // state
          lat, // latitude
          lon, // longitude
          stadium, // stadium
          capacity, // stadium_capacity,
          $(tr)
            .find("td,th")
            .eq(4 + baseIndex)
            .text()
            .trim(), // joined,
          $(tr)
            .find("td,th")
            .eq(5 + baseIndex)
            .find("a")
            .eq(0)
            .text()
            .trim(), // head_coach
          website, // url
          `https://en.wikipedia.org${teamLink}`, // wikipedia_url
          `https:${logoUrl}`,
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

let retString =
  "team,city,state,latitude,longitude,stadium,stadium_capacity,joined,head_coach,url,wikipedia_url,logo_url";
r.forEach((arr) => {
  if (arr.length > 0) {
    retString = `${retString}\n${arr.join(",")}`;
  }
});
console.log(retString);
