
it("should at least run without fails!", () => {
  fetch('http://localhost:3000/sessions/login',{ 
    method:'POST',
    headers:{
      'Content-type':'text/json'
    },
    body:JSON.stringify({"email":"fu","password":"bar"}),
  }).then( (response) => {
    console.log(response);
  })
});