SPOORZOEKEN — RADIO-PAGINA PUZZEL X

Bestanden:
- puzzel-x.html       De pagina
- radio.png           De aangeleverde houten radio
- css/puzzel-x.css    Extra radio-opmaak; gebruikt daarnaast css/stijl.css uit de bestaande website
- js/puzzel-x.js      Bediening van schaal, aanwijzer, draaiknop en audio
- js/radio-config.js  Instelbare golflengtes en koppelingen naar audiobestanden
- audio/              Plaats hier later de audiobestanden

Plaats de bestanden in de root van de bestaande website en behoud de mappenstructuur.
De bestaande map css moet al stijl.css bevatten. De radio-pagina verwijst daar bewust naar.

Uitzending toevoegen:
Open js/radio-config.js en voeg in stations een regel toe, bijvoorbeeld:
{ wavelength: 425, title: "Avondconcert", audio: "audio/avondconcert.mp3", tolerance: 4 }
Plaats daarna avondconcert.mp3 in de map audio.

De frequentieschaal is voorlopig ingesteld op 200 t/m 1000 meter. Dit is eenvoudig aan te passen in radio-config.js.
De pagina gebruikt voorlopig geen antwoordcontrole en is nog niet gekoppeld aan puzzelnummering of voortgang.
