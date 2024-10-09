// Detectar cuando el #endTable aparece
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Verificar si el elemento #endTable está en la página y si chrome script esta habilitado
    if(chrome?.runtime?.sendMessage) {
      if (document.querySelector("#endTable")) {
        // Si el elemento existe, habilitar el popup
        chrome.runtime.sendMessage({ action: "enablePopup" });
      } else {
        // Si no existe, deshabilitar el popup
        chrome.runtime.sendMessage({ action: "disablePopup" });
      }
    }
  });
});

// Observar cambios en el cuerpo del documento
observer.observe(document.body, { childList: true, subtree: true });