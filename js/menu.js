(function() {

	function exitMenu() {
		$("#menu").fadeOut();
		$(".fade-overlay").fadeOut();
		$(".hud").fadeIn();
	}

	$("#instant").click(function() {
		exitMenu();
		start();
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

	$("#start-game").click(function() {
		params = {};
		params.enemies = parseInt($("#enemies").val());
		params.allies = parseInt($("#allies").val());
		// TODO: These are rather horrible
		params.aircraft = DATA.aircrafts[parseInt($("#plane-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		params.loadout = DATA.loadouts[parseInt($("#loadout-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		exitMenu();
		start(params);
	});

	// Settings

	var particleLegend = [ "None", "Few", "Some", "Lots", "Insane" ];
	$("#particles").change(function() {
		$(this).next("output").html(particleLegend[$(this).val()]);
	});

})();
