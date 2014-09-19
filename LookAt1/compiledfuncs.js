mergeInto(LibraryManager.library, 
{

    windowResizeHandler: function(userData, resizeHandler)
    {
      var handlerFunc = function(event)
      {
        // windows.innerWidth/Height gives the size of the browser window area that shows HTML content, including the area under the scrollbars if they exist.
        // document.body.clientWidth/Height gives the size that the content takes up on the browser client area, excluding the scrollbars.
        // Therefore pass a slightly peculiar combo of these two to guarantee that a left-right scrollbar never appears if there is more than one screenful
        // of content in the page.
        Runtime.dynCall('viii', resizeHandler, [document.body.clientWidth-10, window.innerHeight, userData]);
      }
      window.addEventListener("resize", handlerFunc, true);
    }
}
);

mergeInto(LibraryManager.library,
{

    canvasWheelEvent: function(userData, wheelHandler)
    {
      var handlerFunc = function(event)
      {
          var e = window.event || e; // old IE support
          var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
          Runtime.dynCall('vii', wheelHandler, [delta, userData]);
      }
        var canvas = document.getElementById("canvas");

        canvas.addEventListener("mousewheel", handlerFunc, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", handlerFunc, false);}
}
);


