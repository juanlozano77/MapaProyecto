document.getElementById('toggle-formulario').addEventListener('click', function() {
    $('#collapse-formulario').collapse('toggle');
});

document.getElementById('toggle-formulario1').addEventListener('click', function() {
    $('#collapse-formulario').collapse('toggle');
});


document.getElementById('open-help-modal').addEventListener('click', function() {
    $('#help-modal').modal('show');
});



// Inicializar el mapa
const url = 'puntos_interes.csv';

async function loadCSVFromURL(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8'
            }
        });
        const csvText = await response.text();
        return csvText;
    } catch (error) {
        throw new Error(`Error al cargar datos desde ${url}: ${error.message}`);
    }
}

// Función para convertir CSV a arreglo de objetos
function csvToArray(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index].trim();
        });
        data.push(obj);
    }

    return data;
}

// Cargar Datos
loadCSVFromURL(url)
    .then(csvText => {
        const data = csvToArray(csvText);
        console.log('Datos CSV cargados y convertidos:');
        continuar(data)
 
    })
    .catch(error => {
        console.error('Error:', error);
        // Manejar el error apropiadamente
    });
	


function continuar(puntos) {


var map = L.map('map').setView([-34.8220704, -58.3927518], 12);

// Agregar capa de mapa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Cargar el GeoJSON con Leaflet
fetch('assets/brown1.geojson')
    .then(response => response.json())
    .then(geojson_data => {
        // Generar colores aleatorios
        function randomColor() {
            var color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Genera un color hexadecimal aleatorio
            return color;
        }

        // Función para el estilo de hover
        function hoverStyle(e) {
            var layer = e.target;
            layer.setStyle({
                weight: 5,
                color: '#5F9EA0',
                dashArray: '',
                fillOpacity: 0.7  // Ajusta la opacidad al hacer hover
            });
        }

        // Función para resetear el estilo cuando se quita el hover
        function resetStyle(e) {
            var layer = e.target;
            var originalStyle = geojson_data.features.find(feature => feature.properties.id === layer.feature.properties.id).properties.style;
            layer.setStyle({
                weight: originalStyle.weight,  // Restaura el peso original
                color: originalStyle.color,    // Restaura el color original
                dashArray: originalStyle.dashArray,  // Restaura el dashArray original si es necesario
                fillOpacity: originalStyle.fillOpacity || 0.2  // Restaura la opacidad original del relleno si está definida
            });
        }

        // Añadir GeoJSON al mapa, filtrando solo polígonos y multipolígonos
        L.geoJSON(geojson_data, {
            filter: function (feature, layer) {
                return feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon';
            },
            style: function (feature) {
                return {
                    color: randomColor(),  // Asigna color aleatorio
                    weight: 3,  // Ajusta el peso del borde
                    fillOpacity: 0.2  // Opacidad del relleno por defecto
                };
            },
            onEachFeature: function (feature, layer) {
                // Guardar el estilo original en las propiedades del feature
                var originalStyle = {
                    weight: layer.options.weight,
                    color: layer.options.color,
                    dashArray: layer.options.dashArray,
                    fillOpacity: layer.options.fillOpacity
                };
                feature.properties.style = originalStyle;

                layer.on({
                    mouseover: hoverStyle,  // Evento hover
                    mouseout: resetStyle    // Evento cuando se quita el hover
                });
            }
        }).addTo(map);
    });
    
            
    // Otros marcadores y configuraciones pueden agregarse aquí
    const mapLayers = [
            {
                "id": "streets",
                "name": "Streets",
                "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "maxZoom": 19,
                "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
            },
            {
                "id": "dark",
                "name": "Dark",
                "url": "http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "maxZoom": 19,
                "attribution": "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ"
            },
            {
                "id": "satellite",
                "name": "Satellite",
                "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                "maxZoom": 19,
                "attribution": "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ"
            },
            {
                "id": "hibridro",
                "name": "Hibridro",
                "url": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                "maxZoom": 19,
                "attribution": "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ"
            },
            {
                "id": "topo",
                "name": "Topo",
                "url": "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                "maxZoom": 17,
                "attribution": "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org\">SRTM</a> | Map style: &copy; <a href=\"https://opentopomap.org\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\">CC-BY-SA</a>)"
            }
        ];

        
    // Control de capas
    const baseLayers = {};
        mapLayers.forEach(layer => {
            baseLayers[layer.name] = L.tileLayer(layer.url, {
                maxZoom: layer.maxZoom,
                attribution: layer.attribution
            });
        });

        // Añadir la capa base inicial al mapa
        baseLayers["Streets"].addTo(map);

        // Añadir el control de capas al mapa
        L.control.layers(baseLayers).addTo(map);
    L.easyButton({
        id: 'id-for-the-button',
        states: [{
            
            stateName: 'default',
            icon: "fa fa-recycle",
            title: 'Centros de Reciclaje',
            
        }]
    }).addTo(map);

    
L.easyButton({
	id: 'id-for-the-button2',
    states: [{
		
        stateName: 'default',
        icon: 'fa fa-truck',
        title: 'Recolección de Residuos',
       
    }]
}).addTo(map);

/// \__
//(    @\___
//         O
//   (_____/
//_____/ U

L.easyButton({
	id: 'id-for-the-button3',
    states: [{
		
        stateName: 'default',
        icon: 'fa fa-paw',
        title: 'Cuidado Animal',
        
    }]
}).addTo(map);

L.easyButton({
	id: 'id-for-the-button4',
    states: [{
		
        stateName: 'default',
        icon: 'fas fa-book-reader',
        title: 'Bibliotecas Populares',
        
    }]
}).addTo(map); 

// Marcadores
var markers = [];

// Función para agregar marcadores al mapa
var iReciclaje = L.icon({
    iconUrl: './assets/recycling_189286.png',
	iconSize:[32, 32],
    iconAnchor:[16, 32]
});

var iRecoleccion = L.icon({
    iconUrl: './assets/garbage-truck_8766985.png',
	iconSize:[32, 32],
    iconAnchor:[16, 32]
});

var iCAnimal = L.icon({
    iconUrl: '/assets/pet-friendly_12141154.png',
	iconSize:[32, 32],
    iconAnchor:[16, 32]
});

var iLibreria = L.icon({
    iconUrl: '/assets/library.png',
	iconSize:[32, 32],
    iconAnchor:[16, 32]
});



// Función para agregar un marcador
function addMarker(lat, lng, tipo, nombre, description) {
    let tipeIcon;

    if (tipo === "reciclaje") {
        tipeIcon = iReciclaje;	
    } else if (tipo === "recoleccion") {
        tipeIcon = iRecoleccion;	
    } else if (tipo === "cuidado_animal") {
        tipeIcon = iCAnimal;	    
    } else if (tipo === "biblioteca") {
        tipeIcon = iLibreria;	    
    }
    

    const marker = L.marker([lat, lng], {
        icon: tipeIcon,
        category: tipo,
        nombre: nombre,
        descripcion: description
    }).addTo(map).bindTooltip(nombre);

    marker.on('click', function() {
        document.getElementById('offcanvasDetailsLabel').innerText = nombre;
        document.getElementById('point-details').innerText = description;
        offcanvas.show();
    });

    markers.push(marker);
}

// Crear una única instancia de Offcanvas
const offcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasDetails'));

const offcanvas1 = new bootstrap.Offcanvas(document.getElementById('offcanvasPuntosCercanos'));
// Agregar marcadores desde los datos
puntos.forEach(function(item) {
    addMarker(
        item.latitud,
        item.longitud,
        item.tipo,
        item.nombre,
        item.descripcion + "\nDirección: " + item.direccion + "\nLocalidad: " + item.localidad + "\nTeléfono: " + item.telefono
    );
});

// Funciones para filtrar marcadores

function showMarkerso(id,color) {
// Convertir el color a minúsculas para evitar problemas de coincidencia de mayúsculas y minúsculas
    color = color.toLowerCase();
    
    // Si el id es 'id-for-the-button2'
    if (id == 'id-for-the-button') {
		var filter = 'reciclaje'; // Asignar filtro
    }
	if (id == 'id-for-the-button2') {
		var filter = 'recoleccion'; // Asignar filtro
    }
    if (id == 'id-for-the-button3') {
		var filter = 'cuidado_animal'; // Asignar filtro
    }
    if (id == 'id-for-the-button4') {
		var filter = 'biblioteca'; // Asignar filtro
    }
	// Iterar sobre los marcadores
      markers.forEach(function(marker) {
            // Si el marcador pertenece a la categoría 'reciclaje'
            if (marker.options.category == filter) {
                // Remover el marcador del mapa
                map.removeLayer(marker);
                
                // Si el color no es blanco, añadir el marcador de nuevo al mapa
                if (color != 'rgb(255, 255, 255)') {
                    marker.addTo(map);
                }
            }
        });
}



document.getElementById('id-for-the-button').addEventListener('click', function() {
    var switches = document.getElementById('flexSwitchCheck1');
    if (this.style.backgroundColor == 'aqua' ||this.style.backgroundColor == ''){
		this.style.backgroundColor = 'white';// Cambia a azul cuando se hace clic
        switches.checked=false;}
	else {
       this.style.backgroundColor='aqua'
       switches.checked=true;
	};
});

function toggleButton(buttonId, switchId) {
    document.getElementById(buttonId).addEventListener('click', function() {
        var switches = document.getElementById(switchId);
        if (this.style.backgroundColor == 'aqua' || this.style.backgroundColor == '') {
            this.style.backgroundColor = 'white'; // Cambia a blanco cuando se hace clic
            switches.checked = false;
        } else {
            this.style.backgroundColor = 'aqua';
            switches.checked = true;
        }
    });
}

// Llama a la función para cada botón
toggleButton('id-for-the-button2', 'flexSwitchCheck2');
toggleButton('id-for-the-button3', 'flexSwitchCheck3');
toggleButton('id-for-the-button4', 'flexSwitchCheck4');
// Función que se ejecutará cuando cambie el color de fondo
function backgroundColorChanged(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const element = mutation.target;
            const backgroundColor = window.getComputedStyle(element).backgroundColor;
             //alert('El color de fondo del elemento con ID ' + element.id + ' ha cambiado a: ' + backgroundColor);
			showMarkerso(element.id,backgroundColor)
        }
    }
}

