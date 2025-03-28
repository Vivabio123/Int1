var map = L.map('map', {
    minZoom: -1,
    maxZoom: 4,
    crs: L.CRS.Simple,
    zoomAnimation: true,
    zoomAnimationThreshold: 4
});

var w = 3840, h = 3840;
var imageBounds = [[0, 0], [h, w]];

if (window.innerWidth <= 768) {
    map.setView([h / 2, w / 2], -1);  // Zoom più lontano 
} else {
    map.setView([h / 2, w / 2], 2);  // Zoom normale su desktop
}

// === 🔄 SWITCH TRA MAPPA NORMALE E MAPPA POLITICA ===
var currentMap = 'normal';
var normalMap = L.imageOverlay('Mappa DND1.jpg', imageBounds);
var politicalMap = L.imageOverlay('Mappa DND2.jpg', imageBounds);

normalMap.addTo(map); // Imposta la mappa normale come predefinita
map.setMaxBounds(imageBounds);
map.fitBounds(imageBounds);

map.options.zoomSnap = 0.0001;
map.options.zoomDelta = 0.0001;
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
    L.marker([2017.3, 1612.9], { icon: personaggioIcon }).bindPopup("Storico Snitch")
]);

var luoghiDiInteresse = L.layerGroup([
    L.marker([2044, 1734], { icon: luogoIcon }).bindPopup("Isola Verde")
]);

var citta = L.layerGroup([
    L.marker([1979.15, 1631.7], { icon: cittaIcon }).bindPopup("Dravoria"),
    L.marker([2183.4, 1892.4], { icon: cittaIcon }).bindPopup("Eldratia")
]);

personaggi.addTo(map);
luoghiDiInteresse.addTo(map);
citta.addTo(map);

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

// Pannello di ricerca
var searchTool = L.control({ position: 'topright' });
searchTool.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'search-tool');
    div.innerHTML = `<input type="text" id="search-input" placeholder="Cerca Marker..." />`;
    return div;
};
searchTool.addTo(map);

document.getElementById('search-input').addEventListener('keyup', function() {
    var query = this.value.toLowerCase();
    var allMarkers = [...personaggi.getLayers(), ...luoghiDiInteresse.getLayers(), ...citta.getLayers()];
    
    allMarkers.forEach(function(marker) {
        var markerName = marker.getPopup().getContent().toLowerCase();
        if (markerName.includes(query)) {
            map.setView(marker.getLatLng(), 5);
            marker.openPopup();
        }
    });
});

// Pannello filtri
var filterPanel = L.control({ position: 'topright' });
filterPanel.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'filter-panel-container');
    div.innerHTML = `
        <button id="toggle-filter" class="filter-arrow">◀</button>
        <div id="filter-content" class="filter-content" style="display: none;">
            <h3 style="color: white;">Filtri</h3> <!-- Forza il colore bianco -->
            <button id="select-all">Mostra Tutti</button>
            <button id="deselect-all">Nascondi Tutti</button>
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
    
    // Se dispositivo mobile, riduci le dimensioni del pannello filtri
    if (window.innerWidth <= 768) {
        div.classList.add('mobile-filter'); // Aggiunge una classe per ridurre la dimensione
    }

    return div;
};
filterPanel.addTo(map);

document.addEventListener('DOMContentLoaded', function () {
    // Switch mappa
    const toggle = document.getElementById('mapToggle');
    if (toggle) {
        toggle.addEventListener('change', function () {
            if (this.checked) {
                map.removeLayer(normalMap);
                politicalMap.addTo(map);
            } else {
                map.removeLayer(politicalMap);
                normalMap.addTo(map);
            }
        });
    }

    // Filtri
    const toggleBtn = document.getElementById('toggle-filter');
    const filterContent = document.getElementById('filter-content');

    if (toggleBtn && filterContent) {
        toggleBtn.addEventListener('click', function () {
            if (filterContent.style.display === 'none') {
                filterContent.style.display = 'block';
                toggleBtn.textContent = '▶';
            } else {
                filterContent.style.display = 'none';
                toggleBtn.textContent = '◀';
            }
        });
    }

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

    document.getElementById('toggle-personaggi').addEventListener('change', updateLayers);
    document.getElementById('toggle-luoghi').addEventListener('change', updateLayers);
    document.getElementById('toggle-citta').addEventListener('change', updateLayers);
});

// === Pannello dello switch mappa (in basso a sinistra) ===
var switchControl = L.control({ position: 'bottomleft' });
switchControl.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'map-switch');
    div.innerHTML = `
        <label class="switch">
            <input type="checkbox" id="mapToggle">
            <span class="slider"></span>
        </label>
        <span class="map-label">Switch Map</span>
    `;
    return div;
};
switchControl.addTo(map);
