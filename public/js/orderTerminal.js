function addDishItem(clickedDish){
    var dishName = clickedDish.querySelector("[name='dish-name']").innerHTML;
    var dishPrice = clickedDish.querySelector("[name='dish-price']").innerHTML;

    var table = document.getElementById("order-terminal-table");
    var row = table.insertRow();

    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.style.textAlign = "left";
    cell2.style.textAlign = "center";
    cell3.style.textAlign = "right";

    cell1.innerHTML = dishName;
    cell2.innerHTML = "<input type='number'>";
    cell3.innerHTML = dishPrice;
}