// Seleccionar el elemento que queremos observar
var targetNode = document.getElementById('id-for-the-button');
var targetNode2 = document.getElementById('id-for-the-button2');
var targetNode3 = document.getElementById('id-for-the-button3');
var targetNode4 = document.getElementById('id-for-the-button4');
// Crear una instancia de MutationObserver
var observer = new MutationObserver(backgroundColorChanged);

// Configurar qué cambios queremos observar
var config = { attributes: true, attributeFilter: ['style'] };

// Comenzar a observar el elemento
observer.observe(targetNode, config);
observer.observe(targetNode2, config);
observer.observe(targetNode3, config);
observer.observe(targetNode4, config);
document.getElementById('flexSwitchCheck1').addEventListener('change', function(event) {
            var button = document.getElementById('id-for-the-button');
            if (event.target.checked) {
                button.style.backgroundColor="aqua";
            } else {
                button.style.backgroundColor="white";
            }
        });

document.getElementById('flexSwitchCheck2').addEventListener('change', function(event) {
            var button = document.getElementById('id-for-the-button2');
            if (event.target.checked) {
                button.style.backgroundColor="aqua";
            } else {
                button.style.backgroundColor="white";
            }
        });

document.getElementById('flexSwitchCheck3').addEventListener('change', function(event) {
            var button = document.getElementById('id-for-the-button3');
            if (event.target.checked) {
                button.style.backgroundColor="aqua";
            } else {
                button.style.backgroundColor="white";
            }
        });
