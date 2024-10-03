// run this in the console on page
// https://en.wikipedia.org/wiki/USL_Championship#Teams

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
    // console.log("resObject", resObject);
    if (resObject.hasOwnProperty("coordinates")) {
      resolve(resObject.coordinates[0]);
    } else {
      console.log("issue!", key, title);
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

var getAllImages = function (htmlText) {
  var re = /<img[^>]+src="\/\/([^">]+)/g;

  // const results = re.exec(htmlText);
  const results = htmlText.matchAll(re);
  return Array.from(results, (m) => `https://${m[1]}`);
};

var notProhibited = function (url) {
  const prohibitedImages = [
    "50px-Question_book-new.svg.png",
    "Wiki_letter_w.svg.png",
  ];

  const match = prohibitedImages.find((x) => url.indexOf(x) > -1);

  if (match) {
    return false;
  } else {
    return true;
  }
};

var getLogo = function (title) {
  return new Promise((resolve, reject) => {
    fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${title}`)
      .then((response) => response.text())
      .then((result) => {
        const allImages = getAllImages(result);
        // console.log("allImages", allImages);

        const retImage = allImages.find((x) => notProhibited(x));
        // let firstSrc = result.indexOf("src");
        // while (result[firstSrc + 5] != "/") {
        //   firstSrc = result.indexOf("src", firstSrc + 1);
        // }
        // let firstUrlString = result.indexOf("/", firstSrc);
        // let tempUrl = "";
        // while (result[firstUrlString] != '"') {
        //   tempUrl += result[firstUrlString];
        //   firstUrlString++;
        // }
        resolve(retImage);
      });
  });
};

const results = $(".wikitable")
  .eq(1)
  .find("tr")
  .get()
  .map(async function (tr) {
    if ($(tr).find("td,th").eq(0).find("a").text()) {
      const first = $(tr).find("td,th").eq(0).find("a").eq(0).text();

      console.log("first", first);
      let baseIndex = 0;
      if (first.includes("Conference")) {
        baseIndex = 1;
      }

      var stadiumLink = $(tr)
        .find("td,th")
        .eq(2 + baseIndex)
        .find("a")
        .eq(0)
        .attr("href");
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
        // length: $(tr).find('td').length
        let retArr = [
          $(tr)
            .find("td,th")
            .eq(0 + baseIndex)
            .find("a")
            .eq(0)
            .text(), // team name
          $(tr)
            .find("td,th")
            .eq(1 + baseIndex)
            .find("a")
            .eq(0)
            .text()
            .split(",")[0]
            .trim(), // city
          $(tr)
            .find("td,th")
            .eq(1 + baseIndex)
            .find("a")
            .eq(0)
            .text()
            .split(",")[1]
            .trim(), // state
          location.lat, // latitude
          location.lon, // longitude
          $(tr)
            .find("td,th")
            .eq(2 + baseIndex)
            .find("a")
            .eq(0)
            .text(), // stadium
          $(tr)
            .find("td,th")
            .eq(3 + baseIndex)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .replace(",", "")
            .trim(), // stadium_capacity,
        ];

        if ($(tr).find("td,th").length === 8) {
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(4 + baseIndex)
              .text()
              .trim()
          ); // founded
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(5 + baseIndex)
              .text()
              .trim()
          ); // joined
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(6 + baseIndex)
              .find("a")
              .eq(1)
              .text()
              .trim()
          ); // head_coach
          // retArr.push($(tr).find("td,th").eq(7 + baseIndex).text().trim()); // mls_affiliate
        } else {
          // assume the "founded" and "joined" are merged cells
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(4 + baseIndex)
              .text()
              .trim()
          ); // founded
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(4 + baseIndex)
              .text()
              .trim()
          ); // joined
          retArr.push(
            $(tr)
              .find("td,th")
              .eq(5 + baseIndex)
              .find("a")
              .eq(1)
              .text()
              .trim()
          ); // head_coach
          // retArr.push($(tr).find("td,th").eq(6 + baseIndex).text().trim()); // mls_affiliate
        }

        retArr.push(website); // url
        retArr.push(`https://en.wikipedia.org${teamLink}`); // wikipedia_url
        retArr.push(`${logoUrl}`);
        return retArr;
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
  "team,city,state,latitude,longitude,stadium,stadium_capacity,year_founded,year_joined,head_coach,url,wikipedia_url,logo_url";
r.forEach((arr) => {
  if (arr.length > 0) {
    retString = `${retString}\n${arr.join(",")}`;
  }
});
console.log(retString);
