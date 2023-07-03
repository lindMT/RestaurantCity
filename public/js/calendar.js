var startDate,
        endDate;
        
      $('#weekpicker').datepicker({
        autoclose: true,
        format :'mm/dd/yyyy',
        forceParse :false
    }).on("changeDate", function(e) {
        //console.log(e.date);
        var date = e.date;
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+6);
        //$('#weekpicker').datepicker("setDate", startDate);
        $('#weekpicker').datepicker('update', startDate);
        $('#weekpicker').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
    });
        
        
        //new
        $('#prevWeek').click(function(e){
          var date = $('#weekpicker').datepicker('getDate');
          //dateFormat = "mm/dd/yy"; //$.datepicker._defaults.dateFormat;
          startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()- 7);
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 1);
          $('#weekpicker').datepicker("setDate", new Date(startDate));
          $('#weekpicker').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
                 
          return false;
        });
        $('#nextWeek').click(function(){
          var date = $('#weekpicker').datepicker('getDate');
          //dateFormat = "mm/dd/yy"; // $.datepicker._defaults.dateFormat;
          startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+ 7);
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 13);
          $('#weekpicker').datepicker("setDate", new Date(startDate));
          $('#weekpicker').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
            
          return false;
        });