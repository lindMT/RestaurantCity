function changeOptions1(){
    var ingreNameDiv = document.getElementById("add-ni-ingredient-div");
    var ingreNameSelectVal = document.getElementById("add-ni-ingredient-select").value;
    
    console.log(ingreNameSelectVal)

    // If == Others
    if(ingreNameSelectVal == "others"){
        var ingreNameTextInput = document.createElement("input");
        ingreNameTextInput.setAttribute('class', 'form-control');
        ingreNameTextInput.setAttribute('id', 'add-ni-ingredient-text');
        ingreNameTextInput.setAttribute('name', 'ingreName');
        ingreNameTextInput.setAttribute('type', 'text');
        ingreNameTextInput.setAttribute('placeholder', 'e.g. Cabbage, Oil, Coke');
        ingreNameTextInput.setAttribute('min', '1');
        ingreNameTextInput.setAttribute('style', 'margin-top: 10px; text-align: left; padding: 5px;');
        ingreNameTextInput.required = "true"

        ingreNameDiv.appendChild(ingreNameTextInput)
    }else{
        var ingreNameTextId = document.getElementById("add-ni-ingredient-text");

        if(ingreNameTextId){
            ingreNameTextId.remove();
        }
    }
}

function changeOptions2(){
    console.log("testing mo to lol")

    var options;
    var categorySelectVal = document.getElementById("add-ni-category-select").value;
    var unitSelectId = document.getElementById("add-ni-unit");
    
    if(categorySelectVal == "wet") {
        options = [
            { value: '', text: '-- Select Unit --' },
            { value: 'mL', text: 'mL (Milliliters)' },
            { value: 'L', text: 'L (Liters)' },
        ];
        console.log("Wet")
    } else {
        options = [
            { value: '', text: '-- Select Unit --' },
            { value: 'g', text: 'g (Grams)' },
            { value: 'kg', text: 'kg (Kilograms)' },
        ];
        console.log("Dry")
    }

    // Remove everything
    while (unitSelectId.options.length > 0) {
        unitSelectId.options.remove(0);
    }

    for (var i = 0; i < options.length; i++) {
        var unitOption = document.createElement('option');

        if (i === 0) {
            unitOption.disabled = true;
            unitOption.selected = true;
        }

        unitOption.value = options[i].value;
        unitOption.text = options[i].text;
        unitSelectId.appendChild(unitOption);
    }
}