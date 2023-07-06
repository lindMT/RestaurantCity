function changeOptions(){
    var options;
    var categorySelectVal = document.getElementById("add-ni-category").value;
    var unitSelectId = document.getElementById("add-ni-unit");
    
    if(categorySelectVal == "wet") {
        options = [
            { value: '', text: '-- Select a Unit --' },
            { value: 'mL', text: 'mL (Milliliters)' },
            { value: 'L', text: 'L (Liters)' },
            { value: 'fl oz', text: 'fl oz (Fluid Ounces)' },
        ];
        console.log("Wet")
    } else {
        options = [
            { value: '', text: '-- Select a Unit --' },
            { value: 'g', text: 'g (Grams)' },
            { value: 'kg', text: 'kg (Kilograms)' },
            { value: 'oz', text: 'oz (Ounces)' },
            { value: 'lb', text: 'lbs (Pounds)' },
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