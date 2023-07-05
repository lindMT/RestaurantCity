function addInputFields(){
    
}

const parentDiv = document.getElementById('form-row');

function duplicateForm() {
  let formRow = document.createElement('div');
  formRow.className = 'form-row';

  let formRowContent = document.getElementById('form-row-content').cloneNode(true);

  // Remove all label elements
  const labels = formRowContent.querySelectorAll('label');
  labels.forEach((label) => {
    label.remove();
  });

  formRow.appendChild(formRowContent);

  parentDiv.appendChild(formRow);

  // To have a margin when adding new Ingredient form
  formRow.style.marginTop = '10px';

}


