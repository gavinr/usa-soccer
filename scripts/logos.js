// Run this in browser console

// Format of input data
// const data = [
//     "Atlanta United FC",
//     "CF Montréal",
//     "Chicago Fire FC",
//     "Columbus Crew",
//     "D.C. United",
//     "FC Cincinnati",
//     "Inter Miami",
//     "Nashville SC",
//     "LA Galaxy",
//     "New England Revolution",
//     "New York City",
//     "New York Red Bulls",
//     "Orlando City SC",
//     "Philadelphia Union",
//     "Toronto FC",
//     "Austin FC",
//     "Colorado Rapids",
//     "FC Dallas",
//     "Houston Dynamo FC",
//     "Los Angeles FC",
//     "Minnesota United FC",
//     "Portland Timbers",
//     "Real Salt Lake",
//     "San Jose Earthquakes",
//     "Seattle Sounders FC",
//     "Sporting Kansas City",
//     "Vancouver Whitecaps FC",
// ];

const getLogoUrl = (titlesArray) =>
    Promise.all(titlesArray).then((titles) => {
        titles.forEach((title) => {
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
                    console.log(`${title}: ${tempUrl}`);
                });
        });
    });

getLogoUrl(data);
