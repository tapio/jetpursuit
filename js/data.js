var DATA = {
	"aircrafts": [
		{
			"name": "Air superiority fighter",
			"mesh": "F-22",
			"minSpeed": 80,
			"maxSpeed": 490,
			"turnRate": 1.8,
			"acceleration": 100,
			"maxHull": 115
		},{
			"name": "Interceptor",
			"mesh": "F-18",
			"minSpeed": 85,
			"maxSpeed": 540,
			"turnRate": 1.4,
			"acceleration": 130,
			"maxHull": 100
		},{
			"name": "Strike fighter",
			"mesh": "F-15",
			"minSpeed": 75,
			"maxSpeed": 480,
			"turnRate": 1.6,
			"acceleration": 90,
			"maxHull": 135
		},
	],
	"weapons": {
		"cannon": {
			"name": "Cannon",
			"flightTime": 1.5,
			"damage": 5,
			"delay": 0.1,
			"radius": 1,
			"speed": 150,
			"guided": false,
			"turnRate": 0
		},
		"sraam": {
			"name": "SRAAM",
			"flightTime": 10,
			"damage": 35,
			"delay": 0.2,
			"radius": 5,
			"speed": 100,
			"guided": true,
			"turnRate": 1.6
		},
		"mraam": {
			"name": "MRAAM",
			"flightTime": 15,
			"damage": 60,
			"delay": 1.0,
			"radius": 5,
			"speed": 100,
			"guided": true,
			"turnRate": 1.0
		}
	},
	"loadouts": [
		{
			"name": "Balanced",
			"ammo": {
				"cannon": 400,
				"sraam": 10,
				"mraam": 6
			}
		},{
			"name": "Dogfight",
			"ammo": {
				"cannon": 800,
				"sraam": 12,
				"mraam": 0
			}
		},{
			"name": "Long range",
			"ammo": {
				"cannon": 200,
				"sraam": 8,
				"mraam": 10
			}
		}
	]
};