document.getElementById('flexSwitchCheck4').addEventListener('change', function(event) {
            var button = document.getElementById('id-for-the-button4');
            if (event.target.checked) {
                button.style.backgroundColor="aqua";
            } else {
                button.style.backgroundColor="white";
            }
        });

function updateButtonBackground(switchId, buttonId) {
    document.getElementById(switchId).addEventListener('change', function(event) {
        var button = document.getElementById(buttonId);
        if (event.target.checked) {
            button.style.backgroundColor = "aqua";
        } else {
            button.style.backgroundColor = "white";
        }
    });
}

// Llama a la función para cada interruptor y botón
updateButtonBackground('flexSwitchCheck1', 'id-for-the-button');
updateButtonBackground('flexSwitchCheck2', 'id-for-the-button2');
updateButtonBackground('flexSwitchCheck3', 'id-for-the-button3');
updateButtonBackground('flexSwitchCheck4', 'id-for-the-button4');


// Función para calcular la distancia haversine entre dos puntos geográficos
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
}

// Función para calcular la distancia mínima por categoría desde un punto dado
function calcularDistanciaMinima(lat, lon, data) {
    // Calcular la distancia desde el punto dado a todas las ubicaciones
    
    data.forEach(function(row) {
        
        row.distancia = haversineDistance(lat, lon, row.latitud, row.longitud);
    });

    // Encontrar la distancia mínima por categoría y obtener el lugar más cercano
    const minDistances = {};
    
    data.forEach(function(row) {
        const categoria = row.tipo;
        if (!minDistances[categoria] || row.distancia < minDistances[categoria].distancia) {
            minDistances[categoria] = {
                tipo: categoria,
                nombre: row.nombre,
                direccion: row.direccion,
                localidad: row.localidad,
                latitud: row.latitud,
                longitud: row.longitud,
                distancia: row.distancia
            };
        }
    });

    return Object.values(minDistances);
}



