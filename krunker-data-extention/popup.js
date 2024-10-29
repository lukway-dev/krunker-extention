const stepOneBox = document.getElementById('step-1')
const stepTwoBox = document.getElementById('step-2')
const stepThreeBox = document.getElementById('step-3')
const stepFourSuccessBox = document.getElementById('step-4-success')
const stepFourErrorBox = document.getElementById('step-4-error')
const steps = document.getElementById('steps')
const stepOneYesButton = document.getElementById('yes-button')
const stepOneNoButton = document.getElementById('no-button')
const teamSelector = document.getElementById('team-selector')
const teamSelected = document.getElementById('team-selected')
const stepTwoButton = document.getElementById('step-2-button')
const stepThreeButton = document.getElementById('step-3-button')
let currentStep = 1
let selectedTeam = 'Linkchar'



const goToNextStep = ({
  step,
  status
}) => {
  const definitiveStep = step || currentStep
  switch (definitiveStep) {
    case 1:
      stepOneBox.classList.remove('active')
      stepTwoBox.classList.add('active')
      const secondStepIndicator = document.querySelectorAll('.step-indicator')[1]
      secondStepIndicator.classList.add('active')
      break
    case 2:
      stepTwoBox.classList.remove('active')
      stepThreeBox.classList.add('active')
      const thirdStepIndicator = document.querySelectorAll('.step-indicator')[2]
      thirdStepIndicator.classList.add('active')
      break
    case 3:
      stepThreeBox.classList.remove('active')
      if (status === 'success') {
        stepFourSuccessBox.classList.add('active')
      } else {
        stepFourErrorBox.classList.add('active')
      }
      break
    default:
      break
  }

  currentStep++
}


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



stepOneYesButton.addEventListener('click', () => goToNextStep({
  step: currentStep
}))
stepOneNoButton.addEventListener('click', () => window.close())

stepTwoButton.addEventListener('click', () => {
  selectedTeam = teamSelector.value
  teamSelected.textContent = selectedTeam
  goToNextStep({
    step: currentStep
  })
})

stepThreeButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: (team) => {
        const extractTableData = (team) => {
          // Función para deducir el equipo según el color
          const getTeamFromColor = (color) => {
            const currentTeam = team
            const enemyTeam = team === 'Linkchar' ? 'Hilarios' : 'Linkchar'
            switch (color) {
              case "rgb(235, 86, 86)":
                return enemyTeam;
              default:
                return currentTeam;
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
              team: getTeamFromColor(nameCell ? window.getComputedStyle(nameCell).color : '')
            };

            players.push(player);
          });

          // const winnerContainer = document.querySelector('.material-icons')?.parentNode
          // const winnerItem = winnerContainer.querySelector('.teamTotalN0, .teamTotalN1')
          // let winner
          // if(winnerItem) {
          //   winner = winnerItem?.textContent
          // }
          const linkcharScore = Number(document.querySelector('#teamTotal0 .teamTotalScore')?.textContent)
          const hilariosScore = Number(document.querySelector('#teamTotal1 .teamTotalScore')?.textContent)
          const linkcharIsWinner = linkcharScore > hilariosScore ? true : false
          const hilarisIsWinner = linkcharScore < hilariosScore ? true : false
          const isDraw = linkcharScore === hilariosScore ? true : false
          console.log(winner)
          let winner = ''
          if (linkcharIsWinner) {
            winner = 'Linkchar'
          } else if (hilarisIsWinner) {
            winner = 'Hilarios'
          } else if (isDraw) {
            winner = 'Draw'
          }

          // Datos generales
          const generalData = {
            winner,
            scoreTeam: {
              'Linkchar': linkcharScore,
              'Hilarios': hilariosScore
            },
            players: {
              ...players
            }
          }

          console.log(generalData)
          const data = JSON.stringify(generalData, null, 2);

          return data
        }

        return extractTableData(team);
      },
      args: [selectedTeam],
    }, async (injectionResults) => {
      // injectionResults contiene los resultados de la función que se ejecutó en la página
      const data = injectionResults[0].result;
      console.log(injectionResults[0].result)
      let copyStatus = ''

      // Copiar los datos en el portapapeles dentro del popup (que tiene foco)
      try {
        await navigator.clipboard.writeText(data);
        // alert("Datos copiados al portapapeles");
        copyStatus = 'success';
      } catch (err) {
        console.error("Error al copiar los datos: ", err);
        // alert("Error al copiar los datos");
        copyStatus = 'error';
      }
      console.log(copyStatus)

      goToNextStep({
        step: currentStep,
        status: copyStatus
      })
    });
  });
})

// // Extraer la data del krunker
// stepOneYesButton.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       function: extractTableData
//     }, (injectionResults) => {
//       // injectionResults contiene los resultados de la función que se ejecutó en la página
//       const playersData = injectionResults[0].result;

//       // Copiar los datos en el portapapeles dentro del popup (que tiene foco)
//       navigator.clipboard.writeText(playersData)
//         .then(() => {
//           alert("Datos copiados al portapapeles");
//         })
//         .catch(err => {
//           console.error("Error al copiar los datos: ", err);
//           alert("Error al copiar los datos");
//         });
//     });
//   });
// });

// // Cerrar el popup y deshabilitar el mutationObserver por 30 segundos
// stepOneNoButton.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       function: disableDetection
//     });
//   });

//   // Cerrar el popup
//   window.close();
// });
