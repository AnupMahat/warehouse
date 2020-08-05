
//Highlights Stock that has reached Critical stock
$(function(){
  $('tbody tr').each(function(){
    var qty = parseInt($(this).find("td:eq(1)").text());
	var critical = parseInt($(this).find("td:eq(2)").text());
		if (qty < critical){
			$(this).addClass("critical");
			$(this).find("td:eq(4) a").removeClass("hide");
		}
  });
});


