(function() {
	function exitMenu() {
		$("#menu").fadeOut();
		$("#title").fadeOut();
		$(".fade-overlay").fadeOut();
		$(".hud").fadeIn();
	}

	$("#start").click(function() {
		params = {};
		params.gamemode = $("#gamemode").val();
		params.enemies = parseInt($("#enemies").val());
		params.allies = parseInt($("#allies").val());
		// TODO: These are rather horrible
		params.aircraft = DATA.aircrafts[parseInt($("#plane-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		params.loadout = DATA.loadouts[parseInt($("#loadout-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		exitMenu();
		start(params);
	});

	// Mission

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

	var randCount = Math.floor(Math.random() * 8) + 1;
	$("#enemies").val(randCount).trigger("change");
	$("#allies").val(randCount-1).trigger("change");

	$("#gamemode").change(function() {
		$(".gamemode-desc").hide();
		$("#gamemode-" + $(this).val()).show();
	});

	// Settings

	$("#particles").change(function() {
		JET.CONFIG.particles = parseFloat($(this).val());
	});
	$("#showStats").change(function() {
		JET.CONFIG.showStats = this.checked;
	});
	$("#showStats")[0].checked = JET.CONFIG.showStats;

})();
