function addQty(){
    // Add elements here
    var qtyDivId = document.getElementById("record-first-qty-div");

    // Add qty input field - element
    var qtyBtnId = document.getElementById("record-first-qty-btn");

    // If button exists, replace "record-first-qty-btn" with (1) label, (2) input field, (3) remove qty btn
    if(qtyBtnId){
        qtyBtnId.remove()

        // (1) Label
        var qtyLbl = document.createElement("label");
        qtyLbl.setAttribute('id', 'discard-qty-label')
        qtyLbl.textContent = "Quantity"

        // (2) Input Field
        var qtyInput = document.createElement("input");
        qtyInput.setAttribute('class', 'form-control');
        qtyInput.setAttribute('id', 'discard-qty-input-field');
        qtyInput.setAttribute('name', 'ingreQty');
        qtyInput.setAttribute('type', 'number');
        qtyInput.setAttribute('placeholder', 'Minimum: 1');
        qtyInput.setAttribute('min', '1');
        qtyInput.setAttribute('style', 'text-align: left; width: 100%;');
        qtyInput.required = "true"

        // (3) Remove Btn
        var qtyRemove = document.createElement("button");
        qtyRemove.setAttribute('id', 'record-first-qty-remove-btn');
        qtyRemove.setAttribute('class', 'btn btn-danger');
        qtyRemove.setAttribute('name', 'ingreQty');
        qtyRemove.setAttribute('style', 'margin-top: 25px; width: 100%;');
        qtyRemove.textContent = "Remove Quantity Input Field";
        qtyRemove.onclick = addQty;

        qtyDivId.appendChild(qtyLbl);
        qtyDivId.appendChild(qtyInput);
        qtyDivId.appendChild(qtyRemove);
    }else{
        // If does not exist, replace (1) label, (2) input field, (3) remove qty btn with "record-first-qty-btn"
        var qtyLbl = document.getElementById("discard-qty-label");
        var qtyInput = document.getElementById("discard-qty-input-field");
        var qtyRemove = document.getElementById("record-first-qty-remove-btn");

        qtyLbl.remove();
        qtyInput.remove();
        qtyRemove.remove();

        var qtyAddBtn = document.createElement("button");
        qtyAddBtn.setAttribute('id', 'record-first-qty-btn');
        qtyAddBtn.setAttribute('class', 'btn btn-success');
        qtyAddBtn.setAttribute('style', 'color: white; width: 100%;');
        qtyAddBtn.textContent = "Add Quantity";
        qtyAddBtn.onclick = addQty;

        qtyDivId.appendChild(qtyAddBtn)

        // id="record-first-qty-btn" class="btn btn-success" onclick="addQty()" style="color: white; width: 100%;"
    }
}