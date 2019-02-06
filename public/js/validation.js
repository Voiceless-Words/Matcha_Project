function _(id) {
       return document.getElementById(id);
   }

   const password = _("password");
   const confirm_password = _("confirm_password");
   const email = _("email");
   const confirm_email = _("confirm_email");
   const username = _('username');
   const pass_val = new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@])(?=.{8,16})");

   function validate_pass() {

       if (password.value === confirm_password.value) {
           confirm_password.setCustomValidity('');
       }
       else {
           confirm_password.setCustomValidity("Passwords Don't Match Dumb Ass");
       }

   }

   function validate_email() {

       if (email.value === confirm_email.value) {
           confirm_email.setCustomValidity('');
       } else {
           confirm_email.setCustomValidity("Emails Don't Match Dumb Ass");
       }
   }

   function check_regex() {
       if ((pass_val.test(password.value))) {
           password.setCustomValidity('');
       } else {
           password.setCustomValidity("At least one upper character and one lower character should be there At least one digit, and either ! or @ and min length 8");
       }
   }

   password.onchange = check_regex;
   password.onkeyup = check_regex;
   email.onchange = validate_email;
   confirm_email.onkeyup = validate_email;
   password.onchange = validate_pass;
   confirm_password.onkeyup = validate_pass;
