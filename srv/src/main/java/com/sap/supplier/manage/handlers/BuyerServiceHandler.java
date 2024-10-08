package com.sap.supplier.manage.handlers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import com.sap.cds.Result;
import com.sap.cds.Row;
import com.sap.cds.impl.builder.model.ExpandBuilder;
import com.sap.cds.ql.cqn.CqnSelect;
import com.sap.cds.ql.cqn.CqnUpdate;
import com.sap.cds.services.cds.CdsUpdateEventContext;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.draft.ActiveReadEventContext;
import com.sap.cds.services.draft.DraftService;
import com.sap.cds.services.environment.CdsProperties.Drafts;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.db.util.org.java_websocket.drafts.Draft;
import com.sap.supplier.manage.CqnModifier.BuyerServiceCqnModifier;
import com.sap.supplier.manage.dataProvider.TermValueDataProvider;

import cds.gen.buyerservice.BuyerService_;
import cds.gen.buyerservice.Event;
import cds.gen.buyerservice.Event_;
import cds.gen.buyerservice.Item;
import cds.gen.buyerservice.ItemTerms_;
import cds.gen.buyerservice.Item_;
import cds.gen.eventservice.EventService;

@Component
@RequestScope
@ServiceName(BuyerService_.CDS_NAME)
public class BuyerServiceHandler implements EventHandler {

    @Autowired
    private EventService eventService;

    @Autowired
    private BuyerServiceCqnModifier cqnModifier;

    @Autowired
    private TermValueDataProvider terValueDataProvider;

    @On(event = DraftService.EVENT_ACTIVE_READ)
    public void redirectReadToEventService(ActiveReadEventContext context) {
        CqnSelect cqn = cqnModifier.getNewCqn(context.getCqn());
        Result result = eventService.run(cqn);
        // Fetch all rows
        List<Row> rows = result.listOf(Row.class);
        rows.forEach(row -> {
            Map<String, Object> rowMap = row;
            rowMap.put("IsActiveEntity", true);
            row.putAll(rowMap);
        });
        context.setResult(result);
    }

    @After(entity = Event_.CDS_NAME)
    public void afterActiveEventReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
        if (termValueExpand == null) {
            return;
        }
        Result result = context.getResult();
        List<Event> events = result.listOf(Event.class);
        for (Event event : events) {
            for (Item item : event.getItems()) {
                terValueDataProvider.fillTermValues(item.getItemterms());
            }
        }
        context.setResult(events);
    }

    @After(entity = Item_.CDS_NAME)
    public void afterActiveItemReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
        if (termValueExpand == null) {
            return;
        }
        Result result = context.getResult();
        List<Item> items = result.listOf(Item.class);
        for (Item item : items) {
            terValueDataProvider.fillTermValues(item.getItemterms());
        }
        context.setResult(items);
    }

    @After(entity = ItemTerms_.CDS_NAME)
    public void afterActiveItemTermReadHandler(ActiveReadEventContext context) {
        ExpandBuilder termValueExpand = cqnModifier.getTermValueExpand(context.getCqn());
    }


    @On(event = { CqnService.EVENT_UPDATE }, entity = Event_.CDS_NAME)
    public void handleEventUpdate(CdsUpdateEventContext context) {
        List<Map<String, Object>> values = cqnModifier.getItemTermValueOnUpdateEvent(context.getCqn());
        CqnUpdate update = cqnModifier.removeItemTermValueOnUpdateEvent(context.getCqn());
        Result result = eventService.run(update);
        context.setResult(eventService.run(context.getCqn()));
    }  

}
