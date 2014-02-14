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
                "minSpeed": 0,
                "maxSpeed": 40,
                "climbRate": 1,
                "diveRate": 2
            }
        }
    ],
    "patrolArea": [
        [50.15, -8.25],
        [49.85, -7.75]
    ],
    "environment": {},
    "objectives": [
        {"name": "Reach Targets", "type": "SEQUENCE", "children": [
            {"name": "Point A", type: "PROXIMITY", "location": {"lat":50,"lng": -8.06}, "range": 2000,
                "success": "Well done,blah, now get to within 1km of point B within 30 mins. " +
                    "You must be doing approx North course at under 3 knots to get your sonar clipped on.  " +
                    "There's quite a rush, you'll probably need to travel at about 20 knots"},
            {"name": "Point B", type: "PROXIMITY", "location": {"lat":50.2,"lng": -8.20}, "range": 1000,
                "elapsed": 1800, "course:":0, "courseError":10, "maxSpeed":3, "success": "Well done, you made it. Let's get the array fitted and move on",
                "failure": "Sorry, you didn't make it in time. You'll have to restart this mission"}
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