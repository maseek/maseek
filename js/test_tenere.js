function test() {

  function getTenereUrl(hash) {
    return "https://cdn.staging.loop11.com/tenere/?fp=" + hash;
  }

  function setTenereUrl(hash, value) {
    return "https://cdn.staging.loop11.com/tenere/?fp=" + hash + "&data=" + value;
  }

  function getTenere(hash, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', getTenereUrl(hash), true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var response = xhr.response;
        if (typeof response === "string") {
          if (response === "") {
            callback(null);
          } else {
            callback(JSON.parse(response));
          }
        } else {
          callback(xhr.response);
        }
      }
    };
    xhr.send();
  }

  function setTenere(hash, value, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', setTenereUrl(hash, value), true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var response = xhr.response;
        if (typeof response === "string") {
          callback(JSON.parse(response));
        } else {
          callback(xhr.response);
        }
      }
    };
    xhr.send();
  }

  function enquote(value) {
    return "\"" + value + "\"";
  }

  var options = {
    // fonts are too unreliable in Safari
    excludeJsFonts: true,
    excludeFlashFonts: true,
    // anything relating to monitor (for cases where users switch to different monitor)
    excludeColorDepth: true,
    excludePixelRatio: true,
    excludeScreenResolution: true,
    excludeAvailableScreenResolution: true
  };

  var FP = '//cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/1.6.1/fingerprint2.min';

  var doIt = function(Fingerprint2) {
      var options = {
          // fonts are too unreliable in Safari
          excludeJsFonts: true,
          excludeFlashFonts: true,
          // anything relating to monitor (for cases where users switch to different monitor)
          excludeColorDepth: true,
          excludePixelRatio: true,
          excludeScreenResolution: true,
          excludeAvailableScreenResolution: true
      };

      new Fingerprint2(options).get(function(hash, components){
        console.log("fingerprint hash", hash); //a hash, representing your device fingerprint
        console.log("fingerprint components", components); // an array of FP components
        console.log("components serialized", JSON.stringify(components)); // an array of FP components

        getTenere(hash, function(response) {
          var test1 = "1. read should be null";
          var test2 = "2. write data";
          var test3 = "3. read should be equal to written data";
          var test4 = "4. override data";
          var test5 = "5. read should be equal to overridden data";
          if (response === null) {
            console.log(test1);
          } else {
            console.warn(test1, response);
          }

          var value1 = Math.random().toString(36).substring(7);
          setTenere(hash, value1, function() {
            console.log(test2, enquote(value1));

            getTenere(hash, function(response) {
              if (response.data === value1) {
                console.log(test3);
              } else {
                console.error(test3, enquote(response.data));
              }

              var value2 = Math.random().toString(36).substring(7);
              setTenere(hash, value2, function() {
                console.log(test4, enquote(value2));

                getTenere(hash, function(response) {
                  if (response.data === value2) {
                    console.log(test5);
                  } else {
                    console.error(test5, enquote(response.data));
                  }
                });
              });
            });
          });
        });
      });
      // new Fingerprint2(options).get(function(hash, components) {
      //     callback({hash: hash, components: JSON.stringify(components)});
      // });
  };

  if (typeof window.define === 'function' && window.define.amd) {
      // AMD
      require.config({
          paths: {
              Fingerprint2: FP
          }
      });
      require(['Fingerprint2'], function(Fingerprint2) {
          doIt(Fingerprint2);
      });
  } else {
      // load manually
      var gp = document.createElement('script');
      gp.type = 'text/javascript';
      gp.async = true;
      gp.src = FP + '.js';
      gp.onload = function() {
          doIt(window.Fingerprint2);
      };
      document.head.appendChild(gp);
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  test();
});
