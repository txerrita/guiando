'use strict';

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
	
	
		
//    var map = L.mapbox.map('map', 'joserra.jf876a70', {
//        center: [43.063, -3.575],
//        zoom: 12,
//        gridLayer: true, 
//        maxZoom: 18,
//    });

var map = L.mapbox.map('map', 'joserra.jf876a70')
//		.setView([43.119, -3.598], 12);
		
//	map.gridControl.options.follow = true;	
//	var gridLayer = L.mapbox.gridLayer("joserra.labels").addTo(map);
//	var gridControl = L.mapbox.gridControl(gridLayer).addTo(map);
		L.control.layers({
    'Senderismo': L.mapbox.tileLayer('joserra.guiando').addTo(map),
    'Puntos de interés': L.mapbox.tileLayer('joserra.pois')
}, {
    'Parkings': L.mapbox.tileLayer('joserra.pois'),
    'Bike Lanes': L.mapbox.tileLayer('joserra.bikes')
},
{position: "topright"}
).addTo(map);
	
	var myGridLayer = L.mapbox.gridLayer('joserra.label').addTo(map);
	var myGridControl = L.mapbox.gridControl(myGridLayer).addTo(map);


	map.setView([43.119, -3.598], 12);
	

	
	

 
 
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
			p.textContent = trail.properties.distance+' km '+ trail.properties.familiar + trail.properties.circular;
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