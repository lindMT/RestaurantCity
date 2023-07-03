document.querySelector('.user-form').addEventListener('submit', function(event) {
    event.preventDefault(); // prevent submit

    var password1 = document.querySelector("input[type='password'][name='password1']").value;
    var password2 = document.querySelector("input[type='password'][name='password2']").value;

    if (password1 !== password2) {
        document.getElementById('prompt').textContent = "Please match the passwords";
        document.querySelector("input[type='password'][name='password1']").value = "";
        document.querySelector("input[type='password'][name='password2']").value = "";
    } else {
        document.getElementById('prompt').textContent = ""; // Clear the prompt if passwords match
        this.submit(); // submit
    }
});