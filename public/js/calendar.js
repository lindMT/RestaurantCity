// TO-DO: Error-check clickable until user date only.

// Date generated
const date = new Date().toLocaleString();
document.getElementById("current_date").innerHTML = date;

const calendar =  document.getElementById("calendar");


// Report Type
function reportType(value) {
  alert(value);
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
  $('#calendar').datepicker( "destroy" );
  $('#calendar').datepicker({
    autoclose: true,
    format :'mm/dd/yyyy',
    forceParse :false
  })
}

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
  $('#calendar').datepicker( "destroy" );
  calendar.type = 'month';
  calendar.classList.remove("form-control");
  //   calendar.attr({
  //     "max" : date.getFullYear+"-"+date.getMonth
  //  });
  calendar.removeAttribute("readonly");
}