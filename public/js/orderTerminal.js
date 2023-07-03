function addDishItem(clickedDish){
    var dishName = clickedDish.querySelector("[name='dish-name']").innerHTML;
    var dishPrice = clickedDish.querySelector("[name='dish-price']").innerHTML;
    var newDishId = clickedDish.querySelector("input[type='hidden'][name='dish-id']").value;
    var dishIsInTable = false;
    var table = document.getElementById("order-terminal-table");
    var n = table.rows.length;
    // alert(dishId);

    // check if dish is in table
    for (var r = 1; r < n; r++) {
        var hiddenInput = table.rows[r].cells[4].querySelector("input[type='hidden']");
        var rowDishId = hiddenInput.value;

        if (rowDishId == newDishId){ // dish in table already
            var numberInput = table.rows[r].cells[1].querySelector("input[type='number']");
            numberInput.value = parseInt(numberInput.value) + 1;
            dishIsInTable = true;
            break;
        }
    }

    if(!dishIsInTable){ // dish is NOT in table
        var table = document.getElementById("order-terminal-table");
        var tbody = table.getElementsByTagName("tbody")[0];
        var row = tbody.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);

        cell1.style.textAlign = "left";
        cell2.style.textAlign = "center";
        cell3.style.textAlign = "right";
        //cell 4 

        cell1.innerHTML = dishName;
        cell2.innerHTML = "<input type='number' value='1' min='1' onchange='calculateTotalPrice()'>";
        cell3.innerHTML = dishPrice;
        cell4.innerHTML = "<i onclick='removeDishItem(\"" + newDishId + "\")' class='fa-solid fa-x fa-xs' style='color: #000000;'></i>";
        cell5.innerHTML = "<input type='hidden' value='" + newDishId + "'>";
    } 

    calculateTotalPrice()
}


function removeDishItem(removeDishId){
    var table = document.getElementById("order-terminal-table");
    var n = table.rows.length;

    for (var r = 1; r < n; r++) {
        var hiddenInput = table.rows[r].cells[4].querySelector("input[type='hidden']");
        var rowDishId = hiddenInput.value;

        if (rowDishId == removeDishId){ // dish found
            table.deleteRow(r);
            break;
        }
    }

    calculateTotalPrice()
}

function calculateTotalPrice(){
    var table = document.getElementById("order-terminal-table");
    var n = table.rows.length;
    var totalPrice = 0.00;

    // no dishes
    if(n<=1){
        document.getElementById("totalPrice").innerHTML = "Php 0.00"
    }
    
    // get running total
    for (var r = 1; r < n; r++) {
        var rawQty = table.rows[r].cells[1].querySelector("input[type='number']");
        var parsedQty = rawQty.value;

        var rawDishPrice = table.rows[r].cells[2].innerHTML;
        var parsedDishPrice = parseFloat(rawDishPrice.split(" ")[1]).toFixed(2);
        totalPrice += (parsedQty * parsedDishPrice);
    }

    document.getElementById("totalPrice").innerHTML = "Php " + totalPrice.toFixed(2);
}


function filterDishes(clickedCategory) {
    var category = clickedCategory.innerHTML.trim();
    var dishList = document.getElementById("order-item-holder");

    var orderItems = dishList.getElementsByClassName("order-item");
    for (var i = 0; i < orderItems.length; i++) {
        var dishCategory = orderItems[i].querySelector("[name='dish-category']").value;
        if (dishCategory == category ||  category == "All") {
            orderItems[i].style.display = "block";
        } else {
            orderItems[i].style.display = "none";
        }
    }
}
