// Extraer la data del krunker
document.getElementById("yes-button").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: extractTableData
    }, (injectionResults) => {
      // injectionResults contiene los resultados de la función que se ejecutó en la página
      const playersData = injectionResults[0].result;

      // Copiar los datos en el portapapeles dentro del popup (que tiene foco)
      navigator.clipboard.writeText(playersData)
        .then(() => {
          alert("Datos copiados al portapapeles");
        })
        .catch(err => {
          console.error("Error al copiar los datos: ", err);
          alert("Error al copiar los datos");
        });
    });
  });
});

// Cerrar el popup y deshabilitar el mutationObserver por 30 segundos
document.getElementById("no-button").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: disableDetection
    });
  });

  // Cerrar el popup
  window.close();
});


const extractTableData = () => {
  // Función para deducir el equipo según el color
  const getTeamFromColor = (color) => {
    switch (color) {
      case "rgb(235, 86, 86)":
        return "Red Team";
      default:
          return "White Team";
    }
  }

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

  // Copiar los datos al portapapeles
  const playersData = JSON.stringify(players, null, 2);

  return playersData
}

// La función para deshabilitar la detección hasta que la tabla desaparezca
const disableDetection = () => {
  window.mutationObserver.disconnect(); // Desconectar el observer para detener la detección

  // Crear un nuevo observer que monitoree la desaparición de la tabla
  const disappearanceObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (!document.querySelector("#endTable")) {
        // Cuando la tabla desaparezca, reactivar la detección y detener este observer
        window.mutationObserver.observe(document.body, { childList: true, subtree: true });
        disappearanceObserver.disconnect();  // Detener este observer
        alert("La detección de la tabla ha sido habilitada nuevamente.");
      }
    });
  });

  // Monitorear la página para detectar la desaparición de la tabla
  disappearanceObserver.observe(document.body, { childList: true, subtree: true });
}