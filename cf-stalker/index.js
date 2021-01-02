window.onload = () => {
  const tbody = document.querySelector("#stalker-table").children[1];

  const handles = ["assali"];

  const difficulties = [
    [0, 1200],
    [1200, 1400],
    [1400, 1600],
    [1600, 1900],
    [1900, 4000],
  ];

  const getRatingColor = (rating) => {
    if (!rating) {
      return "black";
    } else if (rating < 1200) {
      return "gray";
    } else if (rating < 1400) {
      return "green";
    } else if (rating < 1600) {
      return "#03A89E";
    } else if (rating < 1900) {
      return "blue";
    } else {
      return "#a0a";
    }
  };

  const toTableRow = (handle, firstName, lastName, rating, solved) => {
    const totalSolved = solved.reduce((sum, e) => sum + e, 0);
    const color = getRatingColor(rating);
    return `
      <tr>
        <th>
          <a style="color: ${color}" href="https://codeforces.com/profile/${handle}">${handle}</a>
        </th>
        <td>${firstName && lastName ? firstName + " " + lastName : ""}</td>
        <td>${rating}</td>
        <td>${totalSolved}</td>
        <td>${solved[0]}</td>
        <td>${solved[1]}</td>
        <td>${solved[2]}</td>
        <td>${solved[3]}</td>
        <td>${solved[4]}</td>
      </tr>
    `;
  };

  const countSolvedInRange = (submissions, [left, right]) =>
    submissions.filter(
      ({ problem: { rating } }) => rating && rating >= left && rating < right
    ).length;

  const fetchJsonAndExec = (url, callback) =>
    fetch(url)
      .then((res) => res.json())
      .then(callback)
      .catch((err) => console.log(err));

  handles.forEach((handle, idx) => {
    fetchJsonAndExec(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      ({ result: [{ firstName, lastName, rating }] }) =>
        fetchJsonAndExec(
          `https://codeforces.com/api/user.status?handle=${handle}`,
          ({ result }) => {
            result = result.filter(({ verdict }) => verdict === "OK");
            const solvedByDifficulties = difficulties.map((range) =>
              countSolvedInRange(result, range)
            );
            tbody.innerHTML += toTableRow(
              handle,
              firstName,
              lastName,
              rating,
              solvedByDifficulties
            );
          }
        )
    );
  });
};
