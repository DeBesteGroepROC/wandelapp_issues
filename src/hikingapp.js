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
                console.log("received new cuid", cuid);
            } else {
                console.log("using cached cuid:", cuid);
            }
        }).then(() => {
            getroutesjson(remoteserver + '/routes?cuid=' + cuid)
                .then((routesjson) => {
                    console.log(routesjson);
                    ractive_ui.set("hikes", routesjson);
                    const loader = document.getElementById("loader");
                    // console.log("loader",loader);
                    loader.classList.add("done");
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
                    item.style.display = "none";
                });
                route.style.display = "block";
                map.showroute(routeobj.data.json);
            },
            'uploadgpx': (event) => {
                const file = event.original.target.files[0];
                const info = document.querySelector("#info");

                if (file) {
                    //Post route (gpx text file) async
                    posttextfile(remoteserver + '/upload?cuid=' + cuid, file)
                        .then(
                            () => {
                                //Retreive the latest routes async
                                getroutesjson(remoteserver + '/routes?cuid=' + cuid)
                                    .then(
                                        (routesjson) => {
                                            info.innerHTML = "Route is toegevoegd";
                                            ractive_ui.set("hikes", routesjson);
                                            console.log(routesjson);
                                            // hier onder aangepast:
                                            map.showroute(routesjson[routesjson.length - 1].data.json);

                                        },
                                        (reason) => {
                                            //error
                                            console.error(reason);
                                        }
                                    )
                                    .catch(
                                        (reason) => {
                                            //error
                                            console.error(reason);
                                        }
                                    )
                                ;
                            }
                        )
                        .catch(
                            (e) => {
                                console.error(e);
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
