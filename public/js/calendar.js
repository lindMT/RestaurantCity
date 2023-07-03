// TO-DO: Error-check clickable until user date only.

// Current date (Top right, readable format)
const date = new Date().toDateString();
document.getElementById("current_date").innerHTML = date;
// Date generated
const date2 = new Date().toLocaleString();
document.getElementById("date_generated").innerHTML = date2;

const calendar =  document.getElementById("calendar");


// Report Type
function reportType(value) {
  alert(value);
  switch(value) {
    case "1":
      // code block
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

// WEEKLY
function weeklyRange() {

  calendar.type = 'text';
  calendar.classList.add("form-control");

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
  $('#calendar').datepicker( "destroy" )
  calendar.type = 'month';
  calendar.classList.remove("form-control");
  calendar.removeAttribute("readonly");
}