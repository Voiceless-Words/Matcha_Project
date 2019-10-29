function showPosition() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById("latitude").value = position.coords.latitude;
            document.getElementById("longitude").value = position.coords.longitude;
        },        function error(error_message) {
            // for when getting location results in an error
            function ipLookUp () {
                $.ajax('http://ip-api.com/json')
                .then(
                    function success(response) {
                        document.getElementById("lat").hidden = true;
                        document.getElementById("lon").hidden = true;
                        document.getElementById("latitude").value = response.lat;
                        document.getElementById("longitude").value = response.lon;
                    },
              
                    function fail(data, status) {
                        console.log('Request failed.  Returned status of',
                                    status);
                    }
                );
              }
              ipLookUp()
            alert("they said NO");
          } );
 
    } else {
        alert("Sorry, your browser does not support HTML5 geolocation.");
    }
}