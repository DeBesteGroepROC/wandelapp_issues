/**
 * Created by roctilburg on 30-05-16.
 */
const   tj          = require('togeojson'),
    fs          = require('fs'),
    // jsdom       = require('jsdom').jsdom, // node doesn't have xml parsing or a dom. use jsdom
    //libxmljs NOT WORKING IN OPENSHIFT (which is Linux), xmldom is a better option
    DOMParser      = require('xmldom').DOMParser,
    cuid        = require('cuid');


//Factory function returns converter object
const converter = (() => {
    'use strict';

    let self = {
        data : {error: false, msg: ''},
        gpx_to_geojson: (path_gpx) => {
            'use strict';

            return new Promise((resolve, reject) => { //New promise
                fs.readFile(path_gpx, 'utf8', (err, xml_string) => {
                    'use strict';

                    let xml_parsed;
                    //Error reading file from disc
                    if (err) {
                        self.data.error = true;
                        self.data.msg = err;
                        reject(self.data);
                    }

                    //Validate xml with xmldom
                    try {
                        xml_parsed = new DOMParser(
                            {
                                locator: {},
                                errorHandler: (level, msg) => {
                                    self.data.error = true;
                                    self.data.msg = "ERROR: " + level + msg;
                                    reject(self.data);
                                }
                            }
                        ).parseFromString(xml_string, 'text/xml');
                    }
                    catch (err){
                        self.data.error = true;
                        self.data.msg = "ERROR: " + err;
                        reject(self.data);
                    }
                    //Parse xml and convert it to geojson
                    self.data._id = self.cuid || cuid();
                    self.data.filename = path_gpx;
                    self.data.xml = xml_string;
                    self.data.json = tj.gpx(xml_parsed); //here
                    resolve(self.data);

                });
            });
        }
    };
    return self;
})();

exports.converter = converter;
