/**
 * Created by ian on 14/02/14.
 */
var scenario = {
    "vessels": [
        {
            "name": "Ownship",
            "categories": ["BLUE", "SURFACE", "WARSHIP"],
            "behaviours": [],
            "sonars": [
            ],
            "radiatedNoise": {
                "baseLevel": 90,
                "speedPattern": "Uniform"
            },
            "state": {
                "time": 0,
                "categories": [],
                "location": {"lat": 50, "lng": -8.2},
                "height": 0,
                "course": 90,
                "speed": 10,
                "demCourse": 90,
                "demSpeed": 10,
                "demHeight": -10.0
            },
            "perf": {
                "turnRadius": 1200.0,
                "accelerationRate": 0.3,
                "decelerationRate": 0.8,
                "minSpeed": 4,
                "maxSpeed": 40,
                "climbRate": 1,
                "diveRate": 2
            }
        },

    ],
    "patrolArea": [
        [50.15, -8.25],
        [49.85, -7.75]
    ],
    "environment": {},
    "objectives": [
        {"name": "Reach Targets", "type": "SEQUENCE", "children": [
            {"name": "Point A", type: "PROXIMITY", "location": {"lat":50,"lng": -8.06}, "range": 2000,
                "success": "Well done, now get to point B for some silly reason"},
            {"name": "Point B", type: "PROXIMITY", "location": {"lat":50.2,"lng": -8.20}, "range": 1000,
                "elapsed": 1500, "success": "Well done, you made it. Let's get the array fitted and move on",
                "failure": "Sorry, you missed your slow. You'll have to restart this mission"}
        ]}
    ],
    "features": {
        "type": "FeatureCollection", "features": [
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Point", "coordinates": [-8.06, 50]

                }, "id": "DestinationA"},
            {"type": "Feature",
                "properties": {"name": "Ops Area"},
                "geometry": {"type": "Point", "coordinates": [-8.20, 50.2]
                }, "id": "DestinationB"}
        ]
    }
};