const tbody = document.querySelector("#stalker-table").children[1];
const loader = document.querySelector("#loader");

const table = [];

const handles = Array.from(
  new Set([
    "assali",
    "faridtsl",
    "adnaneaabbar",
    "AIT-RAMI",
    "hoffen",
    "Saachi",
    "sqrtminusone",
    "TheMenTaLisT7",
    "hamzabht18",
    "Lebannin",
    "modx5",
    "sato2000",
    "benyazidhamza",
    "am_Ine",
    "meedbek",
    "Amee",
    "Asaad27",
    "Smahox",
    "titro",
    "mosleh2020",
    "Mr.NickName",
  ])
);

const ranks = [
  {
    range: [0, 1200],
    color: "gray",
    mustSolvePercentage: [],
  },
  {
    range: [1200, 1400],
    color: "green",
    mustSolvePercentage: [20, 40, 20, 10, 0],
  },
  {
    range: [1400, 1600],
    color: "#03A89E",
    mustSolvePercentage: [10, 20, 40, 20, 10],
  },
  {
    range: [1600, 1900],
    color: "blue",
    mustSolvePercentage: [0, 10, 20, 40, 20],
  },
  {
    range: [1900, 4000],
    color: "#a0a",
    mustSolvePercentage: [0, 0, 10, 20, 40],
  },
];

const inRange = ([a, b], v) => a <= v && v < b;

const getRatingColor = (rating) => {
  return rating
    ? ranks.find(({ range }) => inRange(range, rating)).color
    : "black";
};

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const getSolvedAnalytics = (rating, maxRating, solved) => {
  const totalSolved = sum(solved);
  const rankAim = ranks.find(({ range }) => inRange(range, maxRating));
  const solvedAnalytics = solved.map((count, idx) => ({
    bgColor:
      (count / totalSolved) * 100 >= rankAim.mustSolvePercentage[idx]
        ? "rgba(0, 255, 0, 0.05)"
        : "rgba(255, 0, 0, 0.05)",
    count,
    percentage: (count / totalSolved) * 100,
  }));
  return {
    color: getRatingColor(rating),
    totalSolved,
    solvedAnalytics,
  };
};

const toTableRow = (handle, fullName, rating, maxRating, solved) => {
  const { color, totalSolved, solvedAnalytics } = getSolvedAnalytics(
    rating,
    maxRating,
    solved
  );
  const solvedAnalyticsHTML = solvedAnalytics
    .map(
      ({ bgColor, count, percentage }) =>
        `
          <td style="background-color: ${bgColor}">
            ${count} ~ (${percentage.toFixed(2)}%)
          </td>
        `
    )
    .join("");
  return `
    <tr>
      <th>
        <a style="color: ${color}" href="https://codeforces.com/profile/${handle}">${handle}</a>
      </th>
      <td>${fullName}</td>
      <td>${rating}</td>
      <td>${totalSolved}</td>
      ${solvedAnalyticsHTML}
    </tr>
  `;
};

const countSolvedInRange = (submissions, range) =>
  submissions.filter(
    ({ problem: { rating } }) => rating && inRange(range, rating)
  ).length;

const fetchJsonAndExec = (url, callback) =>
  fetch(url)
    .then((res) => res.json())
    .then(callback)
    .catch((err) => console.log(err));

const fetchInfo = (idx) =>
  setTimeout(
    () =>
      fetchJsonAndExec(
        `https://codeforces.com/api/user.info?handles=${handles[idx]}`,
        ({ result: [{ firstName, lastName, rating, maxRating }] }) =>
          fetchJsonAndExec(
            `https://codeforces.com/api/user.status?handle=${handles[idx]}`,
            ({ result }) => {
              result = result.filter(({ verdict }) => verdict === "OK");
              if (result.length > 0) {
                const solvedByDifficulties = ranks.map(({ range }) =>
                  countSolvedInRange(result, range)
                );
                const fullName =
                  firstName && lastName ? firstName + " " + lastName : "";
                table.push({
                  handle: handles[idx],
                  fullName,
                  rating: rating || 0,
                  totalSolved: sum(solvedByDifficulties),
                  solvedByDifficulties,
                  html: toTableRow(
                    handles[idx],
                    fullName,
                    rating || 0,
                    maxRating || 1200,
                    solvedByDifficulties
                  ),
                });
              }
              if (++idx < handles.length) {
                fetchInfo(idx);
              } else {
                loader.remove();
                drawTable();
              }
            }
          )
      ),
    200
  );

const compare = (val1, val2, factor) => {
  if (isNaN(val1) || isNaN(val2)) {
    return factor * val1.toLowerCase().localeCompare(val2.toLowerCase());
  }
  return factor * (val1 - val2);
};

const drawTable = () => {
  table.sort((user1, user2) => compare(user1.rating, user2.rating, -1));
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const getAndChangeValue = (element) => {
  const val = element.getAttribute("value");
  element.setAttribute("value", -1 * val);
  return val;
};

const handleButton = document.querySelector("#handle");
handleButton.onclick = () => {
  const val = getAndChangeValue(handleButton);
  table.sort((user1, user2) => compare(user1.handle, user2.handle, val));
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const fullNameButton = document.querySelector("#full-name");
fullNameButton.onclick = () => {
  const val = getAndChangeValue(fullNameButton);
  table.sort((user1, user2) => compare(user1.fullName, user2.fullName, val));
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const ratingButton = document.querySelector("#rating");
ratingButton.onclick = () => {
  const val = getAndChangeValue(ratingButton);
  table.sort((user1, user2) => compare(user1.rating, user2.rating, val));
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const totalSolvedButton = document.querySelector("#total-solved");
totalSolvedButton.onclick = () => {
  const val = getAndChangeValue(totalSolvedButton);
  table.sort((user1, user2) =>
    compare(user1.totalSolved, user2.totalSolved, val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1200Button = document.querySelector("#under-1200");
under1200Button.onclick = () => {
  const val = getAndChangeValue(under1200Button);
  table.sort((user1, user2) =>
    compare(user1.solvedByDifficulties[0], user2.solvedByDifficulties[0], val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1400Button = document.querySelector("#under-1400");
under1400Button.onclick = () => {
  const val = getAndChangeValue(under1200Button);
  table.sort((user1, user2) =>
    compare(user1.solvedByDifficulties[1], user2.solvedByDifficulties[1], val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1600Button = document.querySelector("#under-1600");
under1600Button.onclick = () => {
  const val = getAndChangeValue(under1600Button);
  table.sort((user1, user2) =>
    compare(user1.solvedByDifficulties[2], user2.solvedByDifficulties[2], val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1900Button = document.querySelector("#under-1900");
under1900Button.onclick = () => {
  const val = getAndChangeValue(under1900Button);
  table.sort((user1, user2) =>
    compare(user1.solvedByDifficulties[3], user2.solvedByDifficulties[3], val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const over1900Button = document.querySelector("#over-1900");
over1900Button.onclick = () => {
  const val = getAndChangeValue(over1900Button);
  table.sort((user1, user2) =>
    compare(user1.solvedByDifficulties[4], user2.solvedByDifficulties[4], val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

window.onload = () => fetchInfo(0);
