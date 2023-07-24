// TODO: Remove categories if tatanggalin from DB

function addInputFields(){
    var divOthersId = document.getElementById("discard-others-field");

    var divQtyId = document.getElementById("discard-qty-field");
    var qtyFieldId = document.getElementById("discard-qty-input-field");
    var qtyLblId = document.getElementById("discard-qty-label");

    var selectId = document.getElementById("discard-select-nu-input");
    var selectVal = selectId.value;

    if(selectVal == "others"){
        console.log(selectId.value)

        var netWt = document.createElement("input");
        netWt.setAttribute('class', 'form-control');
        netWt.setAttribute('id', 'discard-netwt-field');
        netWt.setAttribute('name', 'ingreNetWt');
        netWt.setAttribute('type', 'number');
        netWt.setAttribute('step', 'any')
        netWt.setAttribute('placeholder', 'Net Wt.');
        netWt.setAttribute('style', 'margin-top: 10px; text-align: left; padding: 5px; width: 48%;');
        netWt.required = "true"

        var unit = document.createElement('select');
        unit.setAttribute('class', 'form-select');
        unit.setAttribute('id', 'discard-unit-field');
        unit.setAttribute('name', 'ingreUnit');
        unit.setAttribute('style', 'margin-top: 10px; margin-left: 1%; padding: 5px; width: 51%;');
        unit.required = "true";

        // Get possible symbols
        var units = JSON.parse(document.querySelector('script[data-mydata]').getAttribute('data-mydata'));
        // Make options
        for(let i = 0; i < units.length; i++){      
            var unitOption = document.createElement('option')
            unitOption.setAttribute('value', units[i].unitSymbol)
            unitOption.text = units[i].unitSymbol + " " + "(" + units[i].unitName + ")"

            unit.appendChild(unitOption)
        }

        divOthersId.appendChild(netWt);
        divOthersId.appendChild(unit);

        qtyFieldId.remove();
        qtyLblId.remove();
        // input type="number" name="ingreQty" class="form-control" placeholder="Minimum: 1" min="1" max="10" style="text-align: left; width: 155px;" required>
    }else{
        var netWtFieldId = document.getElementById("discard-netwt-field");
        var unitFieldId = document.getElementById("discard-unit-field");

        if(netWtFieldId !== null && unitFieldId !== null){
            netWtFieldId.remove();
            unitFieldId.remove();
        }

        if (qtyFieldId === null){
            var qtyInput = document.createElement("input");
            qtyInput.setAttribute('class', 'form-control');
            qtyInput.setAttribute('id', 'discard-qty-input-field');
            qtyInput.setAttribute('name', 'ingreQty');
            qtyInput.setAttribute('type', 'number');
            qtyInput.setAttribute('placeholder', 'Minimum: 1');
            qtyInput.setAttribute('min', '1');
            qtyInput.setAttribute('style', 'text-align: left; padding: 5px; width: 100%;');
            qtyInput.required = "true"

            var qtyLbl = document.createElement("label");
            qtyLbl.setAttribute('id', 'discard-qty-label')
            qtyLbl.textContent = "Quantity"

            divQtyId.appendChild(qtyLbl);
            divQtyId.appendChild(qtyInput);
        }
    }
}