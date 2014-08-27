/**
 * @module subtrack90.game.leafletMapDirective
 */

angular.module('subtrack90.game.leafletMapDirective', ['subtrack90.game.reviewTourDirective'])

.constant('leafletMapConfig', {
    initialZoom: 11,
    sonarBearingLines: {
        color: '#A9A9A9',
        weight: 2
    },
    ownshipPositionStyle: {
        radius: 5,
        opacity: 1
    }
})

.directive('leafletMap', ['leafletMapConfig', function (leafletMapConfig) {

    return {
        restrict: 'EA',
        scope: {},
        require: ['^spatialView', '?^reviewTour'],
        link: function (scope, element, attrs, controllers) {
            var spatialViewController = controllers[0];
            var reviewTourController = controllers[1];
            var layerGroups = {};
            var tileLayerUrl = 'img/mobac/atlases/MapQuest/{z}/{x}/{y}.jpg';
            var leafletMarkers = {};
            var sonarMultiPolyline;
            var map;

            /**
             * Add scale and mouse positions information to the map layer.
             */
            var addMapFeatures = function () {
                var scaleConfig = {
                    metric: true,
                    imperial: true
                };

                L.control.scale(scaleConfig).addTo(map);
                L.control.mousePosition().addTo(map);
            };

            /**
             * Map layers configurations.
             */
            var configureLayers = function () {

                layerGroups = {
                    sonarDetections: L.layerGroup(),
                    destroyed: L.layerGroup(),
                    ownShip: L.layerGroup(),
                    targets: L.layerGroup(),
                    ownshipTraveling: L.layerGroup()
                };

                _.each(layerGroups, function (layer, index) {
                    // by default we don't show the layer with targets
                    if ('targets' !== index) {
                        map.addLayer(layer);
                    }
                });
            };

            /**
             * Create or update markers on the map.
             * @param {Object} vessel
             */
            var vesselMarker = function (vessel) {
                if (leafletMarkers[vessel.name]) {
                    updateMarker(vessel);
                } else {
                    createMarker(vessel);

                    // set map center according to ownship marker location and set proper initial zoom
                    if (vessel.name === spatialViewController.ownShipName()) {
                        map.setView([vessel.state.location.lat, vessel.state.location.lng],
                            leafletMapConfig.initialZoom);
                    }
                }
            };

            /**
             * Adjust center of the map depends on ownship position.
             * @param {Object} vessel
             */
            var panMapToOwnship = function (vessel) {
                if (vessel.name === spatialViewController.ownShipName()) {

                    if (reviewTourController && reviewTourController.isRunning()) {
                        // don't bother panning to ownship, we're in a walkthrough
                        return;
                    } else {
                        // get the current location
                        var ownshipLocation = L.latLng(vessel.state.location);

                        // is this location visible?
                        if (!map.getBounds().contains(ownshipLocation)) {
                            // no, pan to show it
                            map.panTo(ownshipLocation);
                        }
                    }
                }
            };

            /**
             * Update marker position and icon angle on the map.
             * @param vessel
             */
            var updateMarker = function (vessel) {
                var marker = leafletMarkers[vessel.name];
                marker.setLatLng([vessel.state.location.lat, vessel.state.location.lng]);
                marker.setIconAngle(vessel.state.course);
            };

            /**
             * Create (and update) config object for a vessel marker.
             * @param {Object} vessel
             */
            var createMarker = function (vessel) {
                // produce the icon for this vessel type
                var vType = vessel.categories.type.toLowerCase();

                // ok, and the icon initialisation bits
                var iconSize;
                var icon;
                var marker;

                switch (vessel.categories.type) {
                    case "TORPEDO":
                    case "HELICOPTER":
                    case "FISHERMAN":
                        iconSize = 32;
                        break;
                    case "SUBMARINE":
                    case "REFERENCE":
                        iconSize = 48;
                        break;
                    case "MERCHANT":
                    case "WARSHIP":
                        iconSize = 64;
                        break;
                    default:
                        console.log("PROBLEM - UNRECOGNISED VEHICLE TYPE: " + vessel.categories.type);
                        break;
                }

                marker = new L.marker();
                marker.setIconAngle(vessel.state.course);
                marker.setLatLng([vessel.state.location.lat, vessel.state.location.lng]);

                if ('RED' === vessel.categories.force) {
                    // nope, hide it by default
                    layerGroups.targets.addLayer(marker);
                } else {
                    // ok, show it.
                    layerGroups.ownShip.addLayer(marker);
                }

                icon = L.icon({
                    iconAngle: 0,
                    iconUrl: 'img/vessels/' + iconSize + '/' + vType + '.png',
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize / 2, iconSize - iconSize / 5]
                });
                marker.setIcon(icon);

                leafletMarkers[vessel.name] = marker;
            };

            /**
             * Delete a marker from the map.
             * @param {Object} vessel
             */
            var deleteMarker = function (vessel) {
                if (map.hasLayer(leafletMarkers[vessel.name])) {
                    map.removeLayer(leafletMarkers[vessel.name]);
                }
                delete leafletMarkers[vessel.name];
            };

            /**
             * Add new a marker where target was destroyed by weapon.
             * @param {Object} vessel
             */
            var destroyedMarker = function (vessel) {
                var marker = leafletMarkers[vessel.name];
                var iconSize = 48;
                var icon;

                if (marker) {
                    icon = L.icon({
                        iconAngle: 0,
                        iconUrl: 'img/vessels/' + iconSize + '/' + 'tombstone.png',
                        iconSize: [iconSize, iconSize],
                        iconAnchor: [iconSize / 2, iconSize - iconSize / 5]
                    });

                    if (map.hasLayer(marker)) {
                        // remove layer from 'targets' layer
                        map.removeLayer(marker);
                    }

                    // update marker
                    marker.setIcon(icon);
                    marker.setIconAngle(0);

                    // add the marker to new layer
                    layerGroups.destroyed.addLayer(marker);

                    // we don't need to update the marker, remove it
                    // delete leafletMarkers[vessel.name];
                }
            };

            /**
             * Configure Review tour
             */
            var configureReviewTour = function () {
                if (!reviewTourController) {
                    return false;
                }

                var panToNarrativeMarker = function (narrativeStep) {
                    if (narrativeStep && !map.getBounds().contains(narrativeStep.latLng)) {
                        map.panTo(narrativeStep.latLng);
                    }
                };

                reviewTourController.setStepChangeListener(panToNarrativeMarker);
                
                map.on('movestart', function () {
                    reviewTourController.hideSteps();
                });

                map.on('moveend', function () {
                    if (layerGroups.narratives) {
                        var reviewStep = reviewTourController.currentStep();
                        var i = 0;
                        var showWalkthroughWindow = true;

                        // run loop to find all narratives markers on the layer
                        layerGroups.narratives.eachLayer(function (layer) {
                            if (!map.getBounds().contains(layer.getLatLng()) && reviewStep === i) {
                                // A narrative marker still is not visible on the map and it's target tour step.
                                // Hide the walkthrough window and set the flag to disable change the review tour
                                reviewTourController.hideSteps();
                                showWalkthroughWindow = false;
                            }

                            i++;
                        });

                        if (showWalkthroughWindow) {
                            reviewTourController.showCurrentStep();
                        }
                    }
                });
            };

            /**
             * Create Leaflet map.
             */
            var createMap = function () {
                map = new L.Map(element[0], {attributionControl: false});

                L.tileLayer(tileLayerUrl).addTo(map);

                configureLayers();
                addMapFeatures();
            };

            /**
             * Scale the map to show all target tracks
             * @param {Object} MultiPolyline routes
             */
            var scaleToRoutes = function (routes) {
                if (reviewTourController) {
                    map.fitBounds(routes.getBounds());
                }
            };

            /**
             * Change vessels' markers on the map.
             */
            scope.$on('changeMarkers', function (event, vessels) {
                _.each(vessels, function (vessel) {
                    vesselMarker(vessel);
                    panMapToOwnship(vessel);
                });
            });

            /**
             * Add narrative markers.
             */
            scope.$on('narrativeMarkers', function (event, entries) {
                var marker;

                layerGroups.narratives = L.layerGroup();
                var tourSteps = [];

                _.each(entries, function (entry) {
                    marker = new L.marker();
                    marker.setLatLng(entry.location);
                    marker.bindPopup(entry.message);

                    var icon = L.icon({
                        iconUrl: 'lib/leaflet/images/marker-icon.png',
                        iconSize: [25, 41],
                        iconAnchor: [25 / 2, 41],
                        className: entry.name
                    });
                    marker.setIcon(icon);


                    layerGroups.narratives.addLayer(marker);

                    tourSteps.push({
                        element: '.' + entry.name,
                        title: 'Narrative at ' + entry.timerLabel,
                        content: entry.message,
                        time: entry.time,
                        latLng: L.latLng(entry.location)
                    });
                });

                map.addLayer(layerGroups.narratives);


                if (reviewTourController) {
                    reviewTourController.setNarrativeSteps(tourSteps);
                }
            });

            /**
             * Show geoJSON map features.
             */
            scope.$on('showFeatures', function (event, features) {
                if (features) {
                    L.geoJson(features, {
                        style: {
                            clickable: false
                        }
                    }).addTo(map);
                }
            });

            /**
             * Add ownship traveling point.
             */
            scope.$on('addOwnshipTravelingPoint', function (event, latlngs) {
                if (latlngs) {
                    var circleMarker = L.circleMarker(latlngs, leafletMapConfig.ownshipPositionStyle);
                    layerGroups.ownshipTraveling.addLayer(circleMarker);
                    spatialViewController.updateOwnshipTravelingPoints(layerGroups.ownshipTraveling.getLayers());
                }
            });

            /**
             * Delete exprired ownship traveling point.
             */
            scope.$on('deleteOwnshipTravelingPoint', function (event, marker) {
                map.removeLayer(marker);
            });

            /**
             * Show sonar bearing lines.
             */
            scope.$on('addSonarDetection', function (event, latlngs) {
                if (sonarMultiPolyline) {
                    sonarMultiPolyline.setLatLngs(latlngs);
                } else {
                    sonarMultiPolyline = L.multiPolyline(latlngs, leafletMapConfig.sonarBearingLines);

                    layerGroups.sonarDetections.addLayer(sonarMultiPolyline);
                }
            });

            /**
             * Show vessel routes.
             */
            scope.$on('vesselRoutes', function (event, latlngs) {
                var vesselRoutesPolyline = L.multiPolyline(latlngs, leafletMapConfig.sonarBearingLines);
                layerGroups.vesselRoutes = L.layerGroup();
                layerGroups.vesselRoutes.addLayer(vesselRoutesPolyline);
                map.addLayer(layerGroups.vesselRoutes);

                scaleToRoutes(vesselRoutesPolyline);
            });

            /**
             * Change visibility of the layer with targets.
             */
            scope.$on('changeTargetsVisibility', function (event, visible) {
                if (visible) {
                    map.addLayer(layerGroups.targets);
                } else {
                    map.removeLayer(layerGroups.targets);
                }

                spatialViewController.setTargetsVisibility(visible);
            });

            /**
             * Add marker to reference location.
             */
            scope.$on('addReferenceMarker', function (event, reference) {
                createMarker(reference);
            });

            scope.$on('vesselsDestroyed', function (event, vessels) {
                if (!_.isArray(vessels)) {
                    vessels = [vessels]
                }

                _.each(vessels, function (vessel) {
                    if (vessel.wasDestroyed) {
                        destroyedMarker(vessel);
                    } else {
                        deleteMarker(vessel);
                    }
                });
            });

            /**
             * Callback when scope of the directive destroys
             */
            scope.$on('$destroy', function () {
                // clean up the Leaflet map
                map.remove();
            });

            createMap();
            configureReviewTour();
        }
    };
}]);
