sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'manageevent/test/integration/FirstJourney',
		'manageevent/test/integration/pages/EventList',
		'manageevent/test/integration/pages/EventObjectPage'
    ],
    function(JourneyRunner, opaJourney, EventList, EventObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('manageevent') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheEventList: EventList,
					onTheEventObjectPage: EventObjectPage
                }
            },
            opaJourney.run
        );
    }
);