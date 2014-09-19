
$(document).ready(function ()
{

    $( "#interpValue" ).slider({ min: 0,
      max: 1001,
      value : 0 });

      
    var startX = $( "#startX" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
       
    var startY = $( "#startY" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
    
      var startZ = $( "#startZ" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
       var endX = $( "#endX" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
       
    var endY = $( "#endY" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
    
    var endZ = $( "#endZ" ).spinner({
    min : -360,
    max : 360,
    step: 0.5,
    numberFormat: "n",
    });
      
});




