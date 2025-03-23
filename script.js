var map = L.map('map', {
    minZoom: -1,
    maxZoom: 4,
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
map.options.zoomSnap = 0.0001;
map.options.zoomDelta = 0.0001;

// 🔥 Rende lo zoom con la rotella più fluido e centrato
map.scrollWheelZoom = 'center';

// Creazione di icone personalizzate per i marker
var personaggioIcon = L.icon({
    iconUrl: 'personaggio.svg',
    iconSize: [35, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var luogoIcon = L.icon({
    iconUrl: 'Luoghi Sconosciuti.svg',
    iconSize: [35, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var cittaIcon = L.icon({
    iconUrl: 'castell.svg',
    iconSize: [35, 35],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Gruppi di marker
var personaggi = L.layerGroup([
    L.marker([2024, 1602], { icon: personaggioIcon }).bindPopup("Storico Snitch")
]);

var luoghiDiInteresse = L.layerGroup([
    L.marker([2044, 1734], { icon: luogoIcon }).bindPopup("Isola Verde")
]);

var citta = L.layerGroup([
    L.marker([2000, 1623], { icon: cittaIcon }).bindPopup("Dravoria"),
    L.marker([2174, 1887], { icon: cittaIcon }).bindPopup("Eldratia")
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

// Creazione del pannello filtri con freccetta a destra
var filterPanel = L.control({ position: 'topright' });
filterPanel.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'filter-panel-container');
    div.innerHTML = `
        <button id="toggle-filter" class="filter-arrow">◀</button>
        <div id="filter-content" class="filter-content" style="display: none;">
            <h3>Filtri</h3>
            <button id="select-all">Seleziona Tutti</button>
            <button id="deselect-all">Deseleziona Tutti</button>
            <table class="filter-table">
                <tr>
                    <td><label for="toggle-personaggi">Personaggi</label></td>
                    <td><input type="checkbox" id="toggle-personaggi" checked></td>
                </tr>
                <tr>
                    <td><label for="toggle-luoghi">Luoghi Sconosciuti</label></td>
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

// Mostra/Nasconde il pannello filtri con cambio freccetta
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggle-filter');
    const filterContent = document.getElementById('filter-content');

    toggleBtn.addEventListener('click', function () {
        if (filterContent.style.display === 'none') {
            filterContent.style.display = 'block';
            toggleBtn.textContent = '▶';
        } else {
            filterContent.style.display = 'none';
            toggleBtn.textContent = '◀';
        }
    });
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

map.on('click', function(e) {
    L.marker(e.latlng).addTo(map)
      .bindPopup(`Coordinate: ${e.latlng.lat}, ${e.latlng.lng}`).openPopup();
});
