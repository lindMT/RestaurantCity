function addInputFields(){
    var divId = document.getElementById("record-others-field");

    var selectId = document.getElementById("record-select-nu-input");
    var selectVal = selectId.value;

    if(selectVal == "others"){
        var netWt = document.createElement("input");
        netWt.setAttribute('class', 'form-control');
        netWt.setAttribute('id', 'record-netwt-field');
        netWt.setAttribute('name', 'ingreNetWt');
        netWt.setAttribute('type', 'number');
        netWt.setAttribute('placeholder', 'Net Wt. (Min: 1)');
        netWt.setAttribute('min', '1');
        netWt.setAttribute('style', 'margin-top: 10px; text-align: left; padding: 5px; width: 48%;');
        netWt.required = "true"

        var unit = document.createElement('select');
        unit.setAttribute('class', 'form-select');
        unit.setAttribute('id', 'record-unit-field');
        unit.setAttribute('name', 'ingreUnit');
        unit.setAttribute('style', 'margin-top: 10px; margin-left: 1%; padding: 5px; width: 51%;');
        unit.required = "true";

        // Create an array of option values and text
        
        var options = [
            { value: '', text: '-- Select a Unit --' },
            { value: 'g', text: 'g (Grams)' },
            { value: 'kg', text: 'kg (Kilograms)' },
            { value: 'mL', text: 'mL (Milliliters)' },
            { value: 'L', text: 'L (Liters)' },
        ];

        // grams, kilograms, milliliters, liters, ounces, pounds, fluid ounces

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

        divId.appendChild(netWt);
        divId.appendChild(unit);
        // input type="number" name="ingreQty" class="form-control" placeholder="Minimum: 1" min="1" max="10" style="text-align: left; width: 155px;" required>
    }else{
        var netWtFieldId = document.getElementById("record-netwt-field");
        var unitFieldId = document.getElementById("record-unit-field");

        if(netWtFieldId !== null && unitFieldId !== null){
            netWtFieldId.remove();
            unitFieldId.remove();
        }
    }
}