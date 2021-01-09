const tbody = document.querySelector("#stalker-table").children[1];
const loader = document.querySelector("#loader");

const table = [];

const handles = [
  { handle: "faridtsl" },
  { handle: "adnaneaabbar" },
  { handle: "AIT-RAMI" },
  { handle: "hoffen" },
  { handle: "Saachi" },
  { handle: "sqrtminusone" },
  { handle: "TheMenTaLisT7" },
  { handle: "Lebannin" },
  { handle: "modx5" },
  { handle: "sato2000" },
  { handle: "benyazidhamza" },
  { handle: "am_Ine" },
  { handle: "meedbek" },
  { handle: "Amee" },
  { handle: "Asaad27" },
  { handle: "Smahox" },
  { handle: "mosleh2020" },
  { handle: "Mr.NickName" },
  { handle: "D_Mind" },
  { handle: "ensiast.aiming.4.expert", aimRating: 1600 },
  { handle: "Kubernetes", aimRating: 1400 },
  { handle: "afollous", aimRating: 1400 },
  { handle: "3aychinghayarakfahm", aimRating: 1400 },
];

const ranks = [
  {
    range: [0, 1200],
    name: "newbie",
    color: "gray",
    mustSolvePercentage: [],
  },
  {
    range: [1200, 1400],
    name: "pupil",
    color: "green",
    mustSolvePercentage: [20, 40, 20, 10, 0],
  },
  {
    range: [1400, 1600],
    name: "specialist",
    color: "#03A89E",
    mustSolvePercentage: [10, 20, 40, 20, 10],
  },
  {
    range: [1600, 1900],
    name: "expert",
    color: "blue",
    mustSolvePercentage: [0, 10, 20, 40, 20],
  },
  {
    range: [1900, 4000],
    name: "cm",
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

const getSolvedAnalytics = (rating, aimRank, solved) => {
  const totalSolved = sum(solved);

  const solvedAnalytics = solved.map((count, idx) => ({
    bgColor:
      (count / totalSolved) * 100 >= aimRank.mustSolvePercentage[idx]
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

const toTableRow = (
  { handle, aimRating },
  isActive,
  rating,
  maxRating,
  solved
) => {
  var aimRank = ranks.find(({ range }) =>
    inRange(range, aimRating || maxRating)
  );
  aimRank = aimRank.range[0] < 1400 ? ranks[2] : aimRank;
  const { color, totalSolved, solvedAnalytics } = getSolvedAnalytics(
    rating,
    aimRank,
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
      <th style="color: ${isActive ? "green" : "gray"}">${
    isActive ? "active" : "idle"
  }</th>
      <th>
        <a style="color: ${color}" href="https://codeforces.com/profile/${handle}">
          ${handle}
        </a>
      </th>
      <td>${rating}</td>
      <td style="color: ${aimRank.color}">${aimRank.name}</td>
      <td>${totalSolved}</td>
      ${solvedAnalyticsHTML}
    </tr>
  `;
};

const countSolvedInRange = (submissions, range) =>
  submissions.filter(
    ({ problem: { rating } }) => rating && inRange(range, rating)
  ).length;

const fetchInfo = (idx) =>
  setTimeout(
    () =>
      fetch(
        `https://codeforces.com/api/user.info?handles=${handles[idx].handle}`
      )
        .then((res) => res.json())
        .then(({ result: [{ rating, maxRating }] }) => {
          fetch(
            `https://codeforces.com/api/user.status?handle=${handles[idx].handle}`
          )
            .then((res) => res.json())
            .then(({ result }) => {
              result = result.filter(({ verdict }) => verdict === "OK");
              if (result.length > 0) {
                const solvedByDifficulties = ranks.map(({ range }) =>
                  countSolvedInRange(result, range)
                );
                const lastSubmissionSecs =
                  new Date() / 1000 - result[0].creationTimeSeconds;
                const isActive = lastSubmissionSecs <= 60 * 60 * 72;
                table.push({
                  handle: handles[idx].handle,
                  isActive,
                  rating: rating || 0,
                  totalSolved: sum(solvedByDifficulties),
                  solvedByDifficulties,
                  html: toTableRow(
                    handles[idx],
                    isActive,
                    rating || 0,
                    maxRating || 1400,
                    solvedByDifficulties
                  ),
                });
              }
              loader.remove();
              drawTable();
              if (++idx < handles.length) {
                fetchInfo(idx);
              }
            })
            .catch((err) => console.log(err));
        })
        .catch(() => {
          console.log(`No such handle: ${handles[idx].handle}`);
          if (++idx < handles.length) {
            fetchInfo(idx);
          }
        }),
    300
  );

const compare = (isActive1, isAtive2, val1, val2, factor) => {
  if (isActive1 !== isAtive2) {
    return isAtive2 - isActive1;
  }
  if (isNaN(val1) || isNaN(val2)) {
    return factor * val1.toLowerCase().localeCompare(val2.toLowerCase());
  }
  return factor * (val1 - val2);
};

const drawTable = () => {
  table.sort((user1, user2) =>
    compare(user1.isActive, user2.isActive, user1.rating, user2.rating, -1)
  );
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
  table.sort((user1, user2) =>
    compare(user1.isActive, user2.isActive, user1.handle, user2.handle, val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const ratingButton = document.querySelector("#rating");
ratingButton.onclick = () => {
  const val = getAndChangeValue(ratingButton);
  table.sort((user1, user2) =>
    compare(user1.isActive, user2.isActive, user1.rating, user2.rating, val)
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const totalSolvedButton = document.querySelector("#total-solved");
totalSolvedButton.onclick = () => {
  const val = getAndChangeValue(totalSolvedButton);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.totalSolved,
      user2.totalSolved,
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1200Button = document.querySelector("#under-1200");
under1200Button.onclick = () => {
  const val = getAndChangeValue(under1200Button);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.solvedByDifficulties[0],
      user2.solvedByDifficulties[0],
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1400Button = document.querySelector("#under-1400");
under1400Button.onclick = () => {
  const val = getAndChangeValue(under1200Button);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.solvedByDifficulties[1],
      user2.solvedByDifficulties[1],
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1600Button = document.querySelector("#under-1600");
under1600Button.onclick = () => {
  const val = getAndChangeValue(under1600Button);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.solvedByDifficulties[2],
      user2.solvedByDifficulties[2],
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const under1900Button = document.querySelector("#under-1900");
under1900Button.onclick = () => {
  const val = getAndChangeValue(under1900Button);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.solvedByDifficulties[3],
      user2.solvedByDifficulties[3],
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

const over1900Button = document.querySelector("#over-1900");
over1900Button.onclick = () => {
  const val = getAndChangeValue(over1900Button);
  table.sort((user1, user2) =>
    compare(
      user1.isActive,
      user2.isActive,
      user1.solvedByDifficulties[4],
      user2.solvedByDifficulties[4],
      val
    )
  );
  tbody.innerHTML = table.map(({ html }) => html).join("");
};

window.onload = () => fetchInfo(0);
