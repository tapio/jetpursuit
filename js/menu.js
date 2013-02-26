(function() {
	var hasWebGL;
	try {
		hasWebGL = !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
	} catch( e ) { hasWebGL = false; }
	if (!hasWebGL) $("#webgl-error").show();

	$("#again").click(function() {
		window.location.hash = "#new";
		window.location.reload();
	});

	// Home

	$("#play").click(function() {
		$("#home").hide();
		$("#menu").show();
	});

	if (window.location.hash == "#new")
		$("#play").trigger("click");

	// Menu shared

	function exitMenu() {
		$("#menu").fadeOut();
		$("#title").fadeOut();
		$(".fade-overlay").fadeOut();
		$(".hud").fadeIn();
	}

	$("#start").click(function() {
		var params = {};
		params.gamemode = $("#gamemode").val();
		params.enemies = parseInt($("#enemies").val());
		params.allies = parseInt($("#allies").val());
		// TODO: These are rather horrible
		params.aircraft = DATA.aircrafts[parseInt($("#plane-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		params.loadout = DATA.loadouts[parseInt($("#loadout-selector ul.nav li.active a").attr("href").split("-")[1]) - 1];
		params.identicalAircrafts = $("#identicalAircrafts")[0].checked;
		params.identicalLoadouts = $("#identicalLoadouts")[0].checked;
		exitMenu();
		start(params);
	});

	// Mission

	function checkGameVars() {
		if (parseInt($("#enemies").val()) + parseInt($("#allies").val()) > 30)
			$("#players-warning").fadeIn();
		else $("#players-warning").fadeOut();
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
		$("#gamemode-" + $(this).val()).fadeIn();
	});

	// Settings

	$("#particles").change(function() {
		JET.CONFIG.particles = parseFloat($(this).val());
	});
	$("#showStats").change(function() { JET.CONFIG.showStats = this.checked; });
	$("#sounds").change(function() { JET.CONFIG.sounds = this.checked; });
	$("#showStats")[0].checked = JET.CONFIG.showStats;
	$("#sounds")[0].checked = JET.CONFIG.sounds;

})();

function endScreen(pl) {
	$("#outcome").html(pl.hull > 0 ? "Victory!" : "Defeat");
	var stats = pl.prettyStats();
	var statItemTempl = '<ul>%NAME: %VALUE</ul>';
	var html = "";
	for (var i in stats) {
		html += statItemTempl.replace("%NAME", i).replace("%VALUE", stats[i]);
	}
	$("#results-stats").html(html);

	$(".fade-overlay").fadeIn();
	$("#results").fadeIn();
}