L.Control.CustomLocate = L.Control.Locate.extend({
    _initCircle: function () {
        // ... código original para inicializar el círculo

        this._circle.on('click', (e) => {
            // Aquí se ejecuta la lógica cuando se hace clic en el círculo
            console.log('Hiciste clic en el círculo de localización!');

            // Ejemplo de acción: Abrir un popup en la ubicación
            L.popup()
                .setLatLng(e.latlng)
                .setContent('Estás aquí!')
                .openOn(this._map);
        });
    }
});

function handleLocationFound(e, map) {
    // Eliminar cualquier marcador y círculo anterior
    map.eachLayer(function(layer) {
        if (layer instanceof L.Circle || (layer instanceof L.Marker && layer.options.category === "posicion")) {
            map.removeLayer(layer);
        }
    });

    var circle = L.circle([e.latitude, e.longitude], e.accuracy / 2, {
        weight: 1,
        color: '#007bff', // Color del borde del círculo (azul)
        fillColor: '#00bfff', // Color del relleno del círculo (celeste)
        fillOpacity: 0.3 // Opacidad del relleno del círculo
    }).addTo(map);

    // Crear un marcador en la ubicación del usuario
    var marker = L.marker([e.latitude, e.longitude], {
        category: "posicion"
    }).addTo(map).bindPopup('Estas Acá <br>Click para detallar lugares cercanos').openPopup().on('click', function() {
        // Opcional: Agregar zoom en la ubicación del usuario
        map.setView([e.latitude, e.longitude], 14);

        // Calcular las categorías cercanas (asegúrate de tener la función calcularDistanciaMinima)
        const categoriasCercanas = calcularDistanciaMinima(e.latitude, e.longitude, puntos);

        // Construir el contenido del popup para todas las categorías cercanas
        let detalles = '<h3>Categorías más cercanas:</h3>';
        
        categoriasCercanas.forEach(cat => {
            detalles += `
                <p><strong>Categoría:</strong> ${cat.tipo}</p>
                <p><strong>Nombre:</strong> ${cat.nombre}</p>
                <p><strong>Dirección:</strong> ${cat.direccion}</p>
                <p><strong>Coordenadas:</strong> Latitud: ${cat.latitud}, Longitud: ${cat.longitud}</p>
                <p><strong>Distancia mínima:</strong> ${cat.distancia.toFixed(2)} km</p>
                <hr>
            `;
        });

        document.getElementById('point-details2').innerHTML = detalles;
        offcanvas1.show();
    });
}

  // Crear el botón de EasyButton
  L.easyButton({
    position: 'topright',
    states: [{
        stateName: 'get-location',
        icon: 'fa-location-arrow',
        title: 'Ubicarme',
        onClick: function(btn, map) {
            // Solicitar la geolocalización del usuario
            map.locate({ setView: true, watch: false })
                .on('locationfound', function(e) {
                    handleLocationFound(e, map); // Llama a la función externa
                })
                .on('locationerror', function(e) {
                    alert("Acceso a la ubicación denegado.");
                });
        }
    }]
}).addTo(map);

