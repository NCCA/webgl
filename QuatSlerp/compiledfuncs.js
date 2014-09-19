mergeInto(LibraryManager.library, 
{

 setStartText: function( text)
 {
 	$( "#startQuat" ).text(Pointer_stringify(text));
 
 }
 
}
);

mergeInto(LibraryManager.library, 
{

 setEndText: function( text)
 {
 	$( "#endQuat" ).text(Pointer_stringify(text));
 
 }
 
}
);

mergeInto(LibraryManager.library, 
{

 setInterpText: function( text)
 {
 	$( "#interpQuat" ).text(Pointer_stringify(text));
 
 }
 
}
);

mergeInto(LibraryManager.library, 
{

 setRotMatrix: function( text)
 {
 	$( "#rotMatrix" ).text(Pointer_stringify(text));
 
 }
 
}
);
