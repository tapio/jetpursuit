(function() {

	// Create

	function checkGameVars() {
		//if (
	}

	$("#enemies").change(function() {
		$(this).next("output").html($(this).val());
	});
	$("#allies").change(function() {
		$(this).next("output").html($(this).val());
	});

	$("#to-create").click(function() { $('#menu a[href="#create"]').tab('show'); });
	$("#to-join").click(function() { $('#menu a[href="#join"]').tab('show'); });

	// Settings

	var particleLegend = [ "None", "Few", "Some", "Lots", "Insane" ];
	$("#particles").change(function() {
		$(this).next("output").html(particleLegend[$(this).val()]);
	});

})();
