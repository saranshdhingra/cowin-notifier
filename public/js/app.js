document.getElementById("emailBtn").addEventListener("click",function(){
    registerEmail();
});

document.getElementById("email").addEventListener("keydown",function(e){
    if(e.code==="Enter"){
        registerEmail();
    }
});

function registerEmail(){
    const email=document.getElementById("email").value;
    fetch('/register-email',{
        method:'post',
        body:JSON.stringify({email:email})
    }).
    // then(response=>response.json()).
    then((data)=>{
        window.location.href=`/dashboard?user=${email}`;
    });

}