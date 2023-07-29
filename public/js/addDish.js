function addInputFields(){
    
}

const parentDiv = document.getElementById('form-row');

function duplicateForm() {
  let formRow = document.createElement('div');
  formRow.className = 'form-row';
  formRow.style.display = "flex";

  let formRowContent = document.getElementById('form-row-content').cloneNode(true);

  // Remove all label elements
  const labels = formRowContent.querySelectorAll('label');
  labels.forEach((label) => {
    label.remove();
  });

  const btns = formRowContent.querySelectorAll('button');
  btns.forEach((btn) => {
    btn.style.display = "block";
  });

  formRow.appendChild(formRowContent);

  parentDiv.appendChild(formRow);

}

function removeForm(button) {
  // Find the parent form row element
  const formRow = button.closest('.form-row');

  // If the formRow exists, remove it
  if (formRow) {
    formRow.remove();
  } else {
    // If formRow does not exist, it might be a dynamically added row
    // So, remove the parent of the button, which should be the dynamically added row
    button.parentElement.parentElement.remove();
  }
}
