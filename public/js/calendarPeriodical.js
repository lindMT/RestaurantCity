// TO-DO: Error-check clickable until user date only.

// Date generated
const date = new Date().toLocaleString();
document.getElementById("current_date").innerHTML = date;
document.getElementById("current_date2").innerHTML = date;
// document.getElementByClassName("current_date").innerHTML = date;


// Report Type
function reportType(value) {
  switch(value) {
    case "1":
      dayRange();
      break;
    case "2":
      weeklyRange();
      break;
    case "3":
      monthlyRange();
      break;
    case "4":
      // code block
      break;
    default:
      // code block
  }
  // calendar.setAttribute("onclick='reportType("+value+")'");
}

// DAILY
function dayRange() {
  $('#calendar').off("changeDate");
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
  })
}

// WEEKLY
function weeklyRange() {
  var startDate, endDate;
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
  }).on("changeDate", function(e) {
      //console.log(e.date);
      var date = e.date;
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+6);
      //$('#calendar').datepicker("setDate", startDate);
      $('#calendar').datepicker('update', startDate);
      $('#calendar').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
  });
}

// MONTHLY
function monthlyRange() {
  $('#calendar').datepicker( {
    autoclose: true,
    format: "mm-yyyy",
    startView: "months", 
    minViewMode: "months"
  });
}