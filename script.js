var map = L.map('map', {
    minZoom: -1,
    maxZoom: 10,
    crs: L.CRS.Simple,
    zoomAnimation: true,        // 🔥 Attiva l'animazione dello zoom
    zoomAnimationThreshold: 4   // 🔥 Rende lo zoom più fluido
});

var w = 3840, h = 3840;
var imageBounds = [[0, 0], [h, w]];

L.imageOverlay('Mappa DND1.jpg', imageBounds).addTo(map);
map.setMaxBounds(imageBounds);
map.fitBounds(imageBounds);

// 🔥 Migliora lo zoom con passaggi più piccoli
map.options.zoomSnap = 0.01;
map.options.zoomDelta = 0.01;

// 🔥 Rende lo zoom con la rotella più fluido e centrato
map.scrollWheelZoom = 'center';

// Creazione di icone personalizzate per i marker
var personaggioIcon = L.icon({
    iconUrl: 'personaggio.png',
    iconSize: [27, 27],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var luogoIcon = L.icon({
    iconUrl: 'puntint.png',
    iconSize: [27, 27],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var cittaIcon = L.icon({
    iconUrl: 'castell.png',
    iconSize: [27, 27],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Gruppi di marker
var personaggi = L.layerGroup([
    L.marker([876, 1730], { icon: personaggioIcon }).bindPopup("Boss del Poppin"),
    L.marker([1358.125, 1390.875], { icon: personaggioIcon }).bindPopup("Storico Snitch")
]);

var luoghiDiInteresse = L.layerGroup([
    L.marker([1384.5, 1540.5], { icon: luogoIcon }).bindPopup("Isola Verde")
]);

var citta = L.layerGroup([
    L.marker([1321, 1415], { icon: cittaIcon }).bindPopup("Dravoria"),
    L.marker([1527.375, 1717.375], { icon: cittaIcon }).bindPopup("Eldratia")
]);

// Mostriamo di default tutti i marker
personaggi.addTo(map);
luoghiDiInteresse.addTo(map);
citta.addTo(map);

// Funzione per aggiornare la visibilità dei marker
function updateLayers() {
    if (document.getElementById('toggle-personaggi').checked) {
        map.addLayer(personaggi);
    } else {
        map.removeLayer(personaggi);
    }

    if (document.getElementById('toggle-luoghi').checked) {
        map.addLayer(luoghiDiInteresse);
    } else {
        map.removeLayer(luoghiDiInteresse);
    }

    if (document.getElementById('toggle-citta').checked) {
        map.addLayer(citta);
    } else {
        map.removeLayer(citta);
    }
}

// Aggiungere il pannello di ricerca
var searchTool = L.control({ position: 'topright' });
searchTool.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'search-tool');
    div.innerHTML = `
        <input type="text" id="search-input" placeholder="Cerca..." />
    `;
    return div;
};
searchTool.addTo(map);

document.getElementById('search-input').addEventListener('keyup', function() {
    var query = this.value.toLowerCase();
    var allMarkers = [...personaggi.getLayers(), ...luoghiDiInteresse.getLayers(), ...citta.getLayers()];
    
    allMarkers.forEach(function(marker) {
        var markerName = marker.getPopup().getContent().toLowerCase();
        if (markerName.includes(query)) {
            map.setView(marker.getLatLng(), 5); // Centra la mappa sul marker
            marker.openPopup(); // Apre il popup del marker
        }
    });
});

// Creazione del pannello filtri a scomparsa
var filterPanel = L.control({ position: 'topright' });
filterPanel.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'filter-panel');
    div.innerHTML = `
        <button id="toggle-filter" class="filter-btn">
            <img src="filter.icon.png" alt="Filtri" />
        </button>
        <div id="filter-content" class="filter-content">
            <h3>Filtri</h3>
            <button id="select-all">Seleziona Tutti</button>
            <button id="deselect-all">Deseleziona Tutti</button>
            <table class="filter-table">
                <tr>
                    <td><label for="toggle-personaggi">Personaggi</label></td>
                    <td><input type="checkbox" id="toggle-personaggi" checked></td>
                </tr>
                <tr>
                    <td><label for="toggle-luoghi">Luoghi di Interesse</label></td>
                    <td><input type="checkbox" id="toggle-luoghi" checked></td>
                </tr>
                <tr>
                    <td><label for="toggle-citta">Città</label></td>
                    <td><input type="checkbox" id="toggle-citta" checked></td>
                </tr>
            </table>
        </div>
    `;
    return div;
};
filterPanel.addTo(map);

// Mostra/Nascondi il pannello filtri
document.getElementById('toggle-filter').addEventListener('click', function() {
    var content = document.getElementById('filter-content');
    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
});

// Seleziona/Deseleziona tutti i filtri
document.getElementById('select-all').addEventListener('click', function() {
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = true;
    });
    updateLayers();
});

document.getElementById('deselect-all').addEventListener('click', function() {
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = false;
    });
    updateLayers();
});

// Aggiorna i layer quando i checkbox cambiano
document.getElementById('toggle-personaggi').addEventListener('change', updateLayers);
document.getElementById('toggle-luoghi').addEventListener('change', updateLayers);
document.getElementById('toggle-citta').addEventListener('change', updateLayers);
