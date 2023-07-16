function addField() {
    // Add elements here
    var physicalWholeDivId = document.getElementById("physical-whole-div");

    var physicalAddBtnId = document.getElementById("physical-add-field-btn");
    var physicalAddTrId = document.getElementById("physical-partials-field");
    
    if(physicalAddBtnId){
        physicalAddBtnId.remove()
        // Replace button with "Remove Field for Partials"
    
        // ----- SIZING OPTION -----
        var sizingTd = document.createElement('td');
        sizingTd.setAttribute('id', 'physical-td-sizing');
        sizingTd.textContent = "Partials / Used";

        physicalAddTrId.appendChild(sizingTd)

        // ----- NET WEIGHT -----
        var netWtTd = document.createElement('td');
        netWtTd.setAttribute('id', 'physical-td-netwt');

        var netWtField = document.createElement('input');
        netWtField.setAttribute('id', 'physical-input-netwt');
        netWtField.setAttribute('class', 'form-control');
        netWtField.setAttribute('name', 'usedNetWt')
        netWtField.setAttribute('type', 'number')
        netWtField.setAttribute('placeholder', 'Net Wt.')
        netWtField.setAttribute('min', '1')
        netWtField.setAttribute('style', 'margin: auto; width: 50%;')
        netWtField.required = "true"

        netWtTd.appendChild(netWtField)
        physicalAddTrId.appendChild(netWtTd)

        // ----- UNIT -----
        var unitTd = document.createElement('td');
        unitTd.setAttribute('id', 'physical-td-unit');

        // Parent - <Select>
        var unitSelect = document.createElement('select')
        unitSelect.setAttribute('id', 'physical-select-unit')
        unitSelect.setAttribute('class', 'form-select form-select-md')
        unitSelect.setAttribute('name', 'usedUnit')
        unitSelect.setAttribute('style', 'margin: auto; width: 80%;')
        unitSelect.required = "true"

        // Get possible symbols
        var units = JSON.parse(document.querySelector('script[data-mydata]').getAttribute('data-mydata'));
        // Make options
        for(let i = 0; i < units.length; i++){      
            var unitOption = document.createElement('option')
            unitOption.setAttribute('value', units[i].unitSymbol)
            unitOption.text = units[i].unitSymbol + " " + "(" + units[i].unitName + ")"

            unitSelect.appendChild(unitOption)
        }

        unitTd.appendChild(unitSelect)
        physicalAddTrId.appendChild(unitTd)

        // ----- QUANTITY -----
        var qtyTd = document.createElement('td');
        qtyTd.setAttribute('id', 'physical-td-qty');
        qtyTd.textContent = "-";

        physicalAddTrId.appendChild(qtyTd)

        // ----- BUTTON -----
        var removeBtn = document.createElement("button");
        removeBtn.setAttribute('id', 'physical-input-remove-btn');
        removeBtn.setAttribute('class', 'btn btn-danger');
        removeBtn.setAttribute('style', 'width: 100%;');
        removeBtn.textContent = "Remove Fields for Partials";
        removeBtn.onclick = addField;

        physicalWholeDivId.appendChild(removeBtn);
    }else{
        // remove TR children
        // remove REMOVE BUTTON
        var removeBtnId = document.getElementById("physical-input-remove-btn")
        removeBtnId.remove();

        while(physicalAddTrId.firstChild){
            physicalAddTrId.removeChild(physicalAddTrId.firstChild);
        }

        var addBtn = document.createElement('button')
        addBtn.setAttribute('id', 'physical-add-field-btn')
        addBtn.setAttribute('class', 'btn btn-success')
        addBtn.setAttribute('style', 'width: 100%;')
        addBtn.textContent = 'Add Field for Partials / Used'
        addBtn.onclick = addField

        physicalWholeDivId.appendChild(addBtn)
        // id="physical-add-field-btn" class="btn btn-success" onclick="addField()" style="width: 100%;"
    }
}