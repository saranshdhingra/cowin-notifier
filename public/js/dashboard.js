document.getElementById("addrequestForm").addEventListener("submit",function(e){
    e.preventDefault();
    const formData=new FormData(this),
        urlString = new URLSearchParams(formData).toString(),
        formEntries = formData.entries();

    let json = Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})));
    
    if(json.state=="-1"){
        document.getElementById("stateError").style.display="block";
    }
    else{
        document.getElementById("stateError").style.display="none";
    }
    if(json.district=="-1"){
        document.getElementById("districtError").style.display="block";
    }
    else{
        document.getElementById("districtError").style.display="none";
    }

    fetch(`/users/add?${urlString}`).
    then(response=>{
        new bootstrap.Modal(document.getElementById('addRequestModal'), {
            keyboard: false
          })
        window.location.reload();
    });
});

document.getElementById("stateControl").addEventListener("change",function(){
    const state=this.value;
    document.getElementById("districtControl").selectedIndex=0;

    document.getElementById("districtControl").querySelectorAll(".district").forEach(function(row){
        if(row.getAttribute("data-state")==state){
            row.classList.add("d-block");
            row.classList.remove("d-none");
        }
        else{
            row.classList.remove("d-block");
            row.classList.add("d-none");
        }
    });
});