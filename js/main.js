'use strict';

var applaunchCount = window.localStorage.getItem('launchCount');

//Check if it already exists or not
if(applaunchCount){
   //This is a second time launch, and count = applaunchCount
}else{
  //Local storage is not set, hence first time launch. set the local storage item
  window.localStorage.setItem('launchCount',1);
  introJs().start();

  //Do the other stuff related to first time launch
};
	    

var onSuccess = function(position) {
};

// onError Callback receives a PositionError object
//

function onError(error) {
    function alertDismissed() {
    // do something
}
navigator.notification.alert(
    'El GPS está DESACTIVADO, o no recibe señal. Si quieres utilizar las funciones del GPS, actívalo y entra de nuevo al mapa.',  // message
    alertDismissed,         // callback
    'GUIANDO',            // title
    'OK'                  // buttonName
);}

// alert('El GPS está DESACTIVADO, o no recibe señal.Por favor actívalo y entra de nuevo al mapa.');}

navigator.geolocation.watchPosition(onSuccess, onError,{maximumAge: 3000, timeout: 7000, enableHighAccuracy: true});

function app(window, document, L, bikeTrails) {
    var menuStack = [];
    var trailsFilter = '';
    var trail = {};
    var trails = {};
    var ratings = {
        'rojo': '&#9679;',
        'amarillo': '&#9679;',
        'azul': '&#9679;',
        'verde': '&#9679;',
    };
    var marker;
    var trails = bikeTrails;

    L.RotatedMarker = L.Marker.extend({
        options: { angle: 20 },
        _setPos: function(pos) {
            L.Marker.prototype._setPos.call(this, pos);

            if(this.options.angle){
                if (this.options.angle < 45) {
                    this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + (360 - this.options.angle) + 'deg)';
                } else {
                    this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + (this.options.angle - 45) + 'deg)';
                }
            }
        }
    });
    L.rotatedMarker = function(pos, options) {
        return new L.RotatedMarker(pos, options);
    };


	L.mapbox.accessToken = 'pk.eyJ1Ijoiam9zZXJyYSIsImEiOiJnMGdtWUh3In0.xm5EUQ0yb_QvTVZ_AraXaQ';

// CÓDIGO DEFINITIVO

var map = L.mapbox.map('map','joserra.jf876a70').setView([43.063, -3.575], 12);
var ui = document.getElementById('map-ui');
 
//addLayer(L.mapbox.tileLayer('examples.map-zgrqqx0w'), 'Base Map', 1);
//addLayer(L.mapbox.tileLayer('examples.bike-lanes'), 'Bike Lanes', 2);
//addLayer(L.mapbox.tileLayer('examples.bike-locations'), 'Bike Stations', 3);
 
addLayer('joserra.senderismo', '\uf21d', 1);
addLayer('joserra.mtb', '\uf206', 2);
addLayer('joserra.turistica', '\uf19c', 3);
addLayer('joserra.pois', '\uf041', 3);
 
function addLayer(layer_id, name, zIndex) {
    var layer = L.mapbox.tileLayer(layer_id);
    var grid = L.mapbox.gridLayer(layer_id);
    var gridControl = L.mapbox.gridControl(grid);
    
    layer
        .setZIndex(zIndex);
        //.addTo(map);
 
    // Create a simple layer switcher that toggles layers on
    // and off.
    var item = document.createElement('li');
    var link = document.createElement('a');
 
    link.href = '#';
    link.className = 'noactive';
    link.innerHTML = name;
 
    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
 
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            this.className = '';
            
            //JLC - add grid and grid control
            map.removeLayer(grid);
            map.removeControl(gridControl)
        } else {
            map.addLayer(layer);
            this.className = 'active';
            
            //JLC - add grid and grid control
            map.addLayer(grid);
            map.addControl(gridControl)
        }
    };
 
    item.appendChild(link);
    ui.appendChild(item);
}
 

    var trailsMenu = document.getElementById('trails');

    function toggleMenu(){
        var oc = document.getElementById('menu');
        oc.classList.toggle('expanded');
        return false;
    }

    function toggleSubMenu(submenu, filter){
        var sm = document.getElementById(submenu);
        sm.classList.toggle('menu-active');
        if (trailsFilter) trailsMenu.classList.remove(trailsFilter);
        trailsMenu.classList.add(filter);
        trailsFilter = filter;
        menuStack.push(sm);
        return false;
    }

    function back(){
        if (menuStack.length > 0){
            var last = menuStack.pop();
            last.classList.toggle('menu-active');
            if (trailsFilter) trailsMenu.classList.remove(trailsFilter);
            return false;
        }
    }

    function showTrail(trailIndex){
        toggleMenu();
        if(trail) map.removeLayer(trail);
        trail = L.geoJson(trails.features[trailIndex], {
            style: function (feature) {
                return {color: '#e9627d' , weight: 6};
            }
        });
        setTimeout(function () {
            map.fitBounds(trail.getBounds());
        }, 500);
        setTimeout(function () {
            map.addLayer(trail);
        }, 1000);
    }

    function renderTrailsList(trails){
        trails.forEach(function (trail, i) {
            var item = document.createElement('li')
            var spans = {};

            item.classList.add('menu-item');
            for (var key in trail.properties) {
                if (trail.properties[key]) {
                    switch(key){
                    case 'rating':
                    case 'type':
                        var val = trail.properties[key].toLowerCase().split(' ').join('-');
                        item.classList.add(['category', key, val].join('-'));
                        break;
                    case 'distance':
                        var val = Math.round(trail.properties[key]);
                        if(val < 10) val = 'lt10'
                        if(val > 10 && val < 50) val = '10to50'
                        if(val > 50) val = 'gt50'
                        item.classList.add('category-distance-' + val);
                        break;
                    }
                }
            }

            ['rating', 'name'].forEach(function (label) {
                var span = document.createElement('span');
                span.classList.add('trail-'+label);

                if (label == 'rating') {
                    var rating = trail.properties['rating'].toLowerCase().split(' ').join('-');
                    span.innerHTML = ratings[rating];
                    span.classList.add('trail-rating', 'trail-rating-' + rating);
                } else {
                    span.textContent = trail.properties[label];
                }

                item.setAttribute('onClick', 'app.showTrail(' + i +')')
                item.appendChild(span);
                spans[label] = span
				
            });
						
			var p = document.createElement('p');
            p.classList.add('trail-distance','trail-familiar', 'trail-circular');
			p.textContent = trail.properties.distance+' km  '+ trail.properties.familiar +'   '+ trail.properties.circular;
            item.appendChild(p);
			
			var p = document.createElement('p');
            p.classList.add('trail-desc');
            p.textContent = trail.properties.desc;
            item.appendChild(p);
			
			

            trailsMenu.appendChild(item);
        });
    }







    var viewSet = false;
    map.on('locationfound', function (e) {
        if ( !map.hasLayer(marker) ){
             marker = L.rotatedMarker(e.latlng, {
              icon: L.icon({
                iconUrl: './images/location28.png'
              })
            });
            marker.addTo(map);
        }
        
        if (e.heading) marker.options.angle = e.heading;
        marker.setLatLng(e.latlng);

        
        if (!viewSet) {
            map.stopLocate();
            map.locate({
                watch: true,
                setView: false,
                enableHighAccuracy: true
            });
            viewSet = true;
        }
    });

    function locate(){
        map.locate({
            watch: true,
            setView: true, 
			maxZoom: 12,
            enableHighAccuracy: true
        });
    }

    function onDeviceReady(){;
        renderTrailsList(trails.features);
        locate();
    }

    function onPause(){
        map.stopLocate();
        viewSet = false;
    }

    function onResume(){
        locate();
    }

    if ('cordova' in window) {
        document.addEventListener("deviceready", onDeviceReady, false);
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
    } else {
        onDeviceReady();
    }
    
    return {
        toggleMenu: toggleMenu,
        toggleSubMenu: toggleSubMenu,
        back: back,
        showTrail: showTrail
    };

}


function init(){
    window.app = app(window, document, L, window.trails);
}
