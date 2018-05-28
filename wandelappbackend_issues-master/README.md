# wandelappbackend
Backend for gpx routes. It is used by students when developing a webapp.

## Voor de student
Je kunt deze service gebruiken om routes (gpx bestanden) te bewaren op de server waar deze service draait.
Ook kun je die routes weer ophalen!

Als je een route upload wordt daarbij een uniek nummer opgeslagen.
Bij het ophalen worden alleen de routes getoond die bij de cuid horen.

In de wandelapp die jullie moeten verbeteren wordt als cuid 'test' gebruikt.
Iedereen krijgt met dit cuid altijd alle routes te zien.
Een van de issues die openstaan in de wandelapp is dit uniek te maken. 
 
## Mogelijke requests

### GET __/__

Deze lijst

***

### GET __/cuid__

Voor het aanvragen van een nieuw identificatienummer.
Geeft een CUID terug waarmee het device zich later kan identificeren.
Deze is te gebruiken om alleen de routes op te halen die bij een id horen.

***

### GET __/routes?cuid=\<cuid dat eerder is aangevraagd\>__

Alle routes behorende bij een opgegeven <cuid>.
Als nog geen cuid, dan een aanvragen via get/cuid.
 
Resultaat als json:

[

{
"_id":"",
"error":false/true,
"msg":"",
"filename":"",
"xml": "",
"json":"",
"cuid":""
},

{
"_id":"",
"error":false/true,
"msg":"",
"filename":"",
"xml": "",
"json":"",
"cuid":""
},

{ ... },

...


]


***

### POST __/upload?cuid=\<cuid dat eerder is aangevraagd\>__

Voor het uploaden van nieuwe gpx bestanden als plain/text.
Key / value meegeven: cuid=\<eerder aangevraagde cuid\>  

Bij juiste upload:
{error: false, msg: "OK"}

Bij onjuiste upload:
{error: true, msg: "Invalid file"}


***

### GET __/health__

Geeft 'Im OK!'
