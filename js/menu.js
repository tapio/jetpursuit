(function() {

	$("#instant").click(function() {
		$("#menu").fadeOut();
		$(".fade-overlay").fadeOut();
	});

	// Create

	function checkGameVars() {
		if (parseInt($("#enemies").val()) + parseInt($("#allies").val()) > 40)
			$("#players-warning").show();
		else $("#players-warning").hide();
	}

	$("#enemies").change(function() {
		$(this).next("output").html($(this).val());
		checkGameVars();
	});
	$("#allies").change(function() {
		$(this).next("output").html($(this).val());
		checkGameVars();
	});

	$("#to-create").click(function() { $('#menu a[href="#create"]').tab('show'); });
	$("#to-join").click(function() { $('#menu a[href="#join"]').tab('show'); });

	// Settings

	var particleLegend = [ "None", "Few", "Some", "Lots", "Insane" ];
	$("#particles").change(function() {
		$(this).next("output").html(particleLegend[$(this).val()]);
	});

})();
