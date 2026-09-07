// Load embedded data only for direct offline reading.
(function(){
  if(window.location.protocol==="file:"){
    document.write('<script src="./assets/offline-data.js?v=33"><\/script>');
  }
})();
