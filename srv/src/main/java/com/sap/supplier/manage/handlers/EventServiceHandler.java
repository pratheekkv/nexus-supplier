package com.sap.supplier.manage.handlers;

import java.util.Collections;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import com.sap.cds.Result;
import com.sap.cds.ResultBuilder;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnSource;
import com.sap.cds.services.cds.CdsReadEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.ActiveReadEventContext;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;

import cds.gen.buyerservice.ItemTermValues_;
import cds.gen.eventservice.EventService_;
import cds.gen.eventservice.Event_;

@Component
@RequestScope
@ServiceName(EventService_.CDS_NAME)
public class EventServiceHandler implements EventHandler{


    @Before(entity = Event_.CDS_NAME, event = CqnService.EVENT_READ)
    public void readEvent(CdsReadEventContext ctx){
        System.out.println("EventReadInEventService");
    }

}
