import Ractive from 'ractive';
import Map from './map';
import {getroutesjson, posttextfile, getnewcuid} from './routes';

// Hiking app
const hikingapp = (remoteserver) => {
    'use strict';

    //Init

    var cuid = localStorage.getItem("cuid") || "test";


    const ractive_ui = new Ractive({
        el: '#container',
        template: '#template',
        debug: true
    });
    let map = null;


    ractive_ui.on('complete', () => {

        //New mapbox-gl map
        map = new Map();
        const geo_options = {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
        };

        //Get routes from server and show these as choices
        getnewcuid(remoteserver).then(value => {
            if (cuid === "test") {
                cuid = value["cuid"];
                localStorage.setItem("cuid", cuid);
                console.log("received new cuid",cuid);
            } else {
                console.log("using cached cuid:", cuid);
            }
        }).then(() => {
            getroutesjson(remoteserver + '/routes?cuid=' + cuid)
                .then((routesjson) => {
                    console.log(routesjson);
                    ractive_ui.set("hikes", routesjson);
                }, (reason) => {
                    console.log(reason);
                })
                .catch((e) => {
                    console.log(e);
                });
        });

        //Update device location on map
        navigator.geolocation.watchPosition(map.geo_success.bind(map), null, geo_options);
    });

    //Events
    ractive_ui.on({
            'collapse': (event, filename, routeobj) => {


                const items = document.querySelectorAll(".item");
                const route = document.querySelector("#route" + filename);
                items.forEach(item => {
                    item.style.display="none";
                });
                route.style.display="";
                map.showroute(routeobj.data.json);
            },
            'uploadgpx': (event) => {
                const file = event.original.target.files[0];
                const item = document.querySelector("#item");
                if (file) {
                    //Post route (gpx text file) async
                    posttextfile(remoteserver + '/upload?cuid=' + cuid, file)
                        .then(
                            () => {
                                //Retreive the latest routes async
                                getroutesjson(remoteserver + '/routes?cuid=' + cuid)
                                    .then(
                                        (routesjson) => {
                                            //Show success
                                            item.innerHTML = "Route is toegevoegd";
                                            ractive_ui.set("hikes", routesjson);
                                            //Show chosen route
                                            map.showroute(routesjson[0].data.json);
                                        },
                                        (reason) => {
                                            //error
                                            item.innerHTML = reason;
                                        }
                                    )
                                    .catch(
                                        (reason) => {
                                            //error
                                            item.innerHTML = reason;
                                        }
                                    )
                                ;
                            }
                        )
                        .catch(
                            (e) => {
                                item.html(e);
                            }
                        )
                    ;
                }
            }
        }
    );
};

//Expose ractive functions
exports.hikingapp = hikingapp;
