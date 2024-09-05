package com.sap.supplier.manage.dataProvider;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sap.cds.Result;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnStar;

import cds.gen.buyerservice.ItemTermValues;
import cds.gen.eventservice.EventService;
import cds.gen.eventservice.ItemTerms;
import cds.gen.eventservice.ItemTerms_;

@Component
public class TermValueDataProvider {

    @Autowired
    private EventService eventService;

    public void fillTermValues(List<cds.gen.buyerservice.ItemTerms> terms){
        for (cds.gen.buyerservice.ItemTerms itemTerm : terms) {

                Select<ItemTerms_> select = Select.from(ItemTerms_.class).columns(Arrays.asList(CqnStar.star())).where(itemterm -> itemterm.ID().eq(itemTerm.getId()));
                Result result = eventService.run(select);
                ItemTerms itemTermFull = result.first(ItemTerms.class).orElse(null);

                // Create a new TermValue list for each ItemTerms
                List<ItemTermValues> termValues = new ArrayList<>();

                // Create a TermValue object
                ItemTermValues termValue = ItemTermValues.create();

                termValue.setTermEventId(itemTermFull.getTermEventId());
                termValue.setItemId(itemTermFull.getItemId());
                termValue.setTermId(itemTermFull.getTermId());   
                if(itemTermFull.getTermId().equals("PRICE"))
                    termValue.setValue("10");


                // Add the TermValue to the list
                termValues.add(termValue);

                // Set the TermValue list back to the ItemTerms
                itemTerm.setTermValue(termValues);
            }
    }

}
