let knownroutes;//todo replace code to make this workaround obsolete

/**
 * Read json from remoteserver
 * @param remoteserver
 * @returns {Promise}
 */
const getroutesjson = (remoteserver) => {
    return new Promise((resolve, reject) => { //New promise for array
        // let routesjson = [];
        fetch(remoteserver, {
            method: "GET",
            headers: {'Content-Type': 'application/json'}
        }).then(res => {
            return res.json();
        }).then(json => {
            // console.log(json);
            const routesjson = json.map((f) => {
                return {data: f};
            });
            knownroutes = routesjson;
            console.log("knownroutes", knownroutes);
            resolve(routesjson);
        }).catch(reason => {
            reject(reason);
        });
    });
};

/***
 * Get new cuid from remoteserver
 * @param remoteserver
 * @returns {Promise}
 */
const getnewcuid = (remoteserver) => {
    return fetch(remoteserver + "/cuid", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            return res.json();
        })
        .then(json => {
            console.log("JSON:", json);
            return json;
        })
        .catch(err => {
            console.log("failed to fetch new cuid");
        });
};

/**
 * Post a textfile to the remoteserver
 * @param remoteserver
 * @param file
 * @returns {Promise}
 */
const posttextfile = (remoteserver = "", file = "") => {

    return new Promise((resolve, reject) => { //New promise for array
        const reader = new FileReader();
        //Send contents file when read
        reader.onloadend = (e) => {
            let error = false;
            const contents = e.target.result;
            // console.log(e.target.result);
            for (const i in knownroutes) {
                // console.log("data.xml",knownroutes[i].data.xml);
                if (e.target.result === knownroutes[i].data.xml) {
                    console.log("ROUTEMATCH FOUND!");
                    reject("Route bestaat al");
                    error = true;
                }
            }
            if (error === false) {
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            const res = JSON.parse(xhr.response);
                            console.log(res);
                            if (res.error === true) {
                                reject(res.msg);
                            } else {
                                resolve();
                            }
                        } else {
                            reject("Problem posting " + xhr.status);
                        }
                    }
                };

                xhr.open("POST", remoteserver);
                xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
                xhr.send(contents);
            }
        };
        reader.readAsText(file);
    });
};

//expose ajax functions
exports.getroutesjson = getroutesjson;
exports.posttextfile = posttextfile;
exports.getnewcuid = getnewcuid;
