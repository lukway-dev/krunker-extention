const getData = () => {
  // Obtener todas las filas de la tabla
  const rows = document.querySelectorAll("#endTable tbody tr");
  const players = [];

  rows.forEach((row) => {
    // Ignorar filas vacías o no relevantes
    if (!row.querySelector("td")) return;

    // Extraer la celda del nombre para verificar el equipo
    const nameCell = row.querySelector("td .endTableN");

    // Extraer los datos relevantes
    const player = {
        name: nameCell ? nameCell.textContent.trim() : '',
        score: row.querySelector("td:nth-child(3)")?.textContent.trim() || '',
        kills: row.querySelector("td:nth-child(4)")?.textContent.trim() || '',
        deaths: row.querySelector("td:nth-child(5)")?.textContent.trim() || '',
        caps: row.querySelector("td:nth-child(6)")?.textContent.trim() || '',
        reward: row.querySelector("td:nth-child(7)")?.textContent.trim() || '',
        team: getTeamFromColor(nameCell ? window.getComputedStyle(nameCell).color : '')
    };

    players.push(player);
  });

  console.log(players)
}

// Función para deducir el equipo según el color
const getTeamFromColor = (color) => {
  console.log(color)
  switch (color) {
    case "rgb(235, 86, 86)":
      return "Red Team";
    case "rgb(255, 255, 255)":
      return "White Team";
    default:
        return "Unknown Team";
  }
}

getData()
