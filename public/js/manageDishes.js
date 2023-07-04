function deleteRow(){
    document.querySelectorAll('#dishTable .select:checked').forEach(e => {
      e.closest('tr').remove();
    });
  }

