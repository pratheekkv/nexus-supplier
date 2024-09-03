using BuyerService as service from '../../srv/BuyerService';

annotate service.Event with @(UI: {
ConnectedFields #ConnectedData   : {
        Label : 'Event Bidding End',
        Template: '{biddingEnd} - {biidingEndUnit}',
        Data: {
         biddingEnd:   {
                $Type             : 'UI.DataField',
                Value             : biddingEnd,
                ![@UI.Importance] : #High
            },
        biddingEndUnit: {
                $Type             : 'UI.DataField',
                Value             : biidingEndUnit,
                ![@UI.Importance] : #High
            }
        }
    },
    FieldGroup #BiddingRules: {
      Data : [
        { 
          $Type: 'UI.DataField', 
          Value: startBidOnPublish, 
          ![@Common.FieldControl] : #ReadOnly, 
          Label : 'Start bidding right after event is published' 
        } ,
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.ConnectedFields#ConnectedData'
        },
        { 
          $Type: 'UI.DataField',
          Value: awardDate, 
          Label : 'Estimated Award Date'
        }
      ]
    },

  LineItem: [

        {
            $Type: 'UI.DataField',
            Value: description,
            Label : 'Description' 
        },
        {
            $Type: 'UI.DataField',
            Value: type_id,
            Label : 'Event Type' 
        },
        {
            $Type: 'UI.DataField',
            Value: createdBy,
            ![@Common.FieldControl] : #ReadOnly,
            Label : 'Created By' 
        },
        {
            $Type: 'UI.DataField',
            Value: owner,
            ![@Common.FieldControl] : #ReadOnly,
            Label : 'Owner' 
        },
        {
            $Type: 'UI.DataField',
            Value: status,
            Label : 'Status' 
        }       
    ]
    
});