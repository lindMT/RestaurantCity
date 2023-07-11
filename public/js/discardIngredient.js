function addInputFields(){
    var divOthersId = document.getElementById("discard-others-field");

    var divQtyId = document.getElementById("discard-qty-field");
    var qtyFieldId = document.getElementById("discard-qty-input-field");
    var qtyLblId = document.getElementById("discard-qty-label");

    var categoryInputId = document.getElementById("discard-select-category");
    var categoryInputVal = categoryInputId.value;

    var selectId = document.getElementById("discard-select-nu-input");
    var selectVal = selectId.value;

    if(selectVal == "others"){
        console.log(selectId.value)
        var options;

        var netWt = document.createElement("input");
        netWt.setAttribute('class', 'form-control');
        netWt.setAttribute('id', 'discard-netwt-field');
        netWt.setAttribute('name', 'ingreNetWt');
        netWt.setAttribute('type', 'number');
        netWt.setAttribute('placeholder', 'Net Wt. (Min: 1)');
        netWt.setAttribute('min', '1');
        netWt.setAttribute('style', 'margin-top: 10px; text-align: left; padding: 5px; width: 48%;');
        netWt.required = "true"

        var unit = document.createElement('select');
        unit.setAttribute('class', 'form-select');
        unit.setAttribute('id', 'discard-unit-field');
        unit.setAttribute('name', 'ingreUnit');
        unit.setAttribute('style', 'margin-top: 10px; margin-left: 1%; padding: 5px; width: 51%;');
        unit.required = "true";

        // Create an array of option values and text
        
        console.log(categoryInputVal)

        if(categoryInputVal == "wet"){
            options = [
                { value: '', text: '-- Select a Unit --' },
                { value: 'mL', text: 'mL (Milliliters)' },
                { value: 'L', text: 'L (Liters)' },
            ];

            console.log("Wet")
        }else{
            options = [
                { value: '', text: '-- Select a Unit --' },
                { value: 'g', text: 'g (Grams)' },
                { value: 'kg', text: 'kg (Kilograms)' },
            ];

            console.log("Dry")
        }

        // grams, kilograms, milliliters, liters

        // Create and append the option elements
        for (var i = 0; i < options.length; i++) {
            var unitOption = document.createElement('option');

            if (i === 0) {
                unitOption.disabled = true;
                unitOption.selected = true;
            }

            unitOption.value = options[i].value;
            unitOption.text = options[i].text;
            unit.appendChild(unitOption);
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
            console.log("pasok oh")

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