document.getElementById('data-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el envío del formulario

    const calle = document.getElementById('calle-input').value;
    const altura = document.getElementById('altura-input').value;
    const localidad = document.getElementById('localidad-input').value;

    if (!calle || !altura || !localidad) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const address = `${calle},${altura},${localidad}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const direcEnc = data[0].display_name;

            var collapseElement = document.getElementById('collapseOne');
            var collapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            collapse.hide();
            var accordionElement = document.getElementById('collapse-formulario');
            var accordionItems = accordionElement.getElementsByClassName('accordion-collapse');
            for (var i = 0; i < accordionItems.length; i++) {
                var collapseItem = new bootstrap.Collapse(accordionItems[i], {
                    toggle: false
                });
                collapseItem.hide();
            }
            accordionElement.classList.remove('show');

            map.eachLayer(function(layer) {
                if (layer instanceof L.Circle && layer.options.category === "direEnc" || (layer instanceof L.Marker && layer.options.category === "direEnc")) {
                    map.removeLayer(layer);
                }
            });

            console.log(lat, lon);
            var circle = L.circle([lat, lon], 350, {
                weight: 1,
                category: "direEnc",
                color: '#007bff', // Color del borde del círculo (azul)
                fillColor: '#00bfff', // Color del relleno del círculo (celeste)
                fillOpacity: 0.3 // Opacidad del relleno del círculo
            }).addTo(map);

            map.setView([lat, lon], 14);

            // Crear un marcador en la ubicación del usuario
            var marker = L.marker([lat, lon], {
                category: "direEnc"
            }).addTo(map).bindPopup(direcEnc + '<br>Click para detallar lugares cercanos').openPopup().on('click', function() {
                const categoriasCercanas = calcularDistanciaMinima(lat, lon, puntos);

                // Construir el contenido del popup para todas las categorías cercanas
                let detalles = '<h3>Categorías más cercanas:</h3>';
                
                categoriasCercanas.forEach(cat => {
                    detalles += `
                        <p><strong>Categoría:</strong> ${cat.tipo}</p>
                        <p><strong>Nombre:</strong> ${cat.nombre}</p>
                        <p><strong>Dirección:</strong> ${cat.direccion}</p>
                        <p><strong>Coordenadas:</strong> Latitud: ${cat.latitud}, Longitud: ${cat.longitud}</p>
                        <p><strong>Distancia mínima:</strong> ${cat.distancia.toFixed(2)} km</p>
                        <hr>
                    `;
                });

                document.getElementById('point-details2').innerHTML = detalles;
                offcanvas1.show();
            });
        }  else {
            var myModal = new bootstrap.Modal(document.getElementById('help-modal2'));
            myModal.show();
            
        }
    }catch (error) {
        console.error("Error:", error);
        
    }
    
})

